const Booking =require('../models/booking-model')
const ParkingSpace=require('../models/parkingSpace-model')
const bookingCntrl={}
bookingCntrl.booking=async(req,res)=>{
    const parkingSpaceId=req.params.parkingSpaceId
    const spaceTypesId=req.params.spaceTypesId
    const body=req.body
    const booking=new Booking(body)
    booking.parkingSpaceId=parkingSpaceId
    booking.spaceTypesId=spaceTypesId
    booking.customerId=req.user.id
    try{
        // const existedBooking=await Booking.find({})
        await booking.save()
        res.status(200).json(booking)
    }catch(err){
        res.status(401).json({error:"internal server error"})
    }
}
module.exports=bookingCntrl