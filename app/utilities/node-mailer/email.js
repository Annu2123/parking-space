const nodeMailer=require('nodemailer')
const sendEmail=async(data)=>{
    console.log(data.email,data.subject)

    //create trnasporter
    const transport=nodeMailer.createTransport({
        service:"gmail",
        auth:{//who is sending
            user:process.env.email,
            pass:process.env.password

        }
    })
    const mailOptions={
        from:process.env.email,
        to:data.email,
        subject:data.subject,
        text:data.text
    }
    try{
        await transport.sendMail(mailOptions)
        console.log("mail succesfully send")
    }catch(err){
        console.log(err)
    }
}
module.exports=sendEmail