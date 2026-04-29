import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Contact() {
  return (
    <main className="font-sans">
      {/* Hero */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            We'd love to hear from you. Whether you have a question about our products, need style advice, or just want to say hello — reach out anytime.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Visit or Get in Touch</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                  <MapPin size={22} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Our Store</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Forest Mall - Lugogo<br />
                    Shop BF-10<br />
                    Kampala, Uganda
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Phone size={22} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Phone</h3>
                  <a href="tel:+256774974933" className="text-gray-600 hover:text-orange-600 transition-colors">
                    +256 774 974933
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Mail size={22} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Email</h3>
                  <a href="mailto:fashionbrandsintl@gmail.com" className="text-gray-600 hover:text-orange-600 transition-colors break-all">
                    fashionbrandsintl@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Clock size={22} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Store Hours</h3>
                  <div className="text-gray-600 space-y-0.5">
                    <p>Monday – Saturday: 9:00 AM – 8:00 PM</p>
                    <p>Sunday: 10:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand info card */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">Coco's Fashion Brands</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your destination for premium women's and men's fashion in Kampala. From timeless dresses and sharp suits to casual essentials — we bring you curated style at its finest.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Send Us a Message</h2>

              <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Forest Mall - Lugogo, Kampala</p>
            <p className="text-gray-400 text-sm">Shop BF-10</p>
          </div>
        </div>
      </div>
    </main>
  );
}
