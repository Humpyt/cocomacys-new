import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageSrc, handleImageFallback } from '../lib/images'
import { formatCurrency } from '../lib/api'

// Shipping options in UGX
const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', description: '5-7 business days', price: 0 },
  { id: 'express', name: 'Express Shipping', description: '2-3 business days', price: 15000 },
  { id: 'overnight', name: 'Overnight Shipping', description: 'Next business day', price: 35000 },
]

const UG_DISTRICTS = [
  'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbale', 'Gulu', 'Lira',
  'Mbarara', 'Kabale', 'Kasese', 'Fort Portal', 'Masaka', 'Entebbe',
  'Arua', 'Hoima', 'Iganga', 'Kitgum', 'Luwero', 'Masindi', 'Mityana',
  'Mpigi', 'Mubende', 'Ntungamo', 'Rukungiri', 'Soroti', 'Tororo',
  'Busia', 'Bushenyi', 'Kabarole', 'Kamuli', 'Kanungu', 'Kapchorwa',
  'Kayunga', 'Kibaale', 'Kisoro', 'Kotido', 'Kumi', 'Mayuge',
  'Moroto', 'Nakasongola', 'Pallisa', 'Rakai', 'Sironko',
]

export function Checkout() {
  const { cart, refreshCart } = useCart()
  const items = cart?.items ?? []

  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'confirmation'>('address')
  const [address, setAddress] = useState({
    first_name: '', last_name: '', email: '', address: '', address_2: '',
    city: '', district: '', country: 'UG', phone: '',
  })
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0])
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState('')

  const subtotal = Math.round(items.reduce((sum, item) => {
    return sum + ((item.unit_price || 0) * item.quantity)
  }, 0))
  const selectedShippingOption = SHIPPING_OPTIONS.find(o => o.id === selectedShipping.id)!
  const total = subtotal + selectedShippingOption.price

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!cart) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/carts/${cart.id}/address`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: address }),
      })
      if (!res.ok) throw new Error('Failed to save address')
      setStep('shipping')
    } catch (err) {
      alert('Failed to save address. Please try again.')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleShippingSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePlaceOrder = async () => {
    if (!cart) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/carts/${cart.id}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: address.email,
          shipping_address: address,
          shipping_method: selectedShipping,
        }),
      })

      if (!response.ok) {
        throw new Error('Order failed')
      }

      const result = await response.json()
      if (result.order) {
        setOrderId(result.order.id)
        localStorage.removeItem('cocomacys_cart_id')
        await refreshCart()
        setStep('confirmation')
      }
    } catch (err) {
      alert('Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">
          {step === 'confirmation' ? 'Order Confirmed' : 'Checkout'}
        </h1>

        {items.length === 0 && step !== 'confirmation' ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-6">Your bag is empty</p>
            <Link to="/women" className="bg-black text-white px-8 py-3 font-bold">Continue Shopping</Link>
          </div>
        ) : step === 'confirmation' ? (
          <div className="text-center py-12">
            <div className="text-2xl font-bold mb-6">Order placed</div>
            <h2 className="text-2xl font-bold mb-4">Thank you for your order!</h2>
            <p className="text-gray-600 mb-2">Your order has been placed and will be delivered via Cash on Delivery.</p>
            <p className="font-bold mb-8">Order ID: {orderId}</p>
            <Link to="/" className="bg-black text-white px-8 py-3 font-bold">Continue Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-8 text-sm font-bold">
                <span className={step === 'address' ? 'text-black' : 'text-gray-400'}>Address</span>
                <span className="text-gray-300">&gt;</span>
                <span className={step === 'shipping' ? 'text-black' : 'text-gray-400'}>Shipping</span>
                <span className="text-gray-300">&gt;</span>
                <span className={step === 'payment' ? 'text-black' : 'text-gray-400'}>Payment</span>
              </div>

              {step === 'address' && (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="First Name" value={address.first_name}
                      onChange={e => setAddress(a => ({ ...a, first_name: e.target.value }))}
                      className="border px-3 py-2" />
                    <input required placeholder="Last Name" value={address.last_name}
                      onChange={e => setAddress(a => ({ ...a, last_name: e.target.value }))}
                      className="border px-3 py-2" />
                  </div>
                  <input required type="email" placeholder="Email" value={address.email}
                    onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
                    className="w-full border px-3 py-2" />
                  <input required placeholder="Address" value={address.address}
                    onChange={e => setAddress(a => ({ ...a, address: e.target.value }))}
                    className="w-full border px-3 py-2" />
                  <input placeholder="Apartment, suite, etc. (optional)" value={address.address_2}
                    onChange={e => setAddress(a => ({ ...a, address_2: e.target.value }))}
                    className="w-full border px-3 py-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="City / Town" value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      className="border px-3 py-2" />
                    <select required value={address.district}
                      onChange={e => setAddress(a => ({ ...a, district: e.target.value }))}
                      className="border px-3 py-2">
                      <option value="">Select District</option>
                      {UG_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <input required placeholder="Phone" value={address.phone}
                    onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                    className="w-full border px-3 py-2" />
                  <button type="submit" disabled={processing} className="w-full bg-black text-white py-3 font-bold mt-4 disabled:bg-gray-400">
                    {processing ? 'Saving...' : 'Continue to Shipping'}
                  </button>
                </form>
              )}

              {step === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Shipping Method</h2>
                  {SHIPPING_OPTIONS.map(option => (
                    <label key={option.id} className={`flex items-center justify-between border p-4 cursor-pointer hover:border-black ${selectedShipping.id === option.id ? 'border-black bg-gray-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" value={option.id}
                          checked={selectedShipping.id === option.id}
                          onChange={() => setSelectedShipping(option)} />
                        <div>
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                      <span className="font-bold">
                        {option.price === 0 ? 'FREE' : formatCurrency(option.price)}
                      </span>
                    </label>
                  ))}
                  <button type="submit" disabled={processing} className="w-full bg-black text-white py-3 font-bold mt-4 disabled:bg-gray-400">
                    {processing ? 'Saving...' : 'Continue to Payment'}
                  </button>
                  <button type="button" onClick={() => setStep('address')} className="w-full py-2 text-sm underline mt-2">
                    Back to Address
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold mb-4">Payment</h2>
                  <div className="border p-6 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold">COD</div>
                      <div>
                        <p className="font-bold">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your payment will be collected in cash by the delivery carrier when your order is delivered.
                    </p>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="w-full bg-black text-white py-3 font-bold mt-4 hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {processing ? 'Placing Order...' : `Place Order - ${formatCurrency(total)}`}
                  </button>
                  <button type="button" onClick={() => setStep('shipping')} className="w-full py-2 text-sm underline mt-2">
                    Back to Shipping
                  </button>
                </div>
              )}
            </div>

            <div className="w-full lg:w-80">
              <div className="border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img
                          src={getImageSrc(item.images?.[0])}
                          alt={item.name}
                          onError={handleImageFallback}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-gray-500 text-xs">{item.brand}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-sm">
                        {formatCurrency((item.unit_price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>{selectedShippingOption.price === 0 ? 'FREE' : formatCurrency(selectedShippingOption.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span>Calculated at delivery</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Cash on Delivery - pay when your order arrives
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
