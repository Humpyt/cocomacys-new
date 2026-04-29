import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api, type WishlistItem } from '../lib/api';

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, variantId?: string) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.wishlist.get();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productId: number, variantId?: string) => {
    setLoading(true);
    try {
      await api.wishlist.addItem(productId, variantId);
      await refresh();
    } catch (err) {
      console.error('Add to wishlist error:', err);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const removeItem = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      await api.wishlist.removeItem(productId);
      await refresh();
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId: number) => items.some(item => item.product_id === productId),
    [items]
  );

  const toggle = useCallback(async (productId: number) => {
    if (items.some(item => item.product_id === productId)) {
      await removeItem(productId);
    } else {
      await addItem(productId);
    }
  }, [items, removeItem, addItem]);

  return (
    <WishlistContext.Provider value={{
      items, loading, refresh, addItem, removeItem, isWishlisted, toggle,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
