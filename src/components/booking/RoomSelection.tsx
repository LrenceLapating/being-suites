import React from 'react';
import { motion } from 'framer-motion';
import { RoomType } from '../../pages/Booking';
import logoUrl from '../../assets/Being logo.png';
import deluxeImg from '../../assets/deluxe room-1.png';
import standardImg from '../../assets/standard room-1.png';
import twinImg from '../../assets/twin bed room-1.png';

interface RoomSelectionProps {
  onSelectRoom: (roomType: RoomType) => void;
}

const rooms = [
  {
    type: 'deluxe' as RoomType,
    name: 'Deluxe Room',
    description: 'Spacious luxury with premium amenities and stunning views',
    image: deluxeImg,
    features: ['King Bed', 'City View', 'Premium Bath'],
  },
  {
    type: 'regular' as RoomType,
    name: 'Standard Room',
    description: 'Comfortable and elegant, perfect for a relaxing stay',
    image: standardImg,
    features: ['Queen Bed', 'Modern Design', 'Free WiFi'],
  },
  {
    type: 'suite' as RoomType,
    name: 'Twin Bed Suite',
    description: 'Ultimate comfort with separate living area and twin beds',
    image: twinImg,
    features: ['Twin Beds', 'Living Area', 'Premium Service'],
  },
];

const RoomSelection: React.FC<RoomSelectionProps> = ({ onSelectRoom }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 w-full h-64 opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="#1B4B9E"
            fillOpacity="0.3"
            initial={{
              d: "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            }}
            animate={{
              d: [
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,154.7C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <img
            src={logoUrl}
            alt="Be-Ing Suites"
            className="h-24 mx-auto mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-serif text-[#1B4B9E] mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Choose from our carefully curated rooms designed for comfort and elegance
          </p>
        </motion.div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {rooms.map((room, index) => (
            <motion.div
              key={room.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(27, 75, 158, 0.15)' }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#1B4B9E] mb-3">
                  {room.name}
                </h3>
                <p className="text-[#6B7280] mb-4 min-h-[3rem]">
                  {room.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {room.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-[#F5F7FA] text-[#1B4B9E] text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectRoom(room.type)}
                  className="w-full py-3 bg-[#1B4B9E] text-white font-semibold rounded-lg transition-all duration-300 ease-in-out hover:bg-[#D42B2B] hover:shadow-lg"
                >
                  Select Room
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
