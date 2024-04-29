const spaceCartValidation={
    ParkingSpace:{
        in:["params"],
        notEmpty:{
            errorMessage:"parkingSpaceId is required"
        },
        isMongoId:{
            errorMessage:"parking spcae id should be mongodb id"
        }
    },
    customer:{
        notEmpty:{
            errorMessage:"parkingSpaceId is required"
        },
        isMongoId:{
            errorMessage:"customerId should be mongodb id"
        }

    }
}
module.exports=spaceCartValidation