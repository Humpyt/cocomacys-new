import React from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getImageSrc, handleImageFallback } from '../lib/images'

function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('UGX', 'USh');
}

export function Cart() {
  const { cart, updateItem, removeItem, loading } = useCart()
  const items = cart?.items ?? []

  const subtotal = items.reduce((sum, item) => {
    return sum + ((item.unit_price || 0) * item.quantity)
  }, 0)

  return (
    <main className="font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-6">Your bag is empty</p>
            <Link to="/women" className="bg-black text-white px-8 py-3 font-bold">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Items */}
            <div className="flex-1">
              <div className="border-t border-b border-gray-200 py-4 mb-6 hidden lg:grid lg:grid-cols-12 text-sm font-bold">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-8">
                {items.map((item) => {
                  const itemTotal = (item.unit_price || 0) * item.quantity

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 lg:grid lg:grid-cols-12 lg:gap-4 pb-8 border-b border-gray-200">
                      {/* Image + Details */}
                      <div className="flex gap-4 lg:col-span-6">
                        <div className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={getImageSrc(item.images?.[0])}
                            alt={item.name}
                            onError={handleImageFallback}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={loading}
                            className="text-red-500 text-sm underline mt-2 hover:text-red-700 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 lg:col-span-2 lg:justify-center">
                        <button
                          onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
                          disabled={loading}
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="w-8 h-8 border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={loading}
                          aria-label={`Increase quantity for ${item.name}`}
                          className="w-8 h-8 border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="lg:col-span-2 lg:text-center flex justify-between lg:block">
                        <span className="font-bold lg:hidden">Price:</span>
                        <span className="font-medium">{formatUGX(item.unit_price || 0)}</span>
                      </div>

                      {/* Total */}
                      <div className="lg:col-span-2 lg:text-right flex justify-between lg:block">
                        <span className="font-bold lg:hidden">Total:</span>
                        <span className="font-bold">{formatUGX(itemTotal)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link to="/women" className="inline-flex items-center gap-2 text-sm underline mt-6 hover:text-gray-600">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80">
              <div className="border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatUGX(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Estimated Total</span>
                    <span>{formatUGX(subtotal)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-black text-white text-center py-3 font-bold mt-6 hover:bg-gray-800"
                >
                  Proceed to Checkout
                </Link>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>Sign in to earn rewards</p>
                  <p className="mt-1">Free shipping on orders USh 99+</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
