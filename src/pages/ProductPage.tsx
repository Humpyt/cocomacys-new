import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, Heart, Play } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCarousel } from '../components/ProductCarousel';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  api,
  type ApiProductRecord,
  formatCurrency,
  getProductDiscountLabel,
  getProductImage,
  getProductOriginalPrice,
  getProductPrice,
  getProductRating,
  getErrorMessage,
} from '../lib/api';
import { getImageSrc, handleImageFallback, getColorHex, getColorLabel } from '../lib/images';
import { formatProductLabel } from '../lib/navigation';

interface RelatedProduct {
  id: string;
  href: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviews: number;
  colors?: string[];
  promo?: string;
}

function mapRelatedProduct(product: ApiProductRecord): RelatedProduct {
  const price = formatCurrency(getProductPrice(product));
  const originalPrice = getProductOriginalPrice(product);

  return {
    id: String(product.id),
    href: `/product?id=${encodeURIComponent(String(product.id))}`,
    image: getImageSrc(getProductImage(product)),
    brand: formatProductLabel(product.brand, product.category),
    name: product.name || '',
    price,
    originalPrice: originalPrice != null ? formatCurrency(originalPrice) : undefined,
    discount: getProductDiscountLabel(product),
    rating: getProductRating(product),
    reviews: product.reviews ?? 0,
    colors: product.colors.length > 0 ? product.colors : undefined,
    promo: product.promo ?? undefined,
  };
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex text-black">
      {Array(full).fill(null).map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="currentColor" />
      ))}
      {half && <Star size={size} fill="currentColor" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {Array(empty).fill(null).map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-pulse">
      <div className="flex items-center text-xs text-gray-500 mb-6 space-x-2">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-4 bg-gray-200 rounded"></div>
        <div className="h-3 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
        <div className="w-full lg:w-7/12 flex gap-4">
          <div className="w-16 md:w-20 flex flex-col gap-3 shrink-0">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] md:aspect-auto md:h-[800px] bg-gray-200 rounded"></div>
        </div>
        <div className="w-full lg:w-5/12 flex flex-col">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-6 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 w-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-16 w-full bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState<ApiProductRecord | null>(null);
  const [brandProducts, setBrandProducts] = useState<RelatedProduct[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, openDrawer } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setError('No product selected.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);
    setBrandProducts([]);
    setCategoryProducts([]);
    setSelectedColor('');
    setSelectedType('');
    setSelectedSize('');
    setActiveImage(0);

    const fetchProduct = async () => {
      try {
        const p = await api.products.get(productId);
        setProduct(p);

        if (p.colors.length > 0) setSelectedColor(p.colors[0]);
        if (p.types.length > 0) setSelectedType(p.types[0]);
        if (p.sizes.length > 0) setSelectedSize(p.sizes[0]);

        // Fetch category products for both carousels
        if (p.category) {
          const { products: catProds } = await api.products.list({ category: p.category, limit: 20 });
          setBrandProducts(
            catProds
              .filter(rp => rp.id !== p.id)
              .slice(0, 8)
              .map(mapRelatedProduct)
          );
          setCategoryProducts(
            catProds
              .filter(rp => rp.id !== p.id)
              .slice(8, 16)
              .map(mapRelatedProduct)
          );
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load product.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <LoadingSkeleton />;

  if (error || !product) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">{error || "We couldn't find this product."}</p>
        <Link to="/" className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800">
          Continue Shopping
        </Link>
      </main>
    );
  }

  const price = formatCurrency(getProductPrice(product));
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscountLabel(product);
  const rating = getProductRating(product);
  const images = product.images.length > 0 ? product.images : [];
  const colors = product.colors.map((c) => ({ name: getColorLabel(c), hex: getColorHex(c) }));
  const types = product.types.length > 0 ? product.types : ['Regular'];
  const sizes = product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const features = product.features ?? [];
  const details = product.details || '';

  return (
    <main className="font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs text-gray-500 mb-6 space-x-2">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link to="/women" className="hover:underline">Shop</Link>
          <ChevronRight size={12} />
          <span className="font-bold text-black border-b border-black pb-0.5">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          {/* Left: Images */}
          <div className="w-full lg:w-7/12 flex gap-4">
            {/* Thumbnails */}
            <div className="w-16 md:w-20 flex flex-col gap-3 shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`relative aspect-[3/4] border-2 overflow-hidden ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" onError={handleImageFallback} />
                </button>
              ))}
              {images.length > 0 && (
                <button className="relative aspect-[3/4] border-2 border-transparent hover:border-gray-300 bg-gray-100 flex items-center justify-center">
                  <Play size={24} className="text-gray-600" />
                </button>
              )}
            </div>
            {/* Main Image */}
            <div className="flex-1 relative bg-gray-50 aspect-[3/4] md:aspect-auto md:h-[800px]">
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" onError={handleImageFallback} />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
              )}
              <button
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                onClick={() => product && toggle(Number(product.id))}
              >
                <Heart
                  size={24}
                  fill={product && isWishlisted(Number(product.id)) ? "#ef4444" : "none"}
                  className={product && isWishlisted(Number(product.id)) ? "text-red-500" : "text-gray-600"}
                />
              </button>
              {discount && (
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  PAIR IT WITH
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <h2 className="text-lg font-bold mb-1">{formatProductLabel(product.brand, product.category)}</h2>
            <h1 className="text-xl mb-3 text-gray-800">{product.name}</h1>
            {product.promo && <p className="text-xs text-gray-500 mb-3">{product.promo}</p>}

            <div className="flex items-center gap-1 mb-6 text-sm">
              <StarRating rating={rating} size={14} />
              {rating > 0 && <span className="font-bold ml-1">{rating.toFixed(1)}</span>}
              {rating > 0 && <span className="text-gray-500 underline cursor-pointer">({(product.reviews ?? 0).toLocaleString()})</span>}
            </div>

            {discount && (
              <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 inline-block w-max mb-3">
                Limited-Time Special
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-xl font-bold text-orange-600">{price}</span>
              {discount && <span className="text-orange-600 text-sm">({discount})</span>}
              {originalPrice != null && (
                <span className="text-gray-500 line-through text-sm">{formatCurrency(originalPrice)}</span>
              )}
              <span className="text-xs underline cursor-pointer ml-2">Details</span>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-3">Color: <span className="font-normal">{getColorLabel(selectedColor)}</span></p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      className={`w-10 h-10 rounded-full border-2 p-0.5 ${selectedColor === c.name ? 'border-black' : 'border-transparent'}`}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                    >
                      <div className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: c.hex }}></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type Selection */}
            {types.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-3">Type: <span className="font-normal">{selectedType}</span></p>
                <div className="flex gap-3">
                  {types.map(t => (
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
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-sm">Size: <span className="font-normal">{selectedSize}</span></p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(s => (
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
            )}

            {/* Cart error feedback */}
            {cartError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {cartError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                className="flex-1 bg-orange-600 text-white font-bold py-3.5 rounded-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
                disabled={addingToCart}
                onClick={async () => {
                  setAddingToCart(true);
                  setCartError(null);
                  try {
                    await addItem(Number(product.id));
                    openDrawer();
                  } catch (err) {
                    setCartError('Could not add to bag. Please try again.');
                  } finally {
                    setAddingToCart(false);
                  }
                }}
              >
                {addingToCart ? 'Adding...' : 'Add To Bag'}
              </button>
              <button
                className="flex-1 bg-white text-black border border-black font-bold py-3.5 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={addingToCart}
                onClick={async () => {
                  setAddingToCart(true);
                  setCartError(null);
                  try {
                    await addItem(Number(product.id));
                    openDrawer();
                  } catch (err) {
                    setCartError('Could not add to bag. Please try again.');
                  } finally {
                    setAddingToCart(false);
                  }
                }}
              >
                Buy Now
              </button>
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
          </div>
        </div>

        {/* Product Details Section */}
        <div className="border-t border-gray-200 pt-12 mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-serif font-bold">Product details</h2>
            <span className="text-xs text-gray-500">Web ID: {product.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-gray-800 leading-relaxed">{details}</p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Product Features</h3>
              <ul className="list-disc pl-4 space-y-2 text-gray-700">
                {features.map((feature, idx) => (
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
          </div>
        </div>

        {/* More from Brand */}
        {brandProducts.length > 0 && (
          <div className="mb-16">
            <ProductCarousel
              title={`More from ${formatProductLabel(product.brand, product.category) || 'Our Collection'}`}
              products={brandProducts}
            />
          </div>
        )}

        {/* Discover more options */}
        {categoryProducts.length > 0 && (
          <div className="mb-16">
            <ProductCarousel
              title="Discover more options"
              products={categoryProducts}
            />
          </div>
        )}
      </div>
    </main>
  );
}
