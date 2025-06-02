import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#151B29] text-white">
      <div className="max-w-[1440px] mx-auto px-[120px] py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="mb-6">
              <img src="/ally_logo.svg" alt="ALLY Logo" className="w-[114px] h-10 brightness-0 invert" />
            </div>
            <p className="text-[#F0F7FF] text-base leading-relaxed mb-6">
              Revolutionizing legal services through AI-powered solutions and expert legal professionals.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-3">
              <div className="bg-[#293651] p-1.5 rounded">
                <Facebook className="w-6 h-6 text-[#F0F7FF]" strokeWidth={2} />
              </div>
              <div className="bg-[#293651] p-1.5 rounded">
                <Twitter className="w-6 h-6 text-[#F0F7FF]" strokeWidth={2} />
              </div>
              <div className="bg-[#293651] p-1.5 rounded">
                <Linkedin className="w-6 h-6 text-[#F0F7FF]" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.6)] text-base hover:text-white transition-colors">
                  AI Legal Consultation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.6)] text-base hover:text-white transition-colors">
                  Lawyer Matching
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.6)] text-base hover:text-white transition-colors">
                  Document Management
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.6)] text-base hover:text-white transition-colors">
                  Appointment Scheduling
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.5)] text-base hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.5)] text-base hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.5)] text-base hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-[rgba(233,236,245,0.5)] text-base hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">Contact Info</h3>
            <div className="space-y-4">
              <p className="text-[rgba(233,236,245,0.5)] text-base">
                7VVJ+QFR, Natalio B. Bacalso Ave, Cebu City, 6000 Cebu
              </p>
              <p className="text-[rgba(233,236,245,0.5)] text-base">
                Phone: (+63) 213-4223-421
              </p>
              <p className="text-[rgba(233,236,245,0.5)] text-base">
                Email: info@ally.com
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#7C7C7C] pt-8">
          <div className="flex justify-between items-center">
            <p className="text-[rgba(233,236,245,0.6)] text-xs">
              © 2025 ALLY TEAM 23. All rights reserved.
            </p>
            <div className="flex gap-3">
              <Link to="#" className="text-[rgba(233,236,245,0.6)] text-xs hover:text-white transition-colors">
                Security & Compliance
              </Link>
              <Link to="#" className="text-[rgba(233,236,245,0.6)] text-xs hover:text-white transition-colors">
                Legal Disclaimer
              </Link>
              <Link to="#" className="text-[rgba(233,236,245,0.6)] text-xs hover:text-white transition-colors">
                Professional Standards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
