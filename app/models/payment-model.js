const {Schema,model}=require('mongoose')
const paymentSchema=new Schema ({
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:"Booking"
    },
    customer:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    transactionId:{
        type:String,
         default:null
    },
    paymentType:String,
    amount:Number,
    paymentStatus:{
        type:String,
        enum: ['pending', 'Successful','Failed'],
        default:"pending"
    }
},{timestamps:true})
const Payment =model("Payment",paymentSchema)
module.exports=Payment