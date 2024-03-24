const {Schema,model}=require('mongoose')
const bookingParkingSpaceSchema=new Schema({
    parkingSpaceId:{
        type:Schema.Types.ObjectId,
        ref:"ParkingSpace"
    },
    spaceTypesId:{
        type:Schema.Types.ObjectId,
        ref:"ParkingSpace"
    },
    customerId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    vehicleId:{
        type:Schema.Types.ObjectId,
         ref:"Vehicle"
    },
    status:{
        type:String,
        default:"pending"
    },
    date:Date,
    startDateTime:String,
    endDateTime:String,
    amount:Number,
    paymentStatus:{
        type:String,
        default:"pending"
    }
},{timestamps:true})
const Booking=model("Booking",bookingParkingSpaceSchema)
module.exports=Booking