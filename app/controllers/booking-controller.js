const Booking = require('../models/booking-model')
const ParkingSpace = require('../models/parkingSpace-model')
const moment = require('moment')
const { validationResult } = require('express-validator')
const User = require('../models/users-model')

const sendEmail = require("../utilities/node-mailer/email")
const Queue = require('bull');

const _ = require('lodash')

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

const calculateDuration = (startDateTime, endDateTime) => {
    const startDate = new Date(startDateTime)
    const endDate = new Date(endDateTime)
    const difference = endDate - startDate
    const durationHours = difference / (1000 * 60 * 60)
    return durationHours
}
bookingCntrl.booking = async (req, res) => {
    //console.log('io' , io)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const parkingSpaceId = req.params.parkingSpaceId
    const spaceTypesId = req.params.spaceTypesId
    // const body = req.body
    // const booking = new Booking(body)
    try {
        const parkingSpace = await ParkingSpace.findById(parkingSpaceId).populate('ownerId')
        if (!parkingSpace) {
            return res.status(400).json({ error: "parking space not fount" })
        }
        const body = _.pick(req.body, ["startDateTime", "endDateTime", "vehicleId"])
        const booking = new Booking(body)
        booking.parkingSpaceId = parkingSpaceId
        booking.spaceTypesId = spaceTypesId
        booking.customerId = req.user.id
        const spaceType = parkingSpace.spaceTypes.find((ele) => {
            if (ele._id == spaceTypesId) {
                return ele
            }
        })
        const totalAmount = spaceType.amount * calculateDuration(booking.startDateTime, booking.endDateTime)
        console.log(totalAmount,'tot')
        booking.amount = Math.floor(totalAmount).toFixed(0);

        await booking.save()
        const bookings = await Booking.findOne({ _id: booking._id }).populate("parkingSpaceId").populate("vehicleId", "vehicleName")
        sendEmail({
            email: parkingSpace.ownerId.email,
            text: `${parkingSpace.ownerId.name} your parking space is booked customer is waiting for approval.`,
            subject: "pickparking customer approval status"
        })
       // io.to(parkingSpace.ownerId.toString()).emit('bookingUpdate' , bookings)
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
    console.log(startDateTime)
    console.log(endDateTime)
    // const momentStartDateTime = moment('2034-04-09 14:30', 'YYYY-MM-DD HH:mm').utc();
    // const momentEndDateTime = moment('2034-04-09 16:30','YYYY-MM-DD HH:mm').utc();
    const momentStartDateTime = moment(startDateTime, 'YYYY-MM-DD HH:mm').utc();
    const momentEndDateTime = moment(endDateTime, 'YYYY-MM-DD HH:mm').utc();
    console.log(momentStartDateTime)
    console.log(momentEndDateTime)
    // console.log(momentStartDateTime.toDate())
    // console.log(momentEndDateTime.toDate())

    try {
        const parkingSpace = await ParkingSpace.findById(parkingSpaceId)
        if (!parkingSpace) {
            return res.status(404).json({ error: "parking space is not found" })
        }
        //  console.log(parkingSpace)
        const booking = await Booking.find({
            parkingSpaceId: parkingSpaceId, spaceTypesId: spaceTypeId,
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
        const spaceType = parkingSpace.spaceTypes.find((ele) => {
            if (ele._id == spaceTypeId) {
                return ele
            }
        })
        // console.log(spaceType)
        // console.log(booking.length)
        const numberOfBooking = booking.length
        const availableSpace = spaceType.capacity - numberOfBooking
        console.log(availableSpace)
        if (availableSpace == 0) {
            return res.status(404).json({ error: "Space is not available" })
        }
        spaceType.capacity = availableSpace
        res.json(spaceType)
    } catch (err) {
        console.log(err)
        res.json({ error: "internal server error" })
    }
}

bookingCntrl.myParkingSpace = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    console.log(page, limit);
    try {
        const id = req.user.id;
        const parkingSpace = await ParkingSpace.find({ ownerId: id });
        if (!parkingSpace || parkingSpace.length === 0) {
            return res.status(404).json({ error: "you don't have listed parking space" });
        }
        
        const allBookings = [];
        const bookings = [];

        for (const space of parkingSpace) {
            const bookingOfSpace = await Booking.find({ parkingSpaceId: space._id })
            .populate('customerId')
            .populate('vehicleId')
            .populate("parkingSpaceId")
            allBookings.push(...bookingOfSpace);

            const paginatedBookings = await Booking.find({ parkingSpaceId: space._id }).skip((page - 1) * limit).limit(limit)
                .populate('customerId')
                .populate('vehicleId')
                .populate("parkingSpaceId")
            bookings.push(...paginatedBookings)
        }

        res.status(200).json({ bookings, allBookings })
    } catch (err) {
        res.status(500).json({ error: "internal server error" });
    }
}


bookingCntrl.MyBookings = async (req, res) => {
    try {
        const response = await Booking.find({ customerId: req.user.id }).populate("parkingSpaceId").populate("vehicleId").sort({ createdAt:-1 })
        res.status(201).json(response)
    } catch (err) {
        console.log(err)
        res.status(501).json({ error: "server error" })
    }
}
async function processBookingExpiration(bookingId, io) {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.approveStatus && booking.paymentStatus == "pending") {
            await Booking.findOneAndDelete(bookingId);
            console.log(`Booking ${bookingId} removed due to non-payment.`);
            io.emit("bookingId", { id: bookingId })
        }
    } catch (error) {
        console.error(`Error processing booking ${bookingId}:`, error);
    }
}
bookingCntrl.accept = async (req, res, io) => {
    const id = req.params.id
    console.log(id)
    try {
        const booking = await Booking.findByIdAndUpdate({ _id: id }, { $set: { approveStatus: true } }, { new: true })

            .populate({ path: 'customerId', select: 'email' })
            .populate({ path: 'parkingSpaceId', select: 'title' });
        console.log(booking, 'bbbbb')
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
            processBookingExpiration(booking._id, io);
        }, 2 * 60 * 1000);


        res.status(201).json(booking);
    } catch (err) {
        console.error("Error accepting booking:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }

}
bookingCntrl.listBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ approveStatus: true, paymentStatus: "success" })
        res.status(202).json(bookings)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}
