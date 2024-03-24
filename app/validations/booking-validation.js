
const bookingParkingSpaceValidation={
    parkingSpaceId:{
        in:["params"],
        exist:{
            errorMessage:"parking space id is require"
        },
        isMongoId:{
            errorMessage:"parking spcae id should be mongodb id"
        }
    },
    slotId:{
        in:["params"],
        exist:{
            errorMessage:"parking space id is require"
        },
        isMongoId:{
            errorMessage:"parking spcae id should be mongodb id"
        }
    },
    vehicleId:{
        in:["params"],
        exist:{
            errorMessage:"parking space id is require"
        },
        isMongoId:{
            errorMessage:"parking spcae id should be mongodb id"
        }
    },
    start_time:{
        notEmpty:{
            errorMessage:"start time is require"
        },

    },
    end_time:{
     notEmpty:{
        errorMessage:"end date is require "
     }
    },
    paymentStatus:{
        notEmpty:{
            errorMessage:"paymentStatus is require"
        },
         isIn:[["pending","completed","cancel"]],
         errorMessage:"chhose only from a option",
     },
     amount:{
        notEmpty:{
            errorMessage:"amount is require"
        },
        isNumeric:{
            errorMessage:"amount should be number"
        }
     }
}
module.exports={bookingParkingSpaceValidation}