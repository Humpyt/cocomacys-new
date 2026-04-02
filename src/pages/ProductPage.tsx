import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, Heart, Info, Play, MessageCircle, ShoppingBag } from 'lucide-react';
import { ProductCarousel } from '../components/ProductCarousel';
import { Link, useLocation } from 'react-router-dom';

// Mock data for the product
const product = {
  brand: "I.N.C. International Concepts",
  name: "Blazer, Women's 3/4 Sleeve Blazer",
  rating: 4.2,
  reviews: 2557,
  price: 55.65,
  originalPrice: 79.50,
  discount: "30% off",
  colors: [
    { name: "Pink Rose Gem", hex: "#ffb6c1" },
    { name: "Deep Black", hex: "#000000" },
    { name: "Navy Blue", hex: "#000080" },
    { name: "Pure White", hex: "#ffffff" },
    { name: "Heather Grey", hex: "#808080" },
    { name: "Olive Green", hex: "#556b2f" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Mustard", hex: "#ffdb58" },
    { name: "Teal", hex: "#008080" },
    { name: "Camel", hex: "#c19a6b" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  types: ["Regular", "Petite"],
  images: [
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
  ],
  details: "This tailored 3/4 sleeve blazer by I.N.C. International Concepts® is ideal for the boardroom and beyond.",
  features: [
    "Approx. length: 28.5\"",
    "Notched lapel; hook and eye front closure",
    "3/4-length sleeves with shoulder pads",
    "Flap pockets at hips",
    "INC brings runway inspiration to your every day. Shop the full collection to create a head-to-toe look that's truly your own",
    "Macy's Exclusive"
  ]
};

const relatedProducts = [
  {
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=400",
    brand: "I.N.C. International Concepts",
    name: "Women's Double-Breasted Blazer...",
    price: "$83.65 - $87.15",
    originalPrice: "$119.50",
    discount: "30% off",
    rating: 4.5,
    reviews: 225,
    colors: ["#ffb6c1", "#000000", "#ffffff"]
  },
  {
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=400",
    brand: "I.N.C. International Concepts",
    name: "Women's Puff-Sleeve Blazer...",
    price: "$62.65",
    originalPrice: "$89.50",
    discount: "30% off",
    rating: 4.6,
    reviews: 1176,
    colors: ["#000080", "#000000"]
  },
  {
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=400",
    brand: "Gloria Vanderbilt",
    name: "Women's Denim One-Button Blazer",
    price: "$47.40 - $51.00",
    originalPrice: "$79.00",
    discount: "40% off",
    rating: 3.9,
    reviews: 135,
    colors: ["#000080", "#add8e6", "#000000"]
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400",
    brand: "I.N.C. International Concepts",
    name: "Women's Bengaline Pull-On Capri...",
    price: "$34.65",
    originalPrice: "$49.50",
    discount: "30% off",
    rating: 4.4,
    reviews: 1601,
    colors: ["#556b2f", "#000000", "#ffffff", "#c19a6b"]
  },
  {
    image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=400",
    brand: "I.N.C. International Concepts",
    name: "Women's Nipped-Waist Two-Button...",
    price: "$83.65",
    originalPrice: "$119.50",
    discount: "30% off",
    rating: 4.1,
    reviews: 15,
    colors: ["#000000"]
  }
];

const pairItWith = [
  {
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=400",
    name: "Blazer, Women's 3/4 Sleeve Blazer",
    price: "$55.65",
    originalPrice: "$79.50",
    discount: "-30%"
  },
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400",
    name: "Women's Ribbed Knit Tank Top...",
    price: "$20.65",
    originalPrice: "$29.50",
    discount: "-30%"
  },
  {
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400",
    name: "Large 2\" Gold-Tone Hoop...",
    price: "$17.70",
    originalPrice: "$29.50",
    discount: "-40%"
  },
  {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400",
    name: "Women's Leather Round-Toe Pumps...",
    price: "$62.93",
    originalPrice: "$89.90",
    discount: "-30%"
  }
];

export function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedType, setSelectedType] = useState(product.types[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [activeImage, setActiveImage] = useState(0);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main className="font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs text-gray-500 mb-6 space-x-2">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link to="/women" className="hover:underline">Women's Fashion, Shoes & Accessories</Link>
          <ChevronRight size={12} />
          <span className="font-bold text-black border-b border-black pb-0.5">Blazers</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          {/* Left: Images */}
          <div className="w-full lg:w-7/12 flex gap-4">
            {/* Thumbnails */}
            <div className="w-16 md:w-20 flex flex-col gap-3 shrink-0">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`relative aspect-[3/4] border-2 overflow-hidden ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <button className="relative aspect-[3/4] border-2 border-transparent hover:border-gray-300 bg-gray-100 flex items-center justify-center">
                <Play size={24} className="text-gray-600" />
              </button>
            </div>
            {/* Main Image */}
            <div className="flex-1 relative bg-gray-50 aspect-[3/4] md:aspect-auto md:h-[800px]">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                <Heart size={24} className="text-gray-600" />
              </button>
              <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                PAIR IT WITH
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <ShoppingBag size={14} /> Most wanted
                </div>
                <div className="font-normal text-gray-600">1427 recently added to bag</div>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <h2 className="text-lg font-bold mb-1">{product.brand}</h2>
            <h1 className="text-xl mb-3 text-gray-800">{product.name}</h1>
            <p className="text-xs text-gray-500 mb-3">Macy's Exclusive</p>
            
            <div className="flex items-center gap-1 mb-6 text-sm">
              <div className="flex text-black">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} className="text-gray-300" />
              </div>
              <span className="font-bold ml-1">{product.rating}</span>
              <span className="text-gray-500 underline cursor-pointer">({product.reviews.toLocaleString()})</span>
            </div>

            <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 inline-block w-max mb-3">
              Limited-Time Special
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-orange-600">${product.price.toFixed(2)}</span>
              <span className="text-orange-600 text-sm">({product.discount})</span>
              <span className="text-gray-500 line-through text-sm">${product.originalPrice.toFixed(2)}</span>
              <span className="text-xs underline cursor-pointer ml-2">Details</span>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="font-bold text-sm mb-3">Color: <span className="font-normal">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button 
                    key={c.name} 
                    className={`w-10 h-10 rounded-full border-2 p-0.5 ${selectedColor === c.name ? 'border-black' : 'border-transparent'}`} 
                    onClick={() => setSelectedColor(c.name)}
                  >
                    <div className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: c.hex }}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <p className="font-bold text-sm mb-3">Type: <span className="font-normal">{selectedType}</span></p>
              <div className="flex gap-3">
                {product.types.map(t => (
                  <button 
                    key={t} 
                    className={`px-6 py-2 border text-sm ${selectedType === t ? 'border-black font-bold' : 'border-gray-300 hover:border-black'}`} 
                    onClick={() => setSelectedType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-sm">Size: <span className="font-normal">{selectedSize}</span></p>
                <span className="text-xs underline cursor-pointer">Size Chart</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(s => (
                  <button 
                    key={s} 
                    className={`w-14 h-10 border text-sm flex items-center justify-center ${selectedSize === s ? 'border-black font-bold' : 'border-gray-300 hover:border-black'}`} 
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-4">
              <button className="flex-1 bg-orange-600 text-white font-bold py-3.5 rounded-sm hover:bg-orange-700 transition-colors">Add To Bag</button>
              <button className="flex-1 bg-white text-black border border-black font-bold py-3.5 rounded-sm hover:bg-gray-50 transition-colors">Buy Now</button>
            </div>
            <div className="text-center mb-8">
              <span className="text-xs underline cursor-pointer text-gray-600">Add to registry</span>
            </div>

            {/* Delivery Options */}
            <div className="border-t border-gray-200 pt-6 mb-8 space-y-5">
              <div className="flex items-start gap-3">
                <input type="radio" name="delivery" id="deliver" className="mt-1 w-4 h-4 accent-black" defaultChecked />
                <div>
                  <label htmlFor="deliver" className="font-bold text-sm block mb-1">Deliver</label>
                  <p className="text-sm text-gray-600">Enter your <span className="underline cursor-pointer text-black">zip code</span> to see delivery availability.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="radio" name="delivery" id="pickup" className="mt-1 w-4 h-4 accent-black" />
                <div>
                  <label htmlFor="pickup" className="font-bold text-sm block mb-1">Pick up at store</label>
                  <p className="text-sm text-gray-600">Check your <span className="underline cursor-pointer text-black">local store</span> if you want it sooner.</p>
                </div>
              </div>
            </div>

            {/* Offers & Perks */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4">Offers & perks</h3>
              <div className="border border-gray-200 p-4 space-y-4 rounded-sm bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <Star className="text-black shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">$10 Star Money for $100</p>
                    <p className="text-xs text-gray-500 underline cursor-pointer mt-0.5">See offer details</p>
                  </div>
                  <Info size={16} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                  <div className="font-bold text-sm shrink-0 bg-pink-200 px-1.5 rounded-sm mt-0.5">K.</div>
                  <div className="flex-1">
                    <p className="text-sm">4 interest-free payments of $13.91 with <span className="font-bold">Klarna</span></p>
                  </div>
                  <Info size={16} className="text-gray-400 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You may also like */}
        <div className="mb-16">
          <ProductCarousel 
            title="You may also like" 
            products={relatedProducts} 
          />
        </div>

        {/* Product Details Section */}
        <div className="border-t border-gray-200 pt-12 mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-serif font-bold">Product details</h2>
            <span className="text-xs text-gray-500">Web ID: 23476271</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-gray-800 leading-relaxed">{product.details}</p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Product Features</h3>
              <ul className="list-disc pl-4 space-y-2 text-gray-700">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Shipping & Returns</h3>
              <ul className="list-disc pl-4 space-y-2 text-gray-700">
                <li>These items qualify for Free Shipping with minimum purchase! <span className="underline cursor-pointer">exclusions & details</span></li>
                <li>Our Normal Gift Boxing is not available for these items.</li>
                <li>This item purchased online must be returned to the vendor by mail only. This item cannot be returned to Macy's stores.</li>
              </ul>
              <button className="text-black underline font-bold mt-4">View more</button>
            </div>
            <div>
              <h3 className="font-bold mb-3">Chat with a style expert</h3>
              <p className="text-gray-700 mb-4">Our experts can answer any questions you have about this item, or help you find something new.</p>
              <button className="flex items-center gap-2 font-bold underline">
                <MessageCircle size={18} /> Chat Now
              </button>
            </div>
          </div>
        </div>

        {/* Pair it with */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold mb-8">Pair it with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pairItWith.map((item, idx) => (
              <Link to="/product" key={idx} className="group cursor-pointer flex flex-col">
                <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
                    {item.discount}
                  </div>
                </div>
                <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 text-center">{item.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mt-auto">
                  <span className="font-bold text-orange-600">{item.price}</span>
                  <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* More from Brand */}
        <div className="mb-16">
          <ProductCarousel 
            title="More from I.N.C. International Concepts" 
            products={relatedProducts} 
          />
        </div>

        {/* Discover more options */}
        <div className="mb-16">
          <ProductCarousel 
            title="Discover more options" 
            products={relatedProducts.slice().reverse()} 
          />
        </div>

        {/* Ratings & Reviews */}
        <div className="border-t border-gray-200 pt-12 mb-16">
          <h2 className="text-2xl font-serif font-bold mb-8">Ratings & Reviews</h2>
          
          <div className="mb-12">
            <h3 className="font-bold text-lg mb-4">Here's what customers think</h3>
            <ul className="list-disc pl-4 space-y-2 text-sm text-gray-800">
              <li>This versatile blazer is praised for its flattering fit, comfortable stretch fabric, and vibrant color options.</li>
              <li>Many highlight the polished yet casual look created by the 3/4 sleeve length and longer silhouette.</li>
              <li>However, some note the blazer runs small and recommend sizing up, especially in the arms and shoulders.</li>
              <li>A few also mention quality issues like pilling or loose threads.</li>
              <li>The unique hook closure design is polarizing, with some finding it attractive and others feeling it looks cheap.</li>
              <li>Overall, this appears to be a well-received blazer that provides great value, as long as the sizing is accounted for.</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">AI-generated summary from 1,444 customers reviews.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-bold mb-2">4.2/5</div>
              <div className="flex text-black mb-2">
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold mb-4">2,557 star ratings, 1,444 reviews</p>
              <button className="text-sm font-bold underline">Write a Review</button>
            </div>

            {/* Rating Breakdown */}
            <div className="flex flex-col justify-center space-y-2">
              {[
                { stars: 5, count: 1631, percent: 64 },
                { stars: 4, count: 360, percent: 14 },
                { stars: 3, count: 226, percent: 9 },
                { stars: 2, count: 139, percent: 5 },
                { stars: 1, count: 201, percent: 8 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-4 text-sm">
                  <span className="w-12 text-right underline cursor-pointer">{row.stars} Stars</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-black" style={{ width: `${row.percent}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-gray-600">{row.count}</span>
                </div>
              ))}
            </div>

            {/* Fit Sliders */}
            <div className="flex flex-col justify-center space-y-6 text-sm">
              <div>
                <div className="flex justify-between font-bold mb-2">
                  <span>Too short/too long</span>
                </div>
                <div className="relative h-1 bg-gray-200 mb-2">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Too short</span>
                  <span>Neutral</span>
                  <span>Too long</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-2">
                  <span>Runs small/runs large</span>
                </div>
                <div className="relative h-1 bg-gray-200 mb-2">
                  <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Runs small</span>
                  <span>Neutral</span>
                  <span>Runs large</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
