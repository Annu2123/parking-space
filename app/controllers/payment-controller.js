const Payment=require('../models/payment-model')
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const {pick}=require('lodash')
const paymentsCntrl={}

paymentsCntrl.pay = async(req,res)=>{
    // const errors = validationResult(req)
    // if(!errors.isEmpty()){
    //     return res.status(400).json({errors:errors.array()})
    // }
    const body = pick(req.body,['bookingId','amount'])
    try{

        //create a customer
        const customer = await stripe.customers.create({
            name: "Testing",
            address: {
                line1: 'India',
                postal_code: '403507',
                city: 'mapusa',
                state: 'Goa',
                country: 'US',
            },
        })
        
        //create a session object
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:[{
                price_data:{
                    currency:'inr',
                    product_data:{
                        name:'booking'
                    },
                    unit_amount:body.amount * 100
                },
                quantity: 1
            }],
            mode:"payment",
            success_url:"http://localhost:3000/success",
            cancel_url: 'http://localhost:3000/cancel',
            customer : customer.id
        })
        
        //create a payment
        const payment = new Payment(body)
        payment.bookingId=body.bookingId
        payment.transactionId = session.id
        payment.amount = Number(body.amount)
        payment.paymentType = "card"
        await payment.save()
        res.json({id:session.id,url: session.url})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}  
module.exports=paymentsCntrl
