const Vehicle=require('../models/vehicle-model')
const vehicleCntrl={}
vehicleCntrl.list=async(req,res)=>{
    const body=req.body
    const vehicle=new Vehicle(body)
    vehicle.customerId=req.user.id
    try{
      await vehicle.save()
      res.json(vehicle)
    }catch(err){
        res.json({error:"internal server error"})
    }
}
module.exports=vehicleCntrl