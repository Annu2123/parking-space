const vehicleValidationSchema={
    vehicleType:{
        in:["body"],
        notEmpty:{
            errorMessage:"vehicleType is required"
        }
    },
    vehicleNumber:{
        notEmpty:{
            errorMessage:"vehicle number is required"
        }

    },
    documents:{
        notEmpty:{
            errorMessage:"documents are required"
        }
    }
}
module.exports=vehicleValidationSchema