import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

let stripe =new Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
export async function POST(req,res){
    let payload=await req.text()
    let resp=JSON.parse(payload)

    let sign=req.headers.get('Stripe-Signature')
    let date=new Date(resp.created*1000).toLocaleDateString()
    let time=new Date(resp.created*1000).toLocaleDateString()

    try {
        let event=stripe.webhooks.constructEvent(
            payload,sign,process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_KEY
        )

        const response=await registerPayment(

            resp.data.object.billing_details.email,
            resp.data.object.amount,
            JSON.stringify(resp),
            String(date),
            String(time),
            resp.data.object.receipt_email,
            resp.data.object.receipt_url,
            JSON.stringify(resp.data.object.payment_method_details),
            JSON.stringify(resp.data.object.billing_details),
            resp.data.object.currency
        )
        console.log(response)

        return NextResponse.json({status:200,event})
    } catch (error) {
        return NextResponse.json({status:400,error:'internal server action'})
    }
}