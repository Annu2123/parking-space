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
        isLength:{
            options:{min:8,max:20},
            errorMessage:"length must be greater than 8 and less 20 char"
        },
        isAlphanumeric:{
            errorMessage:"password should contain alpha numeric charactor"
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
        isLength:{
            options:{min:8,max:20},
            errorMessage:"length should greater than 8 and less than 20"
        }
    }
}
module.exports={userRegisterSchemaValidation,usersLoginSchema}