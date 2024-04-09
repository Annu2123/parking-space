const  Booking = require("../models/booking-model")

const paymentValidationSchema={
    bookingId:{
        notEmpty: {
          errorMessage: "invoice ID is empty",
        },
        isMongoId: {
          errorMessage: "Invalid ID format",
        }
    },
    custom: {
        //checks wheather id found in database
        options: async (value, { req, res }) => {
          const id = req.body.bookingId
          
          const findId = await Booking.findById(id)
          if (findId) {
            return true
          } else {
            throw new Error("Booking Id not found")
          }
        }
      },
      amount:{
        notEmpty:{
            errorMessage:'Amount cannot be empty'
        },
        custom: {
            //checks wheather amount matches to specific booking
            options: async (value, { req, res }) => {
              const id = req.body.bookingId
              const amount = req.body.amount
              const findBooking = await Booking.findById(id)
              if (findBooking.amount == amount) {
                return true
              } else {
                throw new Error("Invalid amount")
              }
            }
        }   
    }
}
module.exports=paymentValidationSchema