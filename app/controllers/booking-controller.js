const Booking = require('../models/booking-model')
const ParkingSpace = require('../models/parkingSpace-model')
const moment = require('moment')

const bookingCntrl = {}
function momentConvertion(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}


bookingCntrl.booking = async (req, res) => {
    const parkingSpaceId = req.params.parkingSpaceId
    const spaceTypesId = req.params.spaceTypesId
    const body = req.body
    const booking = new Booking(body)
    booking.parkingSpaceId = parkingSpaceId
    booking.spaceTypesId = spaceTypesId
    booking.customerId = req.user.id

    try {
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
    console.log(momentStartDateTime)
    console.log(momentEndDateTime)
    console.log(momentStartDateTime.toDate())
    console.log(momentEndDateTime.toDate())

    try {
         
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
        console.log(booking)
        res.json(booking)
    } catch (err) {
        console.log(err)
        res.json({ error: "internal server error" })
    }
}
module.exports = bookingCntrl