bookingCntrl.adminList=async(req,res)=>{
    const id=req.params.id
    try{
        const response=await Booking.find({customerId:id})
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(err).json({error:"internal server error"})
    }
}
bookingCntrl.rejectBooking = async (req, res) => {
    const id = req.params.id
    try {      
        const booking = await Booking.findOneAndUpdate({_id:id}, { $set: { status: "cancel"} }, { new: true })
            .populate("customerId")
            .populate("vehicleId")
            .populate("parkingSpaceId")
        res.status(200).json(booking)

    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}
bookingCntrl.updatePayment = async (req, res) => {
    const id = req.params.id
    console.log(id,'iiiiiiiii')
    try {
        const booking = await Booking.findOneAndUpdate({ _id: id }, { $set: { paymentStatus: "success" } }, { new: true })
        res.status(200).json(booking)
    } catch (err) {
        res.status(500).json({ error: "interna; server error" })
    }
}
bookingCntrl.paymentFailerUpdate = async (req, res) => {
    const id = req.params.id
    try {
        const booking = await Booking.findByIdAndUpdate({ _id: id }, { $set: { paymentStatus: 'failed' } }, { new: true })
        res.status(200).json(booking)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}
bookingCntrl.todayBooking = async (req, res) => {
    // const id = req.params.id
    const ownerId=req.user.id
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(),today.getMinutes());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1)
    console.log(startOfDay)
    console.log(endOfDay)
    try {
        const parkingSpace = await ParkingSpace.find({ ownerId:ownerId})
        //  console.log(parkingSpace)
        if (!parkingSpace || parkingSpace.length === 0) {
            return res.status(404).json({ error: "you dont have listed parking space" })
        }
        const todayBookings = []
        for (const space of parkingSpace) {
            const bookingOfSpace = await Booking.find({ parkingSpaceId: space._id,approveStatus: true,paymentStatus:"success" ,endDateTime: {
                $gte: startOfDay,
                $lt: endOfDay}})
                .populate('customerId')
                .populate('vehicleId')
                .populate("parkingSpaceId")
            todayBookings.push(...bookingOfSpace)
        }
        // console.log(todayBookings)
        // const booking = await Booking.find( { parkingSpaceId: id, approveStatus: true,paymentStatus:"success",startDateTime: {
        //     $gte: startOfDay,
        //     $lt: endOfDay
        //   }}).populate("customerId").populate("parkingSpaceId")
        res.status(201).json(todayBookings)
    } catch (err) {
        res.status(500).json({ error: "internal server errro" })
    }
}
bookingCntrl.currentBooking=async(req,res)=>{
    const ownerId=req.user.id
    const today = new Date()
    const currentHour = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(),today.getMinutes());
    //const EndCurrentTime = new Date(today.getFullYear(), today.getMonth(), today.getDate().today.getHours()+1,0,0)
    // console.log(startOfDay)
    // console.log(endOfDay)
    try {
        const parkingSpace = await ParkingSpace.find({ ownerId:ownerId})
        //  console.log(parkingSpace)
        if (!parkingSpace || parkingSpace.length === 0) {
            return res.status(404).json({ error: "you dont have listed parking space" })
        }
        const currentBookings = []
        for (const space of parkingSpace) {
            const bookingOfSpace = await Booking.find({ parkingSpaceId: space._id,approveStatus: true,paymentStatus:"success",
            startDateTime: { $lte: today },
            endDateTime: { $gte: today }
                
        })  
                .populate('customerId')
                .populate('vehicleId')
                .populate("parkingSpaceId")
            currentBookings.push(...bookingOfSpace)
        }
        res.status(201).json(currentBookings)
    } catch (err) {
        res.status(500).json({ error: "internal server errro" })
    }
}
bookingCntrl.currentBookingRequest=async(req,res)=>{
    const ownerId=req.user.id
    const today=new Date()
    try{
        const parkingSpace = await ParkingSpace.find({ ownerId:ownerId})
         console.log(parkingSpace)
        if (!parkingSpace || parkingSpace.length === 0) {
            return res.status(404).json({ error: "you dont have listed parking space" })
        }
        const currentBookingsRequest = []
        for (const space of parkingSpace) {
            const bookingOfSpace = await Booking.find({ parkingSpaceId: space._id,approveStatus:false,paymentStatus:"pending",
            startDateTime: { $gte: today }           
        })  
                .populate('customerId')
                .populate('vehicleId')
                .populate("parkingSpaceId")
            currentBookingsRequest.push(...bookingOfSpace)
        }
        res.status(202).json(currentBookingsRequest)
    }catch(err){
        res.status(500).json({error:"internal server error"})
    }

}
module.exports = bookingCntrl

