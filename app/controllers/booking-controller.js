const Booking = require('../models/booking-model')
const ParkingSpace = require('../models/parkingSpace-model')
const moment = require('moment')
const {validationResult}=require('express-validator')
const User = require('../models/users-model')
const sendEmail=require("../utilities/node-mailer/email")
const Queue = require('bull');
// const {emitBookingDeleted}=require("../utilities/node-mailer/socket/socket")
const bookingCntrl = {}
function momentConvertion(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}
// const bookingQueue = new Queue('bookingQueue', {
//     maxRetriesPerRequest: 50 // Adjust the value as needed
// });
// bookingQueue.process(async (job) => {
//     // Extract data from the job
//     const { bookingId, paymentDueTime } = job.data;
//     console.log(bookingId,'id')

//     try {
//         // Find the booking by ID
//         const booking = await Booking.findById(bookingId);

//         // Check if the booking exists, is approved, payment is not made, and it's past the payment due time
//         if (booking && booking.approveStatus && !booking.paidStatus && moment().isSameOrAfter(paymentDueTime)) {
//             // Delete the booking if conditions are met
//             await Booking.findByIdAndRemove(bookingId);
//             console.log(`Booking ${bookingId} removed due to non-payment.`);
//         }
//     } catch (error) {
//         // Log and handle errors
//         console.error(`Error processing job ${job.id}:`, error);
//         // Throw the error to let Bull handle retries
//         throw error;
//     }
// });


bookingCntrl.booking = async (req, res) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const parkingSpaceId = req.params.parkingSpaceId
    const spaceTypesId = req.params.spaceTypesId
    const body = req.body
    const booking = new Booking(body)
    booking.parkingSpaceId = parkingSpaceId
    booking.spaceTypesId = spaceTypesId
    booking.customerId = req.user.id

    try {
        const parkingSpace=await ParkingSpace.findById(parkingSpaceId).populate('ownerId')
        await booking.save() 
        const bookings=await Booking.findOne({_id:booking._id}).populate("parkingSpaceId").populate("vehicleId","vehicleName")
        sendEmail({
        email:parkingSpace.ownerId.email,
        text:`${parkingSpace.ownerId.name} your parking space is booked customer is waiting for approval.`,
        subject:"pickparking customer approval status"
        })
        res.status(200).json(bookings)
    } catch (err) {
        console.log(err)
        res.status(401).json({ error: "internal server error" })
    }
}


bookingCntrl.list = async (req, res) => {
    const id = req.params.id
    try {
        const booking = await Booking.findById(id)
        res.json(booking)
    } catch (err) {
        res.json({ error: "internal server error" })
        console.log(err)
    }
}

bookingCntrl.findSpace = async (req, res) => {
    const { startDateTime, endDateTime } = req.query
    const parkingSpaceId = req.params.parkingSpaceId
    const spaceTypeId = req.params.spaceTypeId

    // const momentStartDateTime = moment('2034-04-09 14:30', 'YYYY-MM-DD HH:mm').utc();
    // const momentEndDateTime = moment('2034-04-09 16:30','YYYY-MM-DD HH:mm').utc();
    const momentStartDateTime = moment(startDateTime,'YYYY-MM-DD HH:mm').utc();
    const momentEndDateTime = moment(endDateTime,'YYYY-MM-DD HH:mm').utc();
    // console.log(momentStartDateTime)
    // console.log(momentEndDateTime)
    // console.log(momentStartDateTime.toDate())
    // console.log(momentEndDateTime.toDate())

    try {
         const parkingSpace=await ParkingSpace.findById(parkingSpaceId)
         if(!parkingSpace){
            return res.status(404).json({error:"parking space is not found"})
         }
        //  console.log(parkingSpace)
        const booking = await Booking.find({parkingSpaceId:parkingSpaceId,spaceTypesId:spaceTypeId,
            $or: [
                {
                    $and: [
                        { startDateTime: { $gte: momentStartDateTime.toDate() } },
                        { startDateTime: { $lt: momentEndDateTime.toDate() } }
                    ]
                },
                {
                    $and: [
                        { endDateTime: { $gt: momentStartDateTime.toDate() } },
                        { endDateTime: { $lte: momentEndDateTime.toDate() } }
                    ]
                },
                {
                    $and: [
                        { startDateTime: { $lte: momentStartDateTime.toDate() } },
                        { endDateTime: { $gte: momentEndDateTime.toDate() } }
                    ]
                }
            ]
        })
        const spaceType=parkingSpace.spaceTypes.find((ele)=>{
            if(ele._id == spaceTypeId){
                return ele
            }
        })
        console.log(spaceType)
        console.log(booking.length)
        const numberOfBooking=booking.length
        const availableSpace= spaceType.capacity - numberOfBooking
        console.log(availableSpace)
        if(availableSpace ==0){
            return res.status(404).json({error:"Space is not available"})
        }   
        res.json(availableSpace)
    } catch (err) {
        console.log(err)
        res.json({ error: "internal server error" })
    }
}

bookingCntrl.myParkingSpace=async(req,res)=>{
       try{
        const id=req.user.id
        const parkingSpace=await ParkingSpace.findOne({ownerId:id})
        
        if(!parkingSpace){
            return res.status(404).json({error:"you dont have listed parking space"})
        }
        const bookings=await Booking.find({parkingSpaceId:parkingSpace._id}).populate('customerId').populate('vehicleId')
        res.status(201).json(bookings)

       }catch(err){
        res.status(500).json({error:"internal server error"})
       }
}

bookingCntrl.MyBookings=async(req,res)=>{
    try{
        const response=await Booking.find({customerId:req.user.id}).populate("parkingSpaceId").populate("vehicleId","vehicleName")
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(501).json({error:"server error"})
    }
}
async function processBookingExpiration(bookingId,io ) {
        try {
            const booking = await Booking.findById(bookingId);
            if (booking && booking.approveStatus && booking.paymentStatus=="pending" ) {
                await Booking.findOneAndDelete(bookingId);
                console.log(`Booking ${bookingId} removed due to non-payment.`);
                io.emit("bookingId",{id:bookingId})
            }
        } catch (error) {
            console.error(`Error processing booking ${bookingId}:`, error);
        }
    }

bookingCntrl.accept = async (io,req, res) => {
    const { id: bookingId } = req.params;

    try {
        const booking = await Booking.findByIdAndUpdate(bookingId, { $set: { approveStatus: true } }, { new: true })
            .populate({ path: 'customerId', select: 'email' })
            .populate({ path: 'parkingSpaceId', select: 'title' });
            console.log(booking,'bbbbb')
        // const paymentDueTime = moment().add(1, 'minutes').toDate();
        // console.log(booking,'booking')
        // console.log(new Date(paymentDueTime),'time')
        // await bookingQueue.add({ bookingId, paymentDueTime }, { delay: 1 * 60 * 1000 });
        sendEmail({
            email: booking.customerId.email,
            text: `Your booking for ${booking.parkingSpaceId.title} is approved. Click <a href="http://localhost:3000/bookings">here</a> to make payment.`,
            subject: "PickParking Slot Approval Status"
        });
        setTimeout(() => {
                        processBookingExpiration(booking._id,io);
                    }, 2 * 60 * 1000);

        res.status(201).json(booking);
    } catch (err) {
        console.error("Error accepting booking:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = bookingCntrl
