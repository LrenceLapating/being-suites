import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Wifi, Coffee, Tv, AirVent, Car, Check, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import standardRoom1 from '../assets/standard room-1.png';
import standardRoom2 from '../assets/standard room-2.png';
import standardRoom3 from '../assets/standard room-3.png';
import standardRoom4 from '../assets/standard room-4.png';
import deluxeRoom1 from '../assets/deluxe room-1.png';
import deluxeRoom2 from '../assets/deluxe room-2.png';
import deluxeRoom3 from '../assets/deluxe room-3.png';
import twinRoom1 from '../assets/twin bed room-1.png';
import twinRoom2 from '../assets/twin bed room-2.png';
import twinRoom3 from '../assets/twin bed room-3.png';
import twinRoom4 from '../assets/twin bed room-4.png';

const RoomRates: React.FC = () => {
  const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
    const [index, setIndex] = useState(0);
    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);
    return (
      <div className="relative w-full h-80 rounded-xl overflow-hidden">
        <img src={images[index]} alt="Room photo" loading="eager" className="w-full h-full object-cover" />
        <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brandBlue-700 rounded-full p-2 shadow">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brandBlue-700 rounded-full p-2 shadow">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const roomSections = [
    {
      id: 1,
      name: 'Standard Room',
      price: '₱2,355.00',
      images: [standardRoom1, standardRoom2, standardRoom3, standardRoom4],
      details: { size: '28 sqm', capacity: '2 Adults', bed: '1 Queen Bed'},
      amenities: [
        'Free WiFi',
        'Intercom',
        'Office Desk',
        'Toilet with Wash let Bidet',
        'Split type air conditioning Unit',
        'Flat Screen T.V',
        'Carpeted Floor',
        'Hot & Cold (Solar Water Heater)'
      ],
      inclusions: ['Breakfast for 2', 'Daily housekeeping']
    },
    {
      id: 2,
      name: 'Deluxe Bedroom',
      price: '₱2,825.00',
      images: [deluxeRoom1, deluxeRoom2, deluxeRoom3],
      details: { size: '35 sqm', capacity: '2 Adults', bed: '1 King Bed' },
      amenities: [
        'Free WiFi',
        'Intercom',
        'Office Desk',
        'Toilet with Wash let Bidet',
        'Split type air conditioning Unit',
        'Flat Screen T.V',
        'Carpeted Floor',
        'Hot & Cold (Solar Water Heater)'
      ],
      inclusions: ['Breakfast for 2', 'Daily housekeeping']
    },
    {
      id: 3,
      name: 'Standard Twin Bed',
      price: '₱2,625.00',
      images: [twinRoom1, twinRoom2, twinRoom3, twinRoom4],
      details: { size: '30 sqm', capacity: '2 Adults', bed: '2 Twin Beds'},
      amenities: [
        'Free WiFi',
        'Intercom',
        'Office Desk',
        'Toilet with Wash let Bidet',
        'Split type air conditioning Unit',
        'Flat Screen T.V',
        'Carpeted Floor',
        'Hot & Cold (Solar Water Heater)'
      ],
      inclusions: ['Breakfast for 2', 'Daily housekeeping']
    }
  ];

  const amenityIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'Free WiFi': Wifi,
    'Smart TV': Tv,
    'Split type air conditioning Unit': AirVent,
    'Flat Screen T.V': Tv,
    'Intercom': Phone
  };

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
            Room <span className="text-brandRed-700">Rates</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-brandBlue-700/80 mb-12 max-w-3xl mx-auto"
          >
            Discover our range of luxurious accommodations designed to provide the ultimate comfort and elegance for your stay.
          </motion.p>
        </div>
      </section>

      {/* Room Sections */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-7xl mx-auto space-y-16">
          {roomSections.map((room, index) => (
            <div key={room.id} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <ImageCarousel images={room.images} />
              </div>
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <motion.div
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 border border-brandBlue-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-brandBlue-700">{room.name}</h3>
                    <div className="text-2xl font-bold text-brandRed-700">{room.price}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-brandBlue-700/80 mb-6">
                    <div className="flex justify-between"><span>Size</span><span>{room.details.size}</span></div>
                    <div className="flex justify-between"><span>Capacity</span><span>{room.details.capacity}</span></div>
                    <div className="flex justify-between"><span>Bed</span><span>{room.details.bed}</span></div>
                   
                  </div>
                  <div className="mb-4">
                    <h4 className="text-brandBlue-700 font-semibold mb-2">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities.map((amenity, i) => {
                        const IconComponent = (amenityIcons[amenity] ?? Star) as React.ComponentType<React.SVGProps<SVGSVGElement>>;
                        return (
                          <div key={i} className="flex items-center text-brandBlue-700/80 text-sm">
                            <IconComponent className="h-4 w-4 text-brandBlue-700 mr-2" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-brandBlue-700 font-semibold mb-2">Inclusions</h4>
                    <ul className="space-y-1">
                      {room.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-center text-brandBlue-700/80 text-sm">
                          <Check className="h-4 w-4 text-brandRed-700 mr-2" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to="/contact#how-to-book"
                    className="w-full inline-flex justify-center bg-brandBlue-700 text-white font-semibold py-3 rounded-lg hover:bg-brandBlue-600 transition-colors"
                  >
                    Reserve Now
                  </Link>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rates Notes */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 border border-brandBlue-100"
          >
            <h2 className="text-2xl font-bold text-brandBlue-700 mb-4">Room Rates</h2>
            <p className="text-brandBlue-700/80 mb-2">All rooms good for 2 persons WITH BREAKFAST</p>
            <ul className="space-y-1 text-brandBlue-700/80">
              <li>Extra person: ₱450.00/night</li>
              <li>Extra person w/ Bed: ₱650.00/night</li>
              <li>NOTE: Child 5 years old below is free of charge</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-brandBlue-700 mb-12"
          >
            Facilities
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Swimming Pool is Open from 8am to 8:30pm',
              'Café Resto is Open from 6:30am-8:30pm',
              'Common Kitchen',
              'Beer Garden (Located at 3rd Floor Roof top)',
              'Parking Area'
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-6 border border-brandBlue-100"
              >
                <p className="text-brandBlue-700/90">{text}</p>
              </motion.div>
            ))}
          </div>
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
            Ready to Book Your Stay?
          </motion.h2>
          <motion.p 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-white mb-8"
          >
            Contact our reservations team to secure your preferred room and enjoy exclusive benefits.
          </motion.p>
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/contact#how-to-book"
              className="inline-flex items-center px-8 py-4 bg-white text-brandBlue-700 font-semibold rounded-lg hover:bg-brandBlue-50 transition-all duration-300 transform hover:scale-105"
            >
              Make Reservation
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default RoomRates;
