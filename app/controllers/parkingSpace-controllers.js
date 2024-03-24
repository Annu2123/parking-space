const { validationResult }=require ("express-validator")
const Booking =require('../models/booking-model')
const _ =require('lodash')
const ParkingSpace=require("../models/parkingSpace-model")
const parkingSpaceCntrl={}
parkingSpaceCntrl.register=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    // const body=req.body
    // const parkingSpace=new ParkingSpace(body)
   
    const body=_.pick(req.body,["title","image","amenities","spaceTypes","propertyType","description","address"])
    try{
         const parkingSpace=await ParkingSpace.create({...body,ownerId:req.user.id})
       
        // const slots = []
        // for (let i = 0; i < Number( parkingSpace.capacity); i++) {
        //     const slot = new Slot({
        //        parkingSpaceId:parkingSpace._id,
        //        start_time:null,
        //        end_time:null,
               
        //     });
        //     slots.push(slot)
        // }
        // await Slot.insertMany(slots)
        res.status(201).json(parkingSpace)
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
parkingSpaceCntrl.mySpace=async(req,res)=>{
    try{
        const parkingSpace=await ParkingSpace.find({ownerId:req.user.id})
        res.status(201).json(parkingSpace)
    }catch(err){
        res.status(401).json({error:"internal server error"})
    }
}
parkingSpaceCntrl.approve=async(req,res)=>{
    const id =req.params.id
    const body=req.body
    try{
        const space=await ParkingSpace.findOneAndUpdate({_id:id},body)
        res.status(201).json(space)
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
parkingSpaceCntrl.remove=async(req,res)=>{
    const id=req.params.id
    try{
   const parkingSpace=await ParkingSpace.findOneAndDelete({_id:id,ownerId:req.user.id})
   const slots=await Slot.deleteMany({parkingSpaceId:id})
   res.status(200).json({parkingSpace,slots})
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
parkingSpaceCntrl.list=async (req,res)=>{
    try{
           const parkingSpace=await ParkingSpace.find()
           res.status(201).json(parkingSpace)
    }catch{
        res.status(404).json({error:'internal server error'})
    }
}
parkingSpaceCntrl.findSpace=async(req,res)=>{
    const { date, startTime, endTime } = req.query
    
         // Convert date and time strings to Date objects
    // const startDateTime = new Date(date + 'T' + startTime);
    // const endDateTime = new Date(date + 'T' + endTime);
        console.log(date, startTime, endTime)
        console.log(startTime,endTime)
        try{
            const existedBooking=await Booking.findOne({status:"pending",startDateTime:startTime,endDateTime:endTime})
                res.json(existedBooking)
        }catch(err){
            res.status(401).json({error:"internal server error"})
        } 
}
module.exports=parkingSpaceCntrl