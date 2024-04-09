const {Schema,model}=require('mongoose')
const userRegisterSchema=new Schema({
    name:String,
    email:String,
    phone:Number,
    password:String,
    role:String,
<<<<<<< HEAD
    isverified:{
        type:Boolean,
        default:false
    },
    otp:Number
=======
    otp:Number,
    isverified:{
        type:Boolean,
        default:false

    }
>>>>>>> 072ab9b737f161dd57936ef0bf5eadb3b6512aa7
       
    
},{timestamps:true})
const User=model('User',userRegisterSchema)
module.exports=User