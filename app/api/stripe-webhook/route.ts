import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
        return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // forward to n8n
    await fetch('https://n8n-production-8d4e.up.railway.app/webhook/stripe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    })

    return Response.json({ received: true })
}