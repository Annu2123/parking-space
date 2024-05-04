const {Schema,model}=require('mongoose')
const vehicleSchema=new Schema({
    customerId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    vehicleNumber:String,
    vehicleName:String,
    documents:String,
    vehicleType:String,
    vehicleImage:String,
    isVerified:{
        type:Boolean,
        default:false
    }

},{timestamps:true})
const Vehicle=model("Vehicle",vehicleSchema)
module.exports=Vehicle