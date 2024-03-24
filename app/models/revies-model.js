const {Schema,model}=require('mongoose')
const reviesSchema=new Schema({

    customerId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    parkingSpaceId:{
        type:Schema.Types.ObjectId,
        ref:"parkingSpace"
    },
    review:String,
    rating:Number
},{timestamp:true})
const Revies=model("Revies",reviesSchema)
module.exports=Revies