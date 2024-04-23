const mongoose=require('mongoose')
const configDb=async()=>{
    try{
        const db= mongoose.connect('mongodb+srv://anubrath4994:QtzrFILqpnq7Ixrw@cluster0.axxfbn2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log('connected to db')
    }catch(err){
        console.log('error in connecting')
    }
   
    
}
module.exports=configDb