const ParkingSpaceSchemaValidation={
    title:{
        notEmpty:{
            errorMessage:"title is require"
        },

        escape:true
    },
    // ownerId:{
    //     notEmpty:{
    //         errorMessage:"ownerId is require"
    //     },
    //     isMongoId:{
    //         errorMessage:"id should be a mongodb id"
    //     }
    // },
    image:{
        notEmpty:"image is require"
    },
    spaceTypes:{
       custom:{
        options:function (value){
           
            if(!Array.isArray(value)){
                     throw new Error("spacetypes should be array types")
            } 
            if(value.length ==0){
                throw new Error("array must have more than 1 value")
            }
            value.forEach((space)=>{
                if(Object.keys(space).length !=3){
                     throw new Error("array of object hsould have 3 propertirs")
                }
                if(typeof space != 'object'){
                    throw new Error("array value should be a object")
                }
                if(typeof space.types != 'string'){
                    throw new Error("type should be string")
                }
                if(typeof space.capacity !='number'){
                    throw new Error("type should be number")
                }
                if(typeof space.amount !='number'){
                    throw new Error("type should be amount")
                }
                if(["two-wheeler","four-wheeler"].includes(space.types)){
                    throw new Error("type should only two wheeler or four wheeler")
                }
            })
            return true
        }
       }
        // isNumeric:{
        //     errorMessage:"capacity should be number type"
        // }
    },
    amenities:{
        notEmpty:{
            errorMessage:"amenities is require"
        },
        isIn:{
            options:[["covered","opendoor"]]
        }
    },
    // address:{
    //     notEmpty:{
    //         errorMessage:"address is require"
    //     },
    //     custom:{
    //         options:function (value){
    //             if(typeof value !='object'){
    //                 throw new Error("it should be object")
    //             }
    //             if(Object.keys(value).length !=6){
    //                 throw new Error("their must be 2 properties")
    //             }
    //             if(typeof value.street !="string"){
    //                 throw new Error("street must be a string")
    //             }
    //             if(typeof value.area !="string"){
    //                 throw new Error("area must be a string")
    //             }
    //             if(typeof value.city !="string"){
    //                 throw new Error("city must be a string")
    //             }
    //             if(typeof value.state !="string"){
    //                 throw new Error("state must be a string")
    //             }
    //             if(!Array.isArray(value.coordinates)){
    //                 throw new Error("coordinates should be a array")
    //             }
    //             if(value.coordinates.length !=2){
    //                 throw new Error("coordinates must have only 2 values")
    //             }
    //             if(typeof value.coordinates[0] != 'number'){
    //                 throw new Error("coordinates only have number type value")
    //             }
    //             if( typeof value.coordinates[1] !='number'){
    //                 throw new Error("coordinates only have number type value")
    //             }
    //             return true
    //         }
    //     }
    // },
   
    propertyType:{
        notEmpty:{
            errorMessage:" propertytype is require"
        },
        isIn:{
            options:[["independence_house","gated_apartment"]]
        }
    }

}
parkingSpaceApproveValidarion={
    approveStatus:{
        notEmpty:{
            errorMessage:"is require"
        },
        isIn:[[true,false]],
        errorMessage:"must be true or false"
    },
    escape:true
}
module.exports={ParkingSpaceSchemaValidation,parkingSpaceApproveValidarion}