const Vehicle=require("../models/vehicle-model")
const {validationResult}=require("express-validator")
const _=require("lodash")
const vehicleCtlr={}
vehicleCtlr.create=async(req,res)=>{
  console.log(req.body)
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    const body=req.body
    const vehicle=new Vehicle(body)
    console.log(req.files,'f')
    const documents=req.file
    vehicle.documents=documents.filename
     vehicle.customerId=req.user.id
    try{
        const response=await vehicle.save()
        res.status(201).json(response)
    }catch(err){
        console.log(err)
    }
}
vehicleCtlr.list=async(req,res)=>{
    try{
        const response=await Vehicle.find({customerId:req.user.id}).sort({createdAt:-1})
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(401).json({errors:"server errors"})
    }
}
vehicleCtlr.remove=async(req,res)=>{
    const id=req.params.id
    console.log(id)
    try{
        const response=await Vehicle.findOneAndDelete({customerId:req.user.id,_id:id})
        res.status(201).json(response)
    }catch(err){
        console.log(err)
    }
}
vehicleCtlr.update=async(req,res)=>{
    console.log(req.body,'body')
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    const id=req.params.id
    const body=_.pick(req.body,["name","vehicleType","vehicalNumber","documents"])
    try{
        const response=await Vehicle.findOneAndUpdate({userId:req.user.id,_id:id},body,{new:true})
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(401).json({error:"internal server error"})
    }
}
module.exports=vehicleCtlr