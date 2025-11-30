import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Contact: React.FC = () => {
  const location = useLocation();

  // Ensure navigating to /contact#how-to-book scrolls to the section
  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        // Account for fixed header padding with a small offset
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [location]);

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://www.facebook.com/beingsuitesdavao', color: 'hover:text-blue-600' },
    { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/beingsuites/', color: 'hover:text-pink-600' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-brandBlue-700 mb-6"
          >
            Contact <span className="text-brandRed-700">Us</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-brandBlue-700/80 mb-12 max-w-3xl mx-auto"
          >
            We're here to help make your stay at Being Suites unforgettable. Reach out to us with any questions or concerns.
          </motion.p>
        </div>
      </section>

      {/* Booking & Contact (text-based) */}
      <section id="how-to-book" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 border border-brandBlue-100"
          >
            <h2 className="text-3xl font-bold text-brandBlue-700 mb-6">How to Book</h2>
            <p className="text-brandBlue-700/80 mb-6">
              Book your stay through our preferred platforms and direct channels. This page provides all the links and contact details you need.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <ExternalLink className="h-5 w-5 text-brandRed-700 mt-1" />
                <div>
                  <h4 className="text-brandBlue-700 font-semibold">Booking.com Listing</h4>
                  <p className="text-brandBlue-700/80">
                    Reserve via Booking.com:
                    <a href="https://www.booking.com/hotel/ph/be-ing-resort-house.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaLQBiAEBmAEzuAEXyAEM2AED6AEB-AEBiAIBqAIBuAKT3LDJBsACAdICJGMwYjdiMTkwLTBjZjctNGFkOC1hOTg5LTZhYzQ0ZmM3MDg3ZNgCAeACAQ&ucfs=1&arphpl=1" target="_blank" rel="noreferrer" className="ml-1 text-brandRed-700 hover:underline">Being Suites on Booking.com</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ExternalLink className="h-5 w-5 text-brandRed-700 mt-1" />
                <div>
                  <h4 className="text-brandBlue-700 font-semibold">Agoda Listing</h4>
                  <p className="text-brandBlue-700/80">
                    Reserve via Agoda:
                    <a href="https://www.agoda.com/be-ing-suites-davao/hotel/davao-city-ph.html?cid=1844104&ds=iX5Ry1oG1Sy%2FjOG%2B" target="_blank" rel="noreferrer" className="ml-1 text-brandRed-700 hover:underline">Being Suites on Agoda</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-brandRed-700 mt-1" />
                <div>
                  <h4 className="text-brandBlue-700 font-semibold">Call to Book</h4>
                  <p className="text-brandBlue-700/80">Telephone: (082) 308-2595</p>
                  <p className="text-brandBlue-700/80">Cellphone: 0933-858-4013</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brandRed-700 mt-1" />
                <div>
                  <h4 className="text-brandBlue-700 font-semibold">Walk-in</h4>
                  <p className="text-brandBlue-700/80">3rd St Lot 16 Blk 20 Guadalupe Village Lanang</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-brandBlue-700 mb-4">Social Media</h3>
              <p className="text-brandBlue-700/80 mb-4">You can message us on our social media for more inquiries like reservation and check-in.</p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} className="text-brandBlue-700 hover:text-brandRed-700" aria-label={social.name}>
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Media Highlight */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-brandBlue-700 mb-8"
          >
            Connect With Us
          </motion.h2>
          <motion.p 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-brandBlue-700/80 mb-6 max-w-2xl mx-auto"
          >
            You can message us on our social media for more inquiries like reservation and check-in.
          </motion.p>
          <div className="flex justify-center space-x-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                whileHover={{ scale: 1.1, rotateY: 15 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-brandBlue-700 hover:text-brandRed-700 transition-colors duration-300`}
                aria-label={social.name}
              >
                <social.icon className="h-8 w-8" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Address",
                content: "3rd St Lot 16 Blk 20 Guadalupe Village Lanang",
                color: "text-amber-400"
              },
              {
                icon: Phone,
                title: "Phone",
                content: "Telephone: (082) 308-2595 • Cellphone: 0933-858-4013",
                color: "text-amber-400"
              },
              {
                icon: Mail,
                title: "Email",
                content: "chbeing@gmail.com",
                subtitle: "Response within 2 hours",
                color: "text-amber-400"
              },
              {
                icon: Clock,
                title: "Hours",
                content: "Front Desk",
                subtitle: "Check-in: 2PM, Check-out: 12PM",
                color: "text-amber-400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center bg-white rounded-xl p-6 border border-brandBlue-100 hover:bg-brandBlue-50 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotateY: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon className={`h-12 w-12 text-brandBlue-700 mx-auto mb-4`} />
                </motion.div>
                <h3 className="text-xl font-bold text-brandBlue-700 mb-3">{item.title}</h3>
                <p className="text-brandBlue-700/80 font-semibold mb-1">{item.content}</p>
                {item.subtitle && <p className="text-brandBlue-700/60 text-sm">{item.subtitle}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Us (wide) */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-brandBlue-700 mb-6"
          >
            Find Us
          </motion.h2>
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-brandBlue-100 bg-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!4v1764476651212!6m8!1m7!1sTjZB-FU7FwIfuRIesKVHtA!2m2!1d7.106178820542732!2d125.6398365961473!3f7.664991098742917!4f0.939368577262556!5f0.7820865974627469"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Being Suites Location"
            />
          </div>
        </div>
      </section>


    </div>
  );
};

export default Contact;
