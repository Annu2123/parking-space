const {Schema,model}=require('mongoose')
const userRegisterSchema=new Schema({
    name:String,
    email:String,
    phone:Number,
    password:String,
    role:String,
    isverified:{
        type:Boolean,
        default:false
    },
    otp:Number
       
    
},{timestamps:true})
const User=model('User',userRegisterSchema)
module.exports=User