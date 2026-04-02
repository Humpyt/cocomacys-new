import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-12 pb-6 text-sm font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:underline">FAQs and Help</a></li>
              <li><a href="#" className="hover:underline">Klarna</a></li>
              <li><a href="#" className="hover:underline">Order Lookup</a></li>
              <li><a href="#" className="hover:underline">Para Ayuda</a></li>
              <li><a href="#" className="hover:underline">Returns</a></li>
              <li><a href="#" className="hover:underline">Shipping & Delivery</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Macy's Credit Card</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:underline">Apply for Macy's Credit Card</a></li>
              <li><a href="#" className="hover:underline">Cardholder Benefits</a></li>
              <li><a href="#" className="hover:underline">Gift Cards</a></li>
              <li><a href="#" className="hover:underline">Gift Card Balance</a></li>
              <li><a href="#" className="hover:underline">Macy's Card Services</a></li>
              <li><a href="#" className="hover:underline">Pay Your Credit Card Bill</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Stores & Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:underline">Curbside & In Store Pickup</a></li>
              <li><a href="#" className="hover:underline">Locations & Hours</a></li>
              <li><a href="#" className="hover:underline">Macy's App</a></li>
              <li><a href="#" className="hover:underline">Macy's Backstage</a></li>
              <li><a href="#" className="hover:underline">Macy's Brands</a></li>
              <li><a href="#" className="hover:underline">Macy's Wine Shop</a></li>
              <li><a href="#" className="hover:underline">Personal Stylist</a></li>
              <li><a href="#" className="hover:underline">Store Events</a></li>
              <li><a href="#" className="hover:underline">Store Openings</a></li>
              <li><a href="#" className="hover:underline">Book an Eye Exam</a></li>
              <li><a href="#" className="hover:underline">Tell Us What You Think</a></li>
              <li><a href="#" className="hover:underline">Gift Registry</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Macy's Inc.</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:underline">Corporate Sales</a></li>
              <li><a href="#" className="hover:underline">Corporate Site</a></li>
              <li><a href="#" className="hover:underline">Investors</a></li>
              <li><a href="#" className="hover:underline">International Wholesale & Sourcing</a></li>
              <li><a href="#" className="hover:underline">Macy's Jobs</a></li>
              <li><a href="#" className="hover:underline">News Room</a></li>
              <li><a href="#" className="hover:underline">Site Map</a></li>
              <li><a href="#" className="hover:underline">Sustainability</a></li>
              <li><a href="#" className="hover:underline">Styled and Storied</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Be the first to know with our emails</h3>
            <p className="text-gray-300 mb-4">If texts are more your style, we can send those too</p>
            <div className="flex mb-6">
              <input type="email" placeholder="Enter your email address" className="px-4 py-2 w-full text-black focus:outline-none" />
              <button className="bg-white text-black px-4 py-2 font-bold border-l border-gray-300">Sign Me Up</button>
            </div>
            <p className="text-gray-300 mb-4">Get 30% off macys.com purchases today when you open a Macy's card. Discount in store varies. Save up to $100.</p>
            <div className="flex items-start space-x-2 mb-6">
              <div className="bg-orange-600 text-white font-bold px-2 py-1 text-xs rounded">★ macy's</div>
              <p className="text-xs text-gray-400">Check if you prequalify, no risk to your credit score. Subject to credit approval. <a href="#" className="underline">Exclusions & Details</a> <a href="#" className="underline">Check Now</a></p>
            </div>
            <h3 className="font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300"><Facebook size={20} /></a>
              <a href="#" className="text-white hover:text-gray-300"><Instagram size={20} /></a>
              <a href="#" className="text-white hover:text-gray-300"><Twitter size={20} /></a>
              <a href="#" className="text-white hover:text-gray-300"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4 md:mb-0">
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Cookie Preferences</a>
            <a href="#" className="hover:underline">Interest Based Ads</a>
            <a href="#" className="hover:underline">CA Privacy Rights</a>
            <a href="#" className="hover:underline">Do Not Sell or Share My Personal Information</a>
            <a href="#" className="hover:underline">Legal Notice</a>
            <a href="#" className="hover:underline">Customer Bill of Rights</a>
            <a href="#" className="hover:underline">CA Transparency in Supply Chains</a>
            <a href="#" className="hover:underline">Product Recalls</a>
            <a href="#" className="hover:underline">Pricing Policy</a>
            <a href="#" className="hover:underline">Accessibility</a>
          </div>
          <p>© 2026 Macy's. All rights reserved. Macys.com, LLC, 151 West 34th Street, New York, NY 10001. Request our <a href="#" className="underline">corporate name & address by email.</a></p>
        </div>
      </div>
    </footer>
  );
}
