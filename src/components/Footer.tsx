import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-12 pb-6 text-sm font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/women" className="hover:underline">Women</Link></li>
              <li><Link to="/men" className="hover:underline">Men</Link></li>
              <li><Link to="/women?category=shoes" className="hover:underline">Shoes</Link></li>
              <li><Link to="/women?category=bags" className="hover:underline">Handbags</Link></li>
              <li><Link to="/women?category=dresses" className="hover:underline">Dresses</Link></li>
              <li><Link to="/men?category=shirts" className="hover:underline">Men's Shirts</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/contact" className="hover:underline">FAQs & Help</Link></li>
              <li><Link to="/contact" className="hover:underline">Shipping & Delivery</Link></li>
              <li><Link to="/contact" className="hover:underline">Returns & Exchanges</Link></li>
              <li><Link to="/contact" className="hover:underline">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:underline">Order Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">About Cocomacys</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/contact" className="hover:underline">Our Story</Link></li>
              <li><Link to="/contact" className="hover:underline">Store Locations</Link></li>
              <li><Link to="/contact" className="hover:underline">Careers</Link></li>
              <li><Link to="/contact" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contact & Location</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Kampala Road, Kampala<br />Uganda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>+256 700 000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <span>hello@cocofashionbrands.com</span>
              </li>
            </ul>
            <h3 className="font-bold mt-6 mb-3">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300"><Facebook size={20} /></a>
              <a href="#" className="text-white hover:text-gray-300"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4 md:mb-0">
            <Link to="/contact" className="hover:underline">Privacy Policy</Link>
            <Link to="/contact" className="hover:underline">Terms of Service</Link>
            <Link to="/contact" className="hover:underline">Shipping Policy</Link>
            <Link to="/contact" className="hover:underline">Return Policy</Link>
            <Link to="/contact" className="hover:underline">Accessibility</Link>
          </div>
          <p>© 2026 Coco's Fashion Brands. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
