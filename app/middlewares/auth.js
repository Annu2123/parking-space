const jwt=require('jsonwebtoken')
const authenticateUser=(req,res,next)=>{
    const token=req.headers['authorization']
    if(!token){
        return res.status(401).json({error:"token is require"})
    }
    try{
        const tokenData=jwt.verify(token,process.env.SECRET_JWT)
        req.user={
            id:tokenData.id,
            role:tokenData.role
        }
       
        next()
        

    }catch(err){
        res.status(400).json({error:"internal server error"})
    }
}
const authorizeUser=(role)=>{
    return (req,res,next)=>{
        if(role.includes(req.user.role)){
            next()
        }else{
            res.status(400).json({error:"you are not authorize"})
        }
    }
}
module.exports={authenticateUser,authorizeUser}