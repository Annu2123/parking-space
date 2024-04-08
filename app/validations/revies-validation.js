const reviesValidation={
    parkingSpaceId:{
        in:['params'],
        exist:"parkingspace id is require",
        isMongoId:{
            errorMessage:"parkingspace id is require"
        }
    },
    bookingId:{
        in:['params'],
        exist:"bookingId is require",
        isMongoId:{
            errorMessage:"bookingId id is mongoId"
        }
    },
    review:{
        notEmpty:{
            errorMessage:"enter review"
        },
        isString:{
            errorMessage:'revies content must be a string'
         },
         islength:{
            options:{min:10,max:250}
         }
    },
    rating:{
        notEmpty:{
            errorMessage:"enter review"
        },
        isNumber:{
            errorMessage:'rating must be a number'
         },
         islength:{
            options:{min:1,max:5}
         }
        
    }
}
module.exports={reviesValidation}