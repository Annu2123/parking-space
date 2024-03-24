const mongoose=require('mongoose')
const configDb=async()=>{
    try{
        const db= mongoose.connect('mongodb://127.0.0.1:27017/parking-space')
        console.log('connected to db')
    }catch(err){
        console.log('error in connecting')
    }
   
    
}
module.exports=configDb