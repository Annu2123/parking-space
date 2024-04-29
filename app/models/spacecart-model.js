const mongoose=require("mongoose")
const {Schema,model}=mongoose
const spaceCartSchema=new Schema({
    parkingSpace:{
        type:Schema.Types.ObjectId,
        ref:"ParkingSpace"
    },
    customer:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})
const SpaceCart=model("SpaceCart",spaceCartSchema)
module.exports=SpaceCart