const Booking = require('../models/booking-model')
const ParkingSpace = require('../models/parkingSpace-model')
const moment = require('moment')
const {validationResult}=require('express-validator')
const User = require('../models/users-model')

const bookingCntrl = {}
function momentConvertion(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}


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
        const parkingSpace=await ParkingSpace.findById(parkingSpaceId)
        const owner=await User.findById(parkingSpace.ownerId)
        console.log(parkingSpace)
        console.log(owner)
        console.log(parkingSpace.ownerId)
        await booking.save() 
        res.status(200).json(booking)
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
        const parkingSpace=await ParkingSpace.findById(id)
        if(!parkingSpace){
            return res.status(404).json({error:"you dont have listed parking space"})
        }
        const bookings=await Booking.find({parkingSpaceId:parkingSpace._id})
        res.status(201).json(bookings)

       }catch(err){
        res.status(500).json({error:"internal server error"})
       }
}
module.exports = bookingCntrl