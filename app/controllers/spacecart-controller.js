const SpaceCart=require("../models/spacecart-model")
const spaceCartCtlr={}
spaceCartCtlr.create=async(req,res)=>{
    const spacecart=new SpaceCart()
    spacecart.customer=req.user.id
    spacecart.parkingSpace=req.params.id
    try{
        const cart=await SpaceCart.findOne({customer:req.user.id,parkingSpace:req.params.id})
       if(cart){
        return res.status(401).json({error:"alredy saved in cart"})
       }
        await spacecart.save()
        res.status(201).json(spacecart)
    }catch(err){
        console.log(err)
        res.status(501).json({error:"internal server error"})
    }
}
spaceCartCtlr.remove=async(req,res)=>{
    try{
        const response=await SpaceCart.findOneAndDelete({_id:req.params.id,customer:req.user.id})
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(501).json({error:"internal server error"})
    }
}
spaceCartCtlr.list=async(req,res)=>{
    try{
        const response =await SpaceCart.find({customer:req.user.id}).populate("parkingSpace")
        res.status(201).json(response)
    }catch(err){
        console.log(err)
        res.status(501).json({error:"internal server error"})
    }
}
module.exports=spaceCartCtlr