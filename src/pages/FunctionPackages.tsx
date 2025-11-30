import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Utensils, Music, Camera, Flower, Star, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Local assets for venue carousels
import pool1 from '../assets/Poolside-1.jpg';
import pool2 from '../assets/poolside-2.jpg';
import pool4 from '../assets/poolside-4.jpg';
import hall1 from '../assets/functionhall-1.jpg';
import hall3 from '../assets/functionhall-3.jpg';
import hall4 from '../assets/functionhall-4.jpg';
import garden1 from '../assets/beer-garden-1.jpg';
import garden2 from '../assets/beergarden-2.jpg';
import garden3 from '../assets/beergarden-3.jpg';

const FunctionPackages: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const navigate = useNavigate();
  // Simple image carousel component for venue cards
  const ImageCarousel: React.FC<{ images: string[]; alt?: string }> = ({ images, alt }) => {
    const [index, setIndex] = useState(0);
    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);
    return (
      <div className="relative overflow-hidden">
        <img
          src={images[index]}
          alt={alt || 'Function package image'}
          className="w-full h-64 object-cover transition-transform duration-300"
        />
        <button
          aria-label="Previous image"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brandBlue-700 p-2 rounded-full shadow"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Next image"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brandBlue-700 p-2 rounded-full shadow"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const packages = [
    {
      id: 'poolside',
      name: 'Poolside',
      price: '₱17,500',
      images: [pool1, pool2, pool4],
      capacity: 'Minimum 25 persons',
      duration: '4 hours',
      description: 'Open-air ambiance by the pool with ambient lighting and fresh breeze—ideal for socials, birthdays, and sunset gatherings. Easy flow between dining and lounge areas for a relaxed celebration.',
      features: [
        'Soup',
        '2 Main Courses (Chicken & Pork)',
        'Veggies or Pasta',
        'Dessert'
      ],
      inclusions: [
        'Rice',
        'Fresh fruit slices',
        'Drinks',
        'Tables and chairs',
        'Basic décor',
        'Parking access'
      ]
    },
    {
      id: 'functionHall',
      name: 'Function Hall',
      price: '₱17,500',
      images: [hall1, hall3, hall4],
      capacity: 'Minimum 25 persons',
      duration: '4 hours',
      description: 'Versatile indoor venue with elegant setup and climate-controlled comfort—perfect for formal programs and large gatherings. AV-ready space supports presentations, ceremonies, and staged performances.',
      features: [
        'Soup',
        '2 Main Courses (Chicken & Pork)',
        'Veggies or Pasta',
        'Dessert'
      ],
      inclusions: [
        'Rice',
        'Fresh fruit slices',
        'Drinks',
        'Tables and chairs',
        'Basic décor',
        'Parking access'
      ]
    },
    {
      id: 'beerGarden',
      name: 'Beer Garden',
      price: '₱17,500',
      images: [garden1, garden2, garden3],
      capacity: 'Minimum 25 persons',
      duration: '4 hours',
      description: 'Relaxed garden setting with a casual vibe—great for cocktails, socials, and live music. Open sky and ambient lighting create a warm, laid‑back atmosphere for evening events.',
      features: [
        'Soup',
        '2 Main Courses (Chicken & Pork)',
        'Veggies or Pasta',
        'Dessert'
      ],
      inclusions: [
        'Rice',
        'Fresh fruit slices',
        'Drinks',
        'Tables and chairs',
        'Basic décor',
        'Parking access'
      ]
    }
  ];

  const venueFeatures = [
    {
      icon: Users,
      title: "Flexible Capacity",
      description: "Accommodate from intimate gatherings to grand celebrations"
    },
    {
      icon: Utensils,
      title: "Premium Catering",
      description: "Customized menus crafted by our award-winning chefs"
    },
    {
      icon: Music,
      title: "Entertainment Ready",
      description: "Professional sound systems and entertainment setups"
    },
    {
      icon: Camera,
      title: "Photography Areas",
      description: "Beautiful backdrops and photo opportunities"
    },
    {
      icon: Flower,
      title: "Custom Decorations",
      description: "Personalized themes and elegant decorations"
    },
    {
      icon: Calendar,
      title: "Event Coordination",
      description: "Professional planning and coordination services"
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
            Function <span className="text-brandRed-700">Packages</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-brandBlue-700/80 mb-12 max-w-3xl mx-auto"
          >
            Celebrate life's special moments with our comprehensive function packages designed to make your events unforgettable.
          </motion.p>
        </div>
      </section>

      

      {/* Function Packages */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center text-brandBlue-700 mb-12"
          >
            Our Function Packages
          </motion.h2>
          {/* Package Details Intro */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 border border-brandBlue-100 mb-12"
          >
            <h3 className="text-2xl font-bold text-brandBlue-700 mb-4">Function Packages</h3>
            <p className="text-brandBlue-700/80 mb-4">
              Mabuhay ug Madayaw! We have Exclusive Packages minimum of 25 persons good for 4 hours only.
            </p>
            <p className="text-brandBlue-700/80 mb-6">
              We have 2 sets to choose from; served with Rice, Fresh Fruits Slices and Drinks.
            </p>
            <div>
              <h4 className="text-brandRed-700 font-semibold mb-2">Set A – Php 17,500.00</h4>
              <ul className="list-disc pl-6 text-brandBlue-700/80 space-y-1">
                <li>Soup</li>
                <li>2 Main Courses (Chicken & Pork)</li>
                <li>Veggies or Pasta</li>
                <li>Dessert</li>
              </ul>
              <h4 className="text-brandRed-700 font-semibold mb-2 mt-6">Set B – Php 20,000.00</h4>
              <ul className="list-disc pl-6 text-brandBlue-700/80 space-y-1">
                <li>Soup</li>
                <li>Chicken</li>
                <li>Pork or Beef</li>
                <li>Seafood</li>
                <li>Veggies or Pasta</li>
                <li>Dessert</li>
              </ul>
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl overflow-hidden border border-brandBlue-100 hover:bg-brandBlue-50 transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <ImageCarousel images={pkg.images} alt={pkg.name} />
                  <div className="absolute top-4 right-4 bg-brandBlue-700 text-white px-4 py-2 rounded-full text-lg font-bold">
                    {pkg.price}
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-brandBlue-700 mr-4">{pkg.name}</h3>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-4 text-brandBlue-700/80">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{pkg.capacity}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>
                  
                  <p className="text-brandBlue-700/80 mb-6 leading-relaxed">{pkg.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-brandRed-700 font-semibold mb-3">Package Features:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-brandBlue-700/80 text-sm">
                          <Check className="h-4 w-4 text-brandRed-700 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-brandRed-700 font-semibold mb-3">Special Inclusions:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {pkg.inclusions.map((inclusion, inclusionIndex) => (
                        <div key={inclusionIndex} className="flex items-center text-brandBlue-700/80 text-sm">
                          <Check className="h-3 w-3 text-brandRed-700 mr-2 flex-shrink-0" />
                          {inclusion}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/contact#how-to-book')}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                  >
                    Book This Package
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Venues section removed as requested */}

      

      {/* Booking CTA removed as requested */}
    </div>
  );
};

export default FunctionPackages;
