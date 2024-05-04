const { validationResult } = require("express-validator")
const Booking = require('../models/booking-model')
const axios =require('axios')
const _ = require('lodash')
const { isPointWithinRadius } = require('geolib')
const ParkingSpace = require("../models/parkingSpace-model")
const parkingSpaceCntrl = {}

function reverseLatLon(arr) {
    return [arr[1], arr[0]]
  }

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
       console.log(parkingSpace.address.area)
       const response=await  axios.get(`https://api.geoapify.com/v1/geocode/search?text=${parkingSpace.address.area}&apiKey=4a35345ee9054b188d775bb6cef27b7c`)
       
        parkingSpace.address.coordinates=reverseLatLon(response.data.features[0].geometry.coordinates)
         await parkingSpace.save()
        res.status(201).json(parkingSpace)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
        console.log(err.message)
    }
}

parkingSpaceCntrl.update=async(req,res)=>{
    const id=req.params.id
    // const errors=validationResult(req)
    // if(!errors.isEmpty()){
    //      return res.status(400).json({errors:errors.array()})
    // }
    try{
        const parkingSpace=await ParkingSpace.findById({_id:id,ownerId:req.user.id})
        if(!parkingSpace){
            return res.status(404).json({error:"parkingSpace not found for you"})
        }
        const body=_.pick(req.body,["title","amenities","spaceTypes","propertyType","description","address"])
        const spaceBody=new ParkingSpace(body)
        spaceBody.ownerId=req.user.id
        const response=await  axios.get(`https://api.geoapify.com/v1/geocode/search?text=${parkingSpace.address.area}&apiKey=4a35345ee9054b188d775bb6cef27b7c`)  
        spaceBody.address.coordinates=reverseLatLon(response.data.features[0].geometry.coordinates)
        const updatedSpace=await ParkingSpace.findOneAndUpdate({_id:id},{new:true})
        res.status(202).json(updatedSpace)
    }catch(err){
        res.status(500).json({error:"internal server error"})
    }
}
parkingSpaceCntrl.mySpace = async (req, res) => {
    try {
        const parkingSpace = await ParkingSpace.find({ ownerId: req.user.id })
        res.status(200).json(parkingSpace)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.approve = async (req, res) => {
    const id = req.params.id
    try {
        // const admin=await User.findOne({_id:req.user.id})
        // if(!admin){
        //     res.status(401).json({error:"unauthorised"})
        // }
        const space = await ParkingSpace.findOneAndUpdate({ _id: id }, {$set:{approveStatus:true}}, { new: true })
        res.status(201).json(space)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.disable = async (req, res) => {
    const id = req.params.id
    try {
        // const owner=await User.findOne({_id:req.user.id})
        // if(!owner){
        //     res.status(401).json({error:"unauthorised"})
        // }
        const parkingSpace=await ParkingSpace.findById({_id:id,ownerId:req.user.id})
        console.log(parkingSpace)
        if(!parkingSpace){
            res.status(404).json({error:"parking Space not found"})
        }
        // const value=!parkingSpace.activeStatus
        const space = await ParkingSpace.findOneAndUpdate({ _id: id }, {$set:{activeStatus:!parkingSpace.activeStatus}}, { new: true })
        res.status(201).json(space)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}

parkingSpaceCntrl.remove = async (req, res) => {
    const id = req.params.id
    try {
        const parkingSpace = await ParkingSpace.findOneAndDelete({ _id: id, ownerId: req.user.id })      
        res.status(200).json(parkingSpace)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
}


parkingSpaceCntrl.list = async (req, res) => {
    try {
        const parkingSpace = await ParkingSpace.find().populate("ownerId")
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
        const parkingSpace = await ParkingSpace.find({ approveStatus: true ,activeStatus:true})
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

// parkingSpaceCntrl.approvalList=async(req,res)=>{
//     const adminId=req.user.id
//     try{
        // const admin=await User.findById(adminId)
        // if(!admin){
        //     res.status(404).json({error:"admin details not found"})
        // }
        // console.log("asdf")
        // const approve=await ParkingSpace.find({approveStatus:false}).populate('ownerId')
        // res.status(202).json(approve)

//     }catch(err){
//         res.status(500).json({error:"intnal server error"})
//     }
// }

module.exports = parkingSpaceCntrl