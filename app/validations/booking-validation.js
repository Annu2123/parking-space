

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
    spaceTypesId:{
        in:["params"],
        exist:{
            errorMessage:" space type id is require"
        },
        isMongoId:{
            errorMessage:" spcae type id should be mongodb id"
        }
    },
    vehicleId:{
       notEmpty:{
        errorMessage:"vehicle Id is require"
       },
        isMongoId:{
            errorMessage:"parking spcae id should be mongodb id"
        }
    },
    startDateTime:{
        notEmpty:{
            errorMessage:"start time is require"
        },
        // isDate:{
        //     format: ['YYYY-MM-DDTHH:MM:SS'],
        //     errorMessage:"start DateTime must be a date type"
        //  },
        custom:{
            options:function (value){
                if(new Date(value)>= new Date()){
                    return true
                }else{
                    throw new Error(" date should be greater than todays date")
                }

            }
        }
    },
    endDateTime:{
        notEmpty:{
            errorMessage:"send  time is require"
        },
        // isDate:{
        //     format: ['YYYY-MM-DDTHH:mm:ss'],
        //     errorMessage:"endDateTime must be a date type"
        //  },
     custom:{
        options:function(value, {req}){
            if(new Date(value)> new Date(req.body.startDateTime)){
                return true
            }else{
                throw new Error(" enddate should be greater than startdate date") 
            }
        }
     }
   },
    // paymentStatus:{
    //     notEmpty:{
    //         errorMessage:"paymentStatus is require"
    //     },
    //      isIn:[["pending","completed","cancel"]],
    //      errorMessage:"chhose only from a option",
    // },
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