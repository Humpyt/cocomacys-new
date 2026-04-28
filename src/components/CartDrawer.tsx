import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageSrc, handleImageFallback } from '../lib/images'
import { formatCurrency } from '../lib/api'

export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, updateItem, removeItem, loading } = useCart()

  if (!drawerOpen) return null

  const items = cart?.items ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Your Bag ({(cart?.items ?? []).reduce((s, i) => s + i.quantity, 0) ?? 0})</h2>
          <button onClick={closeDrawer} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Your bag is empty</p>
              <button
                onClick={closeDrawer}
                className="bg-black text-white px-6 py-2 font-bold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const imageUrl = getImageSrc(item.images?.[0]);
                return (
                  <div key={item.id} className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        onError={handleImageFallback}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                      <p className="text-sm font-medium mt-1">
                        {formatCurrency((item.unit_price || 0) * item.quantity)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                          disabled={loading}
                          className="p-1 border hover:bg-gray-50 disabled:opacity-50"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="p-1 border hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={loading}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>
                {formatCurrency((cart?.items ?? []).reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0))}
              </span>
            </div>
            <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full bg-black text-white text-center py-3 font-bold hover:bg-gray-800"
            >
              Checkout
            </Link>
            <button
              onClick={closeDrawer}
              className="block w-full text-center py-2 text-sm underline hover:text-gray-600"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
