const {Schema,model}=require('mongoose')
const slotSchema=new Schema({
   parkingSpaceId:{
    type:Schema.Types.ObjectId,
    ref:'ParkingSpace'
   },
   start_time:Number,
   end_time:Number,
   status:{
    type:String,
    default:'available'
   }
})
const Slot=model('Slot',slotSchema)
module.exports=Slot