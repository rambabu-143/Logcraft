import Stripe from 'stripe'
import { Plan } from '@prisma/client'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: 'STARTER',
  [process.env.STRIPE_PRO_PRICE_ID!]: 'PRO',
}

export function getPlanFromPriceId(priceId: string): Plan | null {
  return PRICE_TO_PLAN[priceId] ?? null
}

export const PLAN_LIMITS = {
  FREE: { repos: 1, changelogsPerMonth: 5, subscribers: 0 },
  STARTER: { repos: 3, changelogsPerMonth: Infinity, subscribers: 100 },
  PRO: { repos: Infinity, changelogsPerMonth: Infinity, subscribers: Infinity },
} as const

export async function getOrCreateCustomer(email: string, userId: string): Promise<string> {
  const existing = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
  })

  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  return customer.id
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session.url!
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}
