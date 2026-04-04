const PUBLISHABLE_KEY = import.meta.env.VITE_PUBLISHABLE_API_KEY as string

export interface MedusaProductOption {
  id: string
  title: string
  values: string[]
}

export interface MedusaProduct {
  id: string
  title: string
  description: string
  thumbnail: string
  images: { url: string }[]
  variants: MedusaVariant[]
  options?: MedusaProductOption[]
  collection?: { id: string; title: string }
  metadata?: Record<string, unknown>
}

export interface MedusaVariant {
  id: string
  title: string
  prices: { amount: number; currency_code: string }[]
  options: { option_id: string; value: string }[]
}

export interface MedusaCart {
  id: string
  items: MedusaLineItem[]
  shipping_address?: Record<string, string>
  shipping_methods?: { id: string; option_id: string }[]
  payment_session?: { status: string; provider_id: string }
  payment_collections?: { id: string }[]
  status?: string
  region_id?: string
}

export interface MedusaLineItem {
  id: string
  quantity: number
  variant_id: string
  product_id: string
  title: string
  variant: MedusaVariant
}

export interface MedusaCollection {
  id: string
  title: string
  handle: string
  metadata?: Record<string, string>
}

async function medusaFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/store${path}`, {
    ...options,
    headers: {
      'x-publishable-api-key': PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Medusa API error ${res.status}: ${err}`)
  }

  return res.json()
}

export interface ShippingOption {
  id: string
  name: string
  amount: number
  currency_code: string
}

export interface PaymentCollection {
  id: string
  payment_sessions: { id: string; provider_id: string; status: string }[]
}

export const medusa = {
  products: {
    list: (params?: { limit?: number; collection_id?: string; order?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.collection_id) searchParams.set('collection_id', params.collection_id)
      if (params?.order) searchParams.set('order', params.order)
      const query = searchParams.toString()
      return medusaFetch<{ products: MedusaProduct[]; count: number }>(
        `/products${query ? `?${query}` : ''}`
      )
    },
    retrieve: (id: string) =>
      medusaFetch<{ product: MedusaProduct }>(`/products/${id}`),
  },

  carts: {
    create: () => medusaFetch<{ cart: MedusaCart }>('/carts', { method: 'POST' }),
    retrieve: (id: string) => medusaFetch<{ cart: MedusaCart }>(`/carts/${id}`),
    addLineItem: (cartId: string, variantId: string, quantity: number) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}/line-items`, {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      }),
    updateLineItem: (cartId: string, lineId: string, quantity: number) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}/line-items/${lineId}`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      }),
    removeLineItem: (cartId: string, lineId: string) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}/line-items/${lineId}`, {
        method: 'DELETE',
      }),
    addShippingAddress: (cartId: string, address: Record<string, string>) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}`, {
        method: 'POST',
        body: JSON.stringify({ shipping_address: address }),
      }),
    addShippingMethod: (cartId: string, optionId: string) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId, data: {} }),
      }),
    createPaymentCollection: (cartId: string) =>
      medusaFetch<{ payment_collection: PaymentCollection }>('/payment-collections', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      }),
    addPaymentSession: (paymentCollectionId: string, providerId = 'pp_system_default') =>
      medusaFetch<{ payment_collection: PaymentCollection }>(
        `/payment-collections/${paymentCollectionId}/payment-sessions`,
        {
          method: 'POST',
          body: JSON.stringify({ provider_id: providerId }),
        }
      ),
    setPaymentSession: (cartId: string, sessionId: string) =>
      medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}`, {
        method: 'POST',
        body: JSON.stringify({ payment_session: sessionId }),
      }),
    completeCart: (cartId: string) =>
      medusaFetch<{ type: string; order?: { id: string; status: string }; cart?: MedusaCart }>(
        `/carts/${cartId}/complete`
      ),
  },

  collections: {
    list: (params?: { limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return medusaFetch<{ collections: MedusaCollection[]; count: number }>(
        `/collections${query ? `?${query}` : ''}`
      )
    },
    retrieve: (id: string) =>
      medusaFetch<{ collection: MedusaCollection }>(`/collections/${id}`),
  },
}

// Helper to format price from Medusa (amount is in cents)
export function formatPrice(amount: number, currencyCode = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100)
}
