const Booking = require('../models/booking-model')
const ParkingSpace = require('../models/parkingSpace-model')
const moment = require('moment')
const { validationResult } = require('express-validator')
const User = require('../models/users-model')
const sendEmail=require("../utilities/node-mailer/email")
const Queue = require('bull');
const _ = require('lodash')
const bookingCntrl = {}
function momentConvertion(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}
const calculateDuration = (startDateTime, endDateTime) => {
    const startDate = new Date(startDateTime)
    const endDate = new Date(endDateTime)
    const difference = endDate - startDate
    const durationHours = difference / (1000 * 60 * 60)
    return durationHours
}
bookingCntrl.booking = async (req, res) => {
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
    try {
        const id = req.user.id
        const parkingSpace = await ParkingSpace.find({ ownerId: id })
        if (!parkingSpace || parkingSpace.length === 0) {
            return res.status(404).json({ error: "you dont have listed parking space" })
        }
        const bookings = []
        for (const space of parkingSpace) {
            const bookingOfSpace = await Booking.find({ parkingSpaceId: space._id })
                .populate('customerId')
                .populate('vehicleId')
                .populate("parkingSpaceId")
            bookings.push(...bookingOfSpace)
        }
        console.log("spacebooking", bookings)
        res.status(200).json(bookings)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
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
async function processBookingExpiration(bookingId ) {
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


    bookingCntrl.accept = async (req,res,io) => {
        console.log(io,'ioooo')
        console.log(req.params.id,'idddd')
        const id = req.params.id;
        try {
            const booking = await Booking.findByIdAndUpdate({_id:id}, { $set: { approveStatus: true } }, { new: true })
                .populate({ path: 'customerId', select: 'email' })
                .populate({ path: 'parkingSpaceId', select: 'title' });
            sendEmail({
                email: booking.customerId.email,
                text: `Your booking for ${booking.parkingSpaceId.title} is approved. Click <a href="http://localhost:3000/bookings">here</a> to make payment.`,
                subject: "PickParking Slot Approval Status"
            });
    
            setTimeout(() => {
                processBookingExpiration(io,booking._id);
            }, 2 * 60 * 1000);
    
            res.status(201).json(booking);
        } catch (err) {
            console.error("Error accepting booking:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
    
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
        const booking = await Booking.findOneAndUpdate(id, { $set: { isRemoved: true } }, { new: true })
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
        const booking = await Booking.findOneAndUpdate({ _id: id }, { $set: { paymentStatus: "completed" } }, { new: true })
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
module.exports = bookingCntrl

