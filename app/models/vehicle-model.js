const {Schema,model}=require('mongoose')
const vehicleSchema=new Schema({
    customerId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    vehicleName:String,
    documents:String,
    vehicleType:String,
    isVerified:{
        type:Boolean,
        default:false
    }

},{timestamps:true})
const Vehicle=model("Vehicle",vehicleSchema)
module.exports=Vehicle