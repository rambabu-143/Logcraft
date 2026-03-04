import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, getOrCreateCustomer, createCheckoutSession, createBillingPortalSession, getPlanFromPriceId } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  // Accept either a raw Stripe price ID or a target plan name
  priceId: z.string().optional(),
  targetPlan: z.enum(['STARTER', 'PRO']).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Resolve price ID from target plan if needed
  let resolvedPriceId = parsed.data.priceId
  if (!resolvedPriceId && parsed.data.targetPlan) {
    resolvedPriceId =
      parsed.data.targetPlan === 'STARTER'
        ? process.env.STRIPE_STARTER_PRICE_ID!
        : process.env.STRIPE_PRO_PRICE_ID!
  }
  if (!resolvedPriceId) {
    return NextResponse.json({ error: 'No price specified' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, stripeSubscriptionId: true },
  })
  if (!user?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    customerId = await getOrCreateCustomer(user.email, session.user.id)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL!

  // If user already has an active subscription, update the price on it (upgrade/downgrade)
  if (user.stripeSubscriptionId) {
    try {
      const existing = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      if (existing.status === 'active' || existing.status === 'trialing') {
        const itemId = existing.items.data[0]?.id
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          items: [{ id: itemId, price: resolvedPriceId }],
          proration_behavior: 'create_prorations',
        })
        const newPlan = getPlanFromPriceId(resolvedPriceId)
        if (newPlan) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { plan: newPlan },
          })
        }
        return NextResponse.json({ url: `${baseUrl}/billing/success` })
      }
    } catch {
      // Subscription not found or invalid — fall through to new checkout
    }
  }

  const checkoutUrl = await createCheckoutSession(
    customerId,
    resolvedPriceId,
    `${baseUrl}/billing/success`,
    `${baseUrl}/billing/cancel`,
  )

  return NextResponse.json({ url: checkoutUrl })
}

// Billing portal (manage existing subscription)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL!
  const portalUrl = await createBillingPortalSession(
    user.stripeCustomerId,
    `${baseUrl}/dashboard`,
  )

  return NextResponse.json({ url: portalUrl })
}
