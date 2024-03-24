const reviesValidation={
    parkingSpaceId:{
        in:['parmas'],
        exist:"parkingspace id is require",
        isMongoId:{
            errorMessage:"parkingspace id is require"
        }
    },
     isString:{
        errorMessage:'revies content must be a string'
     },
     islength:{
        options:{min:10,max:100}
     }
}
module.exports={reviesValidation}