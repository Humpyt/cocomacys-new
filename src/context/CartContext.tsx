import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string;
  product_id: number;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  name: string;
  brand: string;
  images: string[];
}

interface Cart {
  id: string;
  items: CartItem[];
  email?: string;
  shipping_address?: object;
}

interface CartContextValue {
  cart: Cart | null
  loading: boolean
  itemCount: number
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_ID_KEY = 'cocomacys_cart_id'

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const initCart = useCallback(async () => {
    setLoading(true)
    try {
      const savedId = localStorage.getItem(CART_ID_KEY)
      if (savedId) {
        try {
          const cartData = await apiFetch<Cart>(`/carts/${savedId}`)
          setCart(cartData)
          return
        } catch {
          localStorage.removeItem(CART_ID_KEY)
        }
      }
      // Create new cart
      const newCart = await apiFetch<Cart>('/carts', { method: 'POST' })
      localStorage.setItem(CART_ID_KEY, newCart.id)
      setCart(newCart)
    } catch (err) {
      console.error('Cart init error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { initCart() }, [initCart])

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    if (!cart) return
    setLoading(true)
    try {
      const result = await apiFetch<{ cart: Cart; items: CartItem[] }>(`/carts/${cart.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      setCart({ ...cart, items: result.items })
    } catch (err) {
      console.error('Add item error:', err)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return
    setLoading(true)
    try {
      await apiFetch(`/carts/${cart.id}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      })
      // Refresh cart
      const updatedCart = await apiFetch<Cart>(`/carts/${cart.id}`)
      setCart(updatedCart)
    } catch (err) {
      console.error('Update item error:', err)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const removeItem = useCallback(async (itemId: string) => {
    if (!cart) return
    setLoading(true)
    try {
      await apiFetch(`/carts/${cart.id}/items/${itemId}`, { method: 'DELETE' })
      // Refresh cart
      const updatedCart = await apiFetch<Cart>(`/carts/${cart.id}`)
      setCart(updatedCart)
    } catch (err) {
      console.error('Remove item error:', err)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount, drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem, updateItem, removeItem,
      refreshCart: initCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
