require('dotenv').config()
const http = require('http');
const socketIo = require('socket.io');
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { checkSchema } = require('express-validator')
const configDb = require('./config/db')
const nodeCronCtlr=require("./app/node-cron/bookingStatus")
nodeCronCtlr()
configDb()
const {
    userRegisterSchemaValidation,
    usersLoginSchema,
    usersForgotPasswordSchema,
    usersSetPasswordSchema,
    userOtpValidation,
    usersupdatePasswordValidationSchema
} = require('./app/validations/user-validation')
const { ParkingSpaceSchemaValidation, parkingSpaceApproveValidarion } = require('./app/validations/parkingSpace-validation')
const { reviesValidation } = require('./app/validations/revies-validation')
const vehicleValidationSchema = require("./app/validations/vehicle-validation")
const {bookingParkingSpaceValidation}=require('./app/validations/booking-validation')

const { authenticateUser, authorizeUser } = require('./app/middlewares/auth')

const usersCntrl = require('./app/controllers/user-controller')
const parkingSpaceCntrl = require('./app/controllers/parkingSpace-controllers')
const reviewsController = require('./app/controllers/revies-controller')
const vehicleCtlr = require("./app/controllers/vehivle-controller")
const bookingCntrl = require('./app/controllers/booking-controller')
const paymentsCntrl=require('./app/controllers/payment-controller')
const spaceCartCtlr=require('./app/controllers/spacecart-controller')
const app = express()
const port = 3045
const server = http.createServer(app);
   const  io = socketIo(server, {
        cors: {
            origin: "*",  
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
    });
app.use(cors())
app.use(express.json())
app.use('/uploads',express.static('uploads'))
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
//user Apis
app.post('/api/users/register', checkSchema(userRegisterSchemaValidation), usersCntrl.register)
app.put("/api/verify/emails", checkSchema(userOtpValidation), usersCntrl.verifyEmail)
app.post('/api/users/login', checkSchema(usersLoginSchema), usersCntrl.login)
app.put("/API/update/password", authenticateUser, checkSchema(usersupdatePasswordValidationSchema), usersCntrl.updatePassword)// updatePassword
app.get('/api/users/accounts', authenticateUser, usersCntrl.accounts)
app.post("/api/users/forgotpassword", checkSchema(usersForgotPasswordSchema), usersCntrl.forgotPassword)
app.put("/api/users/setforgotpassword", checkSchema(usersSetPasswordSchema), usersCntrl.setFogotPassword)

//Owner apis
app.post('/api/parkingSpace/Register', authenticateUser, authorizeUser(["owner"]),checkSchema( ParkingSpaceSchemaValidation),upload.single('image'),parkingSpaceCntrl.register)
app.get('/api/parkingSpace/my', authenticateUser, authorizeUser(["owner","admin"]), parkingSpaceCntrl.mySpace)
app.delete('/api/parkingSpace/:id', authenticateUser, authorizeUser(["owner"]), parkingSpaceCntrl.remove)
app.put('/api/parkingSpace/update/:id',authenticateUser,authorizeUser(["owner"]),parkingSpaceCntrl.update) 
app.get('/api/myParkingSpace/booking',authenticateUser,authorizeUser(["owner"]),bookingCntrl.myParkingSpace)
app.put('/api/approve/booking/:id',authenticateUser,authorizeUser(['owner']),bookingCntrl.accept)
app.put('/api/reject/booking/:id',authenticateUser,authorizeUser(['owner']),bookingCntrl.rejectBooking)
app.delete('/api/parkingSpace/remove/:id',authenticateUser,authorizeUser(['owner']),parkingSpaceCntrl.remove)
app.put('/api/parkingSpace/disable/:id',authenticateUser,authorizeUser(['owner','admin']),parkingSpaceCntrl.disable)
app.get('/api/booking/today',authenticateUser,authorizeUser(["owner"]),bookingCntrl.todayBooking)
app.get('/api/current/booking',authenticateUser,authorizeUser(['owner']),bookingCntrl.currentBooking)

//admin routes
app.get('/api/parkingSpace',authenticateUser,authorizeUser(['admin']), parkingSpaceCntrl.list)
app.get('/api/owner',authenticateUser,authorizeUser(["admin"]),usersCntrl.listOwner)
app.get('/api/customer',authenticateUser,authorizeUser(["admin"]),usersCntrl.listCustomer)
app.put('/api/parkingSpace/approve/:id', authenticateUser, authorizeUser(['admin']), checkSchema(parkingSpaceApproveValidarion), parkingSpaceCntrl.approve)
//app.get('/api/parkingSpace/approvalList',authenticateUser,authorizeUser(["admin"]),parkingSpaceCntrl.approvalList)
app.get('/api/allBooking',authenticateUser,authorizeUser(["admin"]),bookingCntrl.listBookings)
//get all parking space within radius
app.get('/api/parkingSpace/radius', parkingSpaceCntrl.findByLatAndLog)

//find avaialble parking spacet
app.get('/api/parkingSpace/:parkingSpaceId/spaceType/:spaceTypeId', bookingCntrl.findSpace)

//vehicle api's
app.post("/API/vehicle/register", authenticateUser, authorizeUser(["customer"]), checkSchema(vehicleValidationSchema),upload.single('documents'), vehicleCtlr.create)//vehicle create
app.get("/API/vehicles/list", authenticateUser, authorizeUser(["customer"]), vehicleCtlr.list)//vehicles list
app.put("/API/vehicles/update/:id", authenticateUser, authorizeUser(["customer"]), checkSchema(vehicleValidationSchema), upload.single('documents'),vehicleCtlr.update)//vehicles update
app.put("/api/vehicle/approval/:id",authenticateUser,authorizeUser(['admin']),vehicleCtlr.approve)
app.delete("/API/vehicles/remove/:id", authenticateUser, authorizeUser(["customer"]), vehicleCtlr.remove)//vehicles remove

// revies api's
app.post("/api/booking/:bookingId/parkingSpace/:parkingSpaceId", authenticateUser, authorizeUser(["customer"]), checkSchema(reviesValidation), reviewsController.create)//create review
app.get("/api/reviews/list", authenticateUser, reviewsController.list)//list of all reviews
app.get("/api/reviews/space/:id", authenticateUser, authorizeUser(["owner"]), reviewsController.spaceReview)//listing based on space
app.delete("/api/reviews/remove/:id", authenticateUser, authorizeUser(["customer"]), reviewsController.remove)//remove review
app.put("/api/reviews/update/:id", authenticateUser, authorizeUser(["customer"]), reviewsController.update)

//booking of parking space
app.post('/api/booking/:parkingSpaceId/spaceTypes/:spaceTypesId', authenticateUser, authorizeUser(["customer"]),checkSchema(bookingParkingSpaceValidation), bookingCntrl.booking)
app.get('/api/booking/my/:id', bookingCntrl.list)
app.get("/api/bookings/list",authenticateUser,authorizeUser(["customer"]),bookingCntrl.MyBookings)

app.put('/api/approve/booking/:id',authenticateUser,authorizeUser(['owner']),(req,res)=>{
    bookingCntrl.accept(io,req,res)
})

//spcaecart api's
app.post ("/api/spaceCarts/create/:id",authenticateUser,authorizeUser(["customer"]),spaceCartCtlr.create)
app.delete("/api/spacecart/delete/:id",authenticateUser,authorizeUser(["customer"]),spaceCartCtlr.remove)
app.get("/api/spacecart/list",authenticateUser,authorizeUser(["customer"]),spaceCartCtlr.list)


app.get('/api/owners/query',authenticateUser,authorizeUser(["admin"]),usersCntrl.findOwners)
app.put('/api/booking/payment/update/:id',bookingCntrl.updatePayment)
app.put('/api/booking/payment/failer/:id',bookingCntrl.paymentFailerUpdate)
//payment api's
app.post('/api/create-checkout-session',paymentsCntrl.pay)
app.put('/api/payment/status/update/:id' , paymentsCntrl.successUpdate)
app.put('/api/payment/failer/:id',paymentsCntrl.failerUpdate)
app.listen(port, () => {

    console.log("server is running in " + port)
})
