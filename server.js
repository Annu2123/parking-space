require('dotenv').config()
const express=require('express')
const cors=require('cors')
const multer=require('multer')
const{checkSchema}=require('express-validator')
const configDb=require('./config/db')

// app.use('/uploads',express.static('uploads'))
configDb()
const {userRegisterSchemaValidation,usersLoginSchema}=require('./app/validations/user-validation')
const {ParkingSpaceSchemaValidation,parkingSpaceApproveValidarion}=require('./app/validations/parkingSpace-validation')
const {reviesValidation}=require('./app/validations/revies-validation')
const {bookingParkingSpaceValidation}=require('./app/validations/booking-validation')

const {authenticateUser, authorizeUser}=require('./app/middlewares/auth')

const usersCntrl=require('./app/controllers/user-controller')
const parkingSpaceCntrl=require('./app/controllers/parkingSpace-controllers')
const reviesCntrl=require('./app/controllers/revies-controller')
const vehicleCntrl=require('./app/controllers/vehivle-controller')
const bookingCntrl=require('./app/controllers/booking-controller')
const paymentsCntrl=require('./app/controllers/payment-controller')
const app=express()
const port=3045
 app.use(cors())
 app.use(express.json())

 const storage=multer.diskStorage(
   {
       destination:function (req,file,cb){
           return cb(null,"./uploads")
       },
       filename:function(req,file,cb){
           return cb(null,`${Date.now()}-${file.originalname}`)
       }
   }
)
const upload=multer({storage})
app.use('/uploads',express.static('uploads'))

//user Apis
 app.post('/api/users/register',checkSchema(userRegisterSchemaValidation),usersCntrl.register)
 app.post('/api/users/login',checkSchema(usersLoginSchema),usersCntrl.login)
 app.get('/api/users/accounts',authenticateUser,usersCntrl.accounts)
 app.delete('/api/users/:id',authenticateUser,authorizeUser(["admin"]),usersCntrl.remove)

 //email varification
 app.post('/api/verify/email',usersCntrl.verifyEmail)

 //parking space apis
 app.post('/api/parkingSpace/Register',authenticateUser,authorizeUser(["owner"]),upload.single('image'),parkingSpaceCntrl.register)
 app.get('/api/parkingSpace/my',authenticateUser,authorizeUser(["owner"]),parkingSpaceCntrl.mySpace)
 app.delete('/api/parkingSpace/:id',authenticateUser,authorizeUser(["owner"]),parkingSpaceCntrl.remove)
 app.get('/api/parkingSpace',parkingSpaceCntrl.list)
 app.put('/api/parkingSpace/approve/:id',authenticateUser,authorizeUser(['admin']),checkSchema(parkingSpaceApproveValidarion),parkingSpaceCntrl.approve)
 
 //get all parking space within radius
 app.get('/api/parkingSpace/radius',parkingSpaceCntrl.findByLatAndLog)

 //find avaialble parking space
 app.get('/api/parkingSpace/:parkingSpaceId/spaceType/:spaceTypeId',bookingCntrl.findSpace)

 //listing of vehicle
 app.post('/api/vehicle',authenticateUser,authorizeUser(["customer"]),vehicleCntrl.list)
 //creating of revies
 app.post('/api/revies/:parkingSpaceId',authenticateUser,authorizeUser(['customer']),checkSchema(reviesValidation),reviesCntrl.create)


 //booking of parking space
 app.post('/api/booking/:parkingSpaceId/:spaceTypesId',authenticateUser,authorizeUser(["customer"]),checkSchema(bookingParkingSpaceValidation),bookingCntrl.booking)
 app.get('/api/booking/my/:id',bookingCntrl.list)

//payment apis
app.post('/api/create-checkout-session',paymentsCntrl.pay)
app.listen(port,()=>{
    console.log("server is running in " +port)
 })