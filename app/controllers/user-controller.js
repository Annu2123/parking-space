const User=require('../models/users-model')
const jwt=require('jsonwebtoken')
const bcryptjs=require('bcryptjs')
const {validationResult}=require('express-validator')
const usersCntrl={}
usersCntrl.register=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body =req.body
    try{
     const user=new User(body)
    const salt=await bcryptjs.genSalt()
    const encryptedPassword= await bcryptjs.hash(user.password,salt)
    user.password=encryptedPassword
    // const adminCount=await User.findOne({role:"admin"})
    // console.log(adminCount)
    // if(adminCount ){
    //     return res.status(401).json({error:"admin cannot be more than one"})
    // }
    await user.save() 
    res.status(201).json(user)
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
usersCntrl.login=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(402).json({errors:errors.array()})
    }
    const body=req.body
    try{
        const user=await User.findOne({email:body.email})
        if(!user){
            return res.status(404).json({error:"email or password wrong"})
        }
       const password=await bcryptjs.compare(body.password,user.password)
       if(!password){
        return res.status(401).json({error:"email or password is wrong"})
       }
       const tokenData={
        id:user._id,
        role:user.role
       }
       const token=jwt.sign(tokenData,process.env.SECRET_JWT,{expiresIn:"12d"})
       res.status(200).json({token:token})
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
usersCntrl.accounts=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select({password:0})
        res.status(200).json(user)

    }catch(err){
        res.status(401).json({error:"internal server error"})
    }
}
usersCntrl.remove=async(req,res)=>{
    const id=req.params.id
    try{
       const user=await User.findOneAndDelete({_id:id})
       res.status(200).json(user)
    }catch(err){
        res.status(401).json({error:"internal server errro"})
    }
}
module.exports=usersCntrl