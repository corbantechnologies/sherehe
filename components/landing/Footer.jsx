import React from "react";
import { Mail, Phone, MapPin, Calendar, Users, Ticket } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-red-600 via-red-700 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm mr-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Sherehe Tickets Kenya</h3>
            </div>
            <p className="text-white/90 mb-6 max-w-md">
              Your premier event management platform in Kenya. Discover, book,
              and manage amazing events with ease.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-white/80">
                <Ticket className="w-4 h-4 mr-2" />
                <span className="text-sm">Secure Ticketing</span>
              </div>
              <div className="flex items-center text-white/80">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">Event Management</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <a
                // signup link
                  href="#"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  Create Event
                </a>
              </li>
              {/* add more menus */}
              {/* <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  Support
                </a>
              </li> */}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-3 mt-1 flex-shrink-0" />
                <a
                  href="mailto:shereheticketskenya@gmail.com"
                  target="_blank"
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm break-all"
                >
                  shereheticketskenya@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <a
                  href="tel:+254710584581"
                  target="_blank"
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                >
                  +254 710 584 581
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white/80 text-sm">Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/70 text-sm text-center md:text-left">
              <p>
                &copy; {new Date().getFullYear()} Sherehe Tickets Kenya. All
                rights reserved.
              </p>
            </div>
            <div className="text-white/70 text-sm text-center md:text-right">
              <p>
                Powered by{" "}
                <span className="font-medium text-white">
                  Corban Technologies LTD
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
