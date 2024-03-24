const Revies=require('../models/revies-model')
const {validationResult}=require('express-validator')

const reviesCntrl={}
reviesCntrl.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const parkingSpaceId=req.params.parkingSpaceId
    const body=req.body
    const revies=new Revies(body)
    revies.parkingSpaceId=parkingSpaceId
    revies.customerId=req.user.id
    try{
       await revies.save()
       res.status(201).json(revies)
    }catch{
        res.status(500).json({errors:"internal server error"})
    }
}
module.exports=reviesCntrl