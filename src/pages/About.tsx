import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Heart, MapPin } from 'lucide-react';

// Facility images removed from About; moved to Home page

// About page images
import aboutUsImg from '../assets/About us.jpg';
import primeLocationImg from '../assets/Prime location.png';

const About: React.FC = () => {
  // Facilities carousel removed; facilities moved to Home page

  const team = [
    {
      name: "Carlos Rodriguez",
      position: "General Manager",
      experience: "15+ years in hospitality management",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional+hotel+manager+portrait+business+attire+confident+smile+corporate+headshot&image_size=square"
    },
    {
      name: "Maria Santos",
      position: "Guest Services Director",
      experience: "12+ years in hospitality",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional+woman+hotel+manager+business+attire+confident+smile+corporate+portrait&image_size=square"
    },
    {
      name: "Antonio Lim",
      position: "Executive Chef",
      experience: "20+ years culinary experience",
      image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional+chef+portrait+white+uniform+confident+smile+restaurant+kitchen&image_size=square"
    }
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
            About <span className="text-brandRed-700">Being Suites</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-brandBlue-700/80 mb-12 max-w-3xl mx-auto"
          >
            Discover the story behind Davao City's premier hotel, where exceptional service meets modern elegance.
          </motion.p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-brandBlue-700 mb-6">Our Story</h2>
              <p className="text-brandBlue-700/80 mb-6 leading-relaxed">
                Founded in 2015, Being Suites began with a simple goal: to create a peaceful place where guests can relax, unwind, and feel at home. Located in Davao City, our suites hotel was built for travelers who value comfort, quiet moments, and a welcoming environment.
              </p>
              <p className="text-brandBlue-700/80 mb-6 leading-relaxed">
                From solo travelers to families, we have welcomed countless guests seeking a calm escape from busy routines. Many return to Being Suites because they appreciate our cozy atmosphere, friendly service, and the sense of peace that our place provides.

Through the years, we’ve stayed true to our mission — offering affordable, comfortable suites and genuine Filipino hospitality to everyone who needs a refreshing stay.
              </p>
              <div className="flex items-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brandBlue-700">9+</div>
                  <div className="text-brandBlue-700/80">Years of Service</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brandBlue-700">1k+</div>
                  <div className="text-brandBlue-700/80">Happy Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brandBlue-700">15+</div>
                  <div className="text-brandBlue-700/80">Rooms</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img
                src={aboutUsImg}
                alt="About Being Suites"
                className="rounded-xl shadow-2xl w-full h-80 object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-8 border border-brandBlue-100"
            >
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-brandBlue-700 mr-3" />
                <h3 className="text-2xl font-bold text-brandBlue-700">Our Mission</h3>
              </div>
              <p className="text-brandBlue-700/80 leading-relaxed">
                To provide exceptional hospitality experiences that exceed our guests' expectations through 
                personalized service, luxurious accommodations, and attention to every detail. We strive to 
                create memorable moments that make Being Suites the preferred choice for discerning travelers.
              </p>
            </motion.div>
            
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-8 border border-brandBlue-100"
            >
              <div className="flex items-center mb-6">
                <Heart className="h-8 w-8 text-brandBlue-700 mr-3" />
                <h3 className="text-2xl font-bold text-brandBlue-700">Our Vision</h3>
              </div>
              <p className="text-brandBlue-700/80 leading-relaxed">
                To be recognized as the leading hotel in Davao City and the Philippines, known for 
                our commitment to excellence, innovation in hospitality, and dedication to creating extraordinary 
                experiences that inspire loyalty and set new standards in the industry.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities Section moved to Home page */}

      {/* Team Section removed per request */}

      {/* Location Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-brandBlue-700 mb-6">Prime Location</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-brandBlue-700 mt-1" />
                  <div>
                    <h4 className="text-brandBlue-700 font-semibold">Address</h4>
                    <p className="text-brandBlue-700/80">3rd St Lot 16 Blk 20 Guadalupe Village Lanang</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 text-brandRed-700 mt-1 flex items-center justify-center">✈️</div>
                  <div>
                    <h4 className="text-brandBlue-700 font-semibold">Airport Access</h4>
                    <p className="text-brandBlue-700/80">15 minutes from Francisco Bangoy International Airport</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 text-brandRed-700 mt-1 flex items-center justify-center">🛍️</div>
                  <div>
                    <h4 className="text-brandBlue-700 font-semibold">Nearby Attractions</h4>
                    <p className="text-brandBlue-700/80">It’s about a 15 minute walk (~1.3 km) from Be-ing Suites to Damosa Gateway</p>
                    <p className="text-brandBlue-700/80">It’s around an 18 minute walk (~1.6 km) to SM Lanang Premier (the mall).</p>
                  </div>
                </div>  
              </div>
            </motion.div>
            
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 border border-brandBlue-100"
            >
              <img
                src={primeLocationImg}
                alt="Prime Location"
                className="rounded-lg w-full h-64 object-cover mb-4"
              />
              <p className="text-brandBlue-700/80 text-center">
                Located in the heart of Davao City, offering easy access to business districts and tourist attractions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
