const { otpvalidationSchema } = require("../../../pickParking/back-end/app/validations/userSchemaValidation")
const User = require("../models/users-model")

const userRegisterSchemaValidation={
    name:{
        notEmpty:{
            errorMessage:"name is require"
        },
        isLength:{
            options:{min:1,max:20}
        }
    },
    email:{
        notEmpty:{
            errorMessage:"email is require"
        },
        trim:true,
        normalizeEmail:true,
        isEmail:{
            errorMessage:"require valide email formate"
        },
        custom:{
            options:async function (value){
               const user=await User.findOne({email:value})
               if(!user){
                return true
               }else{
                throw new Error('email already exist')
               }
            }
        }
    },
    phone:{
        notEmpty:{
            errorMessage:"phone is require"
        },
        isNumeric:{
            errorMessage:"phone number should be number type"
        },
        isLength:{
            options:{min:10,max:10},
            errorMessage:"phone number should be 10 digit only"
        },
        custom:{
            options:async function(value){
                const user=await User.findOne({phone:value})
                if(!user){
                    return true 
                }else{
                    throw new Error("phone number already exist")
                }
            }
        }
    },
    password:{
        notEmpty:{
            errorMessage:"password is require"
        },
        isStrongPassword:{
            options:[{ minLowercase: 1,
              minUppercase: 1,minNumbers:2,minSymbols:1}],
              errorMessage:"password must contain 2 uppercase 2 lower case 2 min numbersand atleast one symbol"
          },
          isLength:{
              options:[{min:5,max:128}],
              errorMessage:"password length must be in between 5 to 128 long "
          }
    },
    role:{
        notEmpty:{
            errorMessage:"role is require"
        },
        isIn:{
            options:[["customer","owner","admin"]]
        }
    }
}
const usersLoginSchema={
    email:{
        notEmpty:{
            errorMessage:"email require"
        },
        trim:true,
        normalizeEmail:true,
        isEmail:{
            errorMessage:"should be valide email"
        }
    },
    password:{
        notEmpty:{
            errorMessage:"paasowrd is require"
        },
        isStrongPassword:{
            options:[{ minLowercase: 1,
              minUppercase: 1,minNumbers:2,minSymbols:1}],
              errorMessage:"password must contain 2 uppercase 2 lower case 2 min numbersand atleast one symbol"
          },
          isLength:{
              options:[{min:5,max:128}],
              errorMessage:"password length must be in between 5 to 128 long "
          }
    }
}
 const usersForgotPasswordSchema={
    email:{
        errorMessage:"mail is required"
    },
    trim:true,
    normalizeEmail:true,
    isEmail:{
        errorMessage:"require valide email formate"
    },
}
 const usersSetPasswordSchema={
    email:{
        notEmpty:{
            errorMessage:"email require"
        },
        trim:true,
        normalizeEmail:true,
        isEmail:{
            errorMessage:"should be valide email"
        }
    },
    password:{
        notEmpty:{
            errorMessage:"paasowrd is require"
        },
        isStrongPassword:{
            options:[{ minLowercase: 1,
              minUppercase: 1,minNumbers:2,minSymbols:1}],
              errorMessage:"password must contain 1 uppercase 1 lower case 2 min numbersand atleast one symbol"
          },
          isLength:{
              options:[{min:5,max:128}],
              errorMessage:"password length must be in between 5 to 128 long "
          }
    },
    otp:{
        notEmpty:{
            errorMessage:"otp is required"
        },
        isLength:{
            options:{min:4,max:4},
            errorMessage:"length should 4 digits"
        }

    }
    
}
 const userOtpValidation={
    email:{
        notEmpty:{
            errorMessage:"email require"
        },
        trim:true,
        normalizeEmail:true,
        isEmail:{
            errorMessage:"should be valide email"
        }
    },
    otp:{
        notEmpty:{
            errorMessage:"otp is required"
        },
        isLength:{
            options:{min:4,max:4},
            errorMessage:"length should 4 digits"
        }

    }

}
usersupdatePasswordValidationSchema={
    oldPassword:{
        notEmpty:{
            errorMessage:"old password is required"
        },
    },
    newPassword:{
        notEmpty:{
            errorMessage:"paasowrd is require"
        },
        isStrongPassword:{
            options:[{ minLowercase: 1,
              minUppercase: 1,minNumbers:2,minSymbols:1}],
              errorMessage:"password must contain 2 uppercase 2 lower case 2 min numbersand atleast one symbol"
          },
          isLength:{
              options:[{min:5,max:128}],
              errorMessage:"password length must be in between 5 to 128 long "
          }
    },
    changePassword:{
        notEmpty:{
            errorMessage:"paasowrd is require"
        },
        isStrongPassword:{
            options:[{ minLowercase: 1,
              minUppercase: 1,minNumbers:2,minSymbols:1}],
              errorMessage:"password must contain 2 uppercase 2 lower case 2 min numbersand atleast one symbol"
          },
          isLength:{
              options:[{min:5,max:128}],
              errorMessage:"password length must be in between 5 to 128 long "
          }
    }
    }
module.exports={
    userRegisterSchemaValidation,
    usersLoginSchema,
    usersForgotPasswordSchema,
    usersSetPasswordSchema,
    userOtpValidation,
    usersupdatePasswordValidationSchema
}