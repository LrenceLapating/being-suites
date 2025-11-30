import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Calendar } from 'lucide-react';
import heroImg from '../assets/home page picture.png';
import poolside1 from '../assets/Poolside-1.jpg';
import beerGarden1 from '../assets/beer-garden-1.jpg';
import functionHall1 from '../assets/functionhall-1.jpg';
import cafe1 from '../assets/cafe-1.jpg';

const Home: React.FC = () => {
  // Local flip-card component to ensure proper 3D flip behavior
  const FacilityCard: React.FC<{ title: string; image: string; details: string; meta?: string }> = ({ title, image, details, meta }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="relative h-80 rounded-xl border border-brandBlue-100 overflow-hidden bg-white"
        style={{ perspective: 1000 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: hovered ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-2xl font-bold drop-shadow-md">{title}</h3>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-center bg-white"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
            <div>
              <h3 className="text-brandBlue-700 text-xl font-bold mb-2">{title}</h3>
              <p className="text-brandBlue-700/80 text-sm leading-relaxed">{details}</p>
              {meta && <p className="text-brandBlue-700/60 text-xs mt-3">{meta}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <img src={heroImg} alt="Being Suites" loading="eager" className="absolute inset-0 w-full h-full object-cover z-0" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-brandBlue-700 mb-6"
          >
            Welcome to <span className="text-brandRed-700">Being Suites</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl md:text-2xl text-brandBlue-700/80 mb-8"
          >
            Cozy Suites & Comfort in Davao City
          </motion.p>
          
          <motion.div 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/room-rates"
              className="group inline-flex items-center px-8 py-4 bg-brandBlue-700 text-white font-semibold rounded-lg hover:bg-brandBlue-600 transition-all duration-300 transform hover:scale-105"
            >
              View Room Rates
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/contact#how-to-book"
              className="group inline-flex items-center px-8 py-4 bg-transparent border-2 border-brandBlue-700 text-brandBlue-700 font-semibold rounded-lg hover:bg-brandBlue-700 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Book Us
              <Calendar className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center text-brandBlue-700 mb-12"
          >
            Why Choose Being Suites
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "5-Star Comfort", desc: "Experience premium accommodations with world-class amenities" },
              { icon: Users, title: "Expert Staff", desc: "Our dedicated team ensures your stay is memorable" },
              { icon: Calendar, title: "Flexible Booking", desc: "Easy reservation process with flexible cancellation" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center p-6 bg-white rounded-xl border border-brandBlue-100 hover:bg-brandBlue-50 transition-all duration-300 transform hover:scale-105"
              >
                <feature.icon className="h-12 w-12 text-brandBlue-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brandBlue-700 mb-2">{feature.title}</h3>
                <p className="text-brandBlue-700/80">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotel Facilities moved from About; flip-card style */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center text-brandBlue-700 mb-12"
          >
            Hotel Facilities
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FacilityCard
              title="Poolside"
              image={poolside1}
              details="Open-air ambiance by the pool—ideal for socials and sunset gatherings."
              meta="Minimum 25 persons • 4 hours"
            />
            <FacilityCard
              title="Beer Garden"
              image={beerGarden1}
              details="Relaxed garden vibe—great for cocktails, socials, and live music."
              meta="Minimum 25 persons • 4 hours"
            />
            <FacilityCard
              title="Function Hall"
              image={functionHall1}
              details="Elegant indoor venue—perfect for formal programs and large gatherings."
              meta="Minimum 25 persons • 4 hours"
            />
            <FacilityCard
              title="Jury's Cafe"
              image={cafe1}
              details="Local flavors meet international cuisine in an elegant setting."
              meta="Open daily 10am–9pm"
            />
          </div>
        </div>
      </section>

      {/* Day Tour Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 border border-brandBlue-100"
          >
            <h2 className="text-3xl font-bold text-brandBlue-700 mb-4">DAY TOUR</h2>
            <p className="text-brandBlue-700/80 mb-2">Mabuhay ug Madayaw!</p>
            <p className="text-brandBlue-700/80 mb-2">
              Hi, we have day tour package 450/per head (Adult/Kids) consumable with food. Good for 4 hours only.
            </p>
            <p className="text-brandBlue-700/80 mb-2">
              Free use of pool (250/food, 200/entrance fee)
            </p>
            <p className="text-brandBlue-700/80">
              We are open daily from 10am-9pm only. Thank you so much!
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-700 to-brandRed-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Experience Cozy Suites?
          </motion.h2>
          <motion.p 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-white mb-8"
          >
            Book your stay at Being Suites and discover the perfect blend of comfort and elegance.
          </motion.p>
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-brandBlue-700 font-semibold rounded-lg hover:bg-brandBlue-50 transition-all duration-300 transform hover:scale-105"
            >
              Contact Us Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
