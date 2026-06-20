import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import logo from '../assets/Being logo.png';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Room Rates', path: '/room-rates' },
    { name: 'Book Now', path: '/booking' },
    { name: "Jury's Cafe", path: '/jurys-cafe' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Function Packages', path: '/function-packages' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className={`premium-nav fixed top-0 w-full z-50 ${isScrolled ? 'premium-nav--scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3" aria-label="Being Suites home">
              <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover" />
              <span className="premium-nav__brand font-title">Being Suites</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} className={`premium-nav__link ${location.pathname === item.path ? 'premium-nav__link--active' : ''}`}>
                  {item.name}
                </Link>
              ))}
            </div>

            <button className="premium-nav__menu md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#fbf9f4]/95 backdrop-blur-xl border-t border-black/5 overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className={`block px-3 py-3 text-sm font-medium ${location.pathname === item.path ? 'text-[#a1773e]' : 'text-[#173c38]'}`}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="premium-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3>Being Suites</h3>
              <p>Cozy Suites &amp; Comfort in Davao City. Experience world-class hospitality and modern amenities.</p>
            </div>
            <div>
              <h3>Contact Info</h3>
              <p className="premium-footer__line"><MapPin size={15} /> 3rd St Lot 16 Blk 20 Guadalupe Village Lanang</p>
              <p className="premium-footer__line"><Phone size={15} /> (082) 308-2595 · 0933-858-4013</p>
              <p className="premium-footer__line"><Mail size={15} /> chbeing@gmail.com</p>
            </div>
            <div>
              <h3>Hours</h3>
              <p>Front Desk</p>
              <p>Check-in: 2:00 PM</p>
              <p>Check-out: 12:00 PM</p>
            </div>
          </div>
          <div className="premium-footer__legal"><p>&copy; 2024 Being Suites. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
