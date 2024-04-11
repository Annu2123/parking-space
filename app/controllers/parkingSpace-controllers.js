const { validationResult } = require("express-validator")
const Booking = require('../models/booking-model')
const _ = require('lodash')
const { isPointWithinRadius } = require('geolib')
const ParkingSpace = require("../models/parkingSpace-model")
const parkingSpaceCntrl = {}


parkingSpaceCntrl.register = async (req,res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }
    // const body=req.body
    // const parkingSpace=new ParkingSpace(body)
    
    const body = _.pick(req.body,["title","image","amenities","spaceTypes","propertyType","description","address"])
    const parkingSpace=new ParkingSpace(body)
    const image=req.file
    parkingSpace.image=image.filename
    parkingSpace.ownerId=req.user.id
    try {
        //const parkingSpace = await ParkingSpace.create({ ...body, ownerId: req.user.id })
         await parkingSpace.save()
        // const slots = []
        // for (let i = 0; i < Number(parkingSpace.capacity); i++) {
        //     const slot = new Slot({
        //        parkingSpaceId:parkingSpace._id,
        //        start_time:null,
        //        end_time:null,

        //     });
        //     slots.push(slot)
        // }
        // await Slot.insertMany(slots)
        res.status(201).json(parkingSpace)
    } catch (err) {
        res.status(400).json({ error: "internal server error" })
        console.log(err.message)
    }
}


parkingSpaceCntrl.mySpace = async (req, res) => {
    try {
        const parkingSpace = await ParkingSpace.find({ ownerId: req.user.id })
        res.status(201).json(parkingSpace)
    } catch (err) {
        res.status(401).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.approve = async (req, res) => {
    const id = req.params.id
    const body = req.body
    try {
        const space = await ParkingSpace.findOneAndUpdate({ _id: id }, body, { new: true })
        res.status(201).json(space)
    } catch (err) {
        res.status(400).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.remove = async (req, res) => {
    const id = req.params.id
    try {
        const parkingSpace = await ParkingSpace.findOneAndDelete({ _id: id, ownerId: req.user.id })
        const slots = await Slot.deleteMany({ parkingSpaceId: id })
        res.status(200).json({ parkingSpace, slots })
    } catch (err) {
        res.status(400).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.list = async (req, res) => {
    try {
        const parkingSpace = await ParkingSpace.find()
        console.log(parkingSpace)
        res.status(201).json(parkingSpace)
    } catch {
        res.status(404).json({ error: 'internal server error' })
    }
}


const transformToObj = (coordinates) => {
    return { latitude: coordinates[0], longitude: coordinates[1] }
}


parkingSpaceCntrl.findByLatAndLog = async (req, res) => {
    const { lat, log, radius } = req.query
    const centerCoordinates = {
        latitude: lat,
        longitude: log
    }
    try {
        const parkingSpace = await ParkingSpace.find({ approveStatus: true })
        console.log("1")
        // const filteredParkingSpace = parkingSpace.filter(space =>
        //     isPointWithinRadius(space.coordinates, { lat: parseFloat(lat), log: parseFloat(log) }, parseInt(radius))
        // )
        const filteredParkingSpace = parkingSpace.filter(ele => {
            // console.log(ele.coordinates)
            // console.log(centerCoordinates)
            // console.log(radius)
            const r = {
                latitude: parseFloat(centerCoordinates.latitude),
                longitude: parseFloat(centerCoordinates.longitude)
            }
            return isPointWithinRadius(transformToObj(ele.address.coordinates), r, radius*1000)
        })
        res.json(filteredParkingSpace)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal serv er error" })
    }
}



module.exports = parkingSpaceCntrl