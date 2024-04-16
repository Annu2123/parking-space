const vehicleValidationSchema={
    vehicleType:{
        in:["form-data"],
        notEmpty:{
            errorMessage:"vehicleType is required"
        }
    },
    vehicleNumber:{
        in:["form-data"],
        notEmpty:{
            errorMessage:"vehicle number is required"
        }

    },
    documents:{
        in:["form-data"],
        notEmpty:{
            errorMessage:"documents are required"
        }
    }
}
module.exports=vehicleValidationSchema