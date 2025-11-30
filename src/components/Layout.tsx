import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Building2 } from 'lucide-react';
import logo from '../assets/Being logo.png';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Room Rates', path: '/room-rates' },
    { name: "Jury's Cafe", path: '/jurys-cafe' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Function Packages', path: '/function-packages' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-brandBlue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Being Suites" className="h-8 w-8 rounded-sm" />
              <span className="text-2xl font-bold text-brandBlue-700 font-title">Being Suites</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
                    location.pathname === item.path
                      ? 'text-brandRed-700 border-b-2 border-brandRed-700'
                      : 'text-brandBlue-700 hover:text-brandBlue-600 hover:bg-brandBlue-50 hover:underline underline-offset-8 decoration-brandRed-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-brandBlue-700 hover:text-brandBlue-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-lg"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                      location.pathname === item.path
                        ? 'text-brandRed-700 bg-brandBlue-50'
                        : 'text-brandBlue-700 hover:text-brandBlue-600 hover:bg-brandBlue-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-brandBlue-50 backdrop-blur-lg border-t border-brandBlue-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-brandBlue-700 mb-4">Being Suites</h3>
              <p className="text-brandBlue-700/80">
                Cozy Suites & Comfort in Davao City. Experience world-class hospitality and modern amenities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brandBlue-700 mb-4">Contact Info</h3>
              <p className="text-brandBlue-700/80">📍 3rd St Lot 16 Blk 20 Guadalupe Village Lanang</p>
              <p className="text-brandBlue-700/80">📞 (082) 308-2595</p>
              <p className="text-brandBlue-700/80">📱 0933-858-4013</p>
              <p className="text-brandBlue-700/80">✉️ chbeing@gmail.com</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brandBlue-700 mb-4">Hours</h3>
              <p className="text-brandBlue-700/80">Front Desk</p>
              <p className="text-brandBlue-700/80">Check-in: 2:00 PM</p>
              <p className="text-brandBlue-700/80">Check-out: 12:00 PM</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-brandBlue-100 text-center text-brandBlue-700/70">
            <p>&copy; 2024 Being Suites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
