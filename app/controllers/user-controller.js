const User=require('../models/users-model')
const jwt=require('jsonwebtoken')
const bcryptjs=require('bcryptjs')
const _=require("lodash")
const sendEmail=require('../utilities/node-mailer/email')
const {validationResult}=require('express-validator')

//otp functiion to send otp
const generateOtp=()=>{
    const otp=Math.round(Math.random()*10000)
    console.log(otp)
    return otp
    
}
const usersCntrl={}
usersCntrl.register=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body =req.body
    const otp1=generateOtp()
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
   
    user.otp=otp1
    await user.save() 
    sendEmail({
        email:user.email,
        text:`you have registerd with us , please verify your email with otp ${user.otp}`
    })
    res.status(201).json(user)
    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
usersCntrl.verifyEmail = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(401).json({ errors: errors.array() })
    }
    const { email, otp } = req.body
    try {
        const user = await User.findOneAndUpdate({ email: email, otp: otp }, { $set: { isverified: true } }, { new: true })
        console.log(user)
        if (!user) {
            return res.status(401).json("email and otp is not currect")
        }
        res.status(201).json("email verified")
    } catch (err) {
        console.error("Error verifying email:", err);
        res.status(500).json({ error: "Internal Server Error" })
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
//updating password
usersCntrl.updatePassword=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    const id=req.user.id
    const data=_.pick(req.body,["oldPassword","newPassword","changePassword"])
    try{
        const user = await User.findOne({_id:id})
        if(!user){
            return res.status(401).json({error:"user not found"})
        }
        const result= await bcryptjs.compare(data.oldPassword,user.password,)
        if(!result){
            return res.status(401).json({error:"your old password is not matching"})
        }
        if(data.newPassword==data.changePassword){
            const salt=await bcryptjs.genSalt()
            const hashPassword=await bcryptjs.hash(data.newPassword,salt)
           const response=await User.findOneAndUpdate({_id:req.user.id},{password:hashPassword},{new:true})
           return res.status(200).json(response)
        }else{
            return  res.status(401).json({error:" new password are not matching"})       
        }
    }catch(err){
        console.log(err)

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
usersCntrl.forgotPassword=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(402).json({errors:errors.array()})
    }
    const {email}=_.pick(req.body,["email"])
    try{
        const user=await User.findOne({email:email})
        if(!user){
            return res.status(401).json({error:"email not found"})
        }
        const otp=generateOtp()
        const response=await User.findOneAndUpdate({email:email},{otp:otp},{new:true})
        sendEmail({
            email: user.email,
            subject: "EVENT_SPOT@ <support> Password Change",
            text: `set password with otp ${otp}
             don't share otp to any one`
        })
        res.status(201).json({ status: "success", msg: "sent success " })
    }catch(err){
    console.log(err)
    }
}
//set forgotpassword
usersCntrl.setFogotPassword=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(402).json({errors:errors.array()})
    }
    const{email,otp,password}=_.pick(req.body,["email","otp","password"])
    try{
        const salt=await bcryptjs.genSalt()
        const hashPassword=await bcryptjs.hash(password,salt)
        const user=await User.findOneAndUpdate({email:email,otp:otp},{password:hashPassword},{new:true})
        res.status(201).json(user)
    }catch(err){
        console.log(err)
        res.status(501).json({error:"internal server error"})
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

//email verification
usersCntrl.verifyEmail = async (req, res) => {
    // const errors = validationResult(req)
    // if (!errors.isEmpty()) {
    //     res.status(401).json({ errors: errors.array() })
    // }
    const { email, otp } = req.body
    try {
        const user = await User.findOneAndUpdate({ email: email, otp: otp }, { $set: { isverified: true } }, { new: true })
        if (!user) { 
            return res.status(401).json("email and otp is not currect")
        }
        res.status(201).json("email verified")
    } catch (err) {
        console.error("Error verifying email:", err);
        res.status(500).json({ error: "Internal Server Error" })
    }
}
module.exports=usersCntrl