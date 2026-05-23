import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

interface BookNowCTAProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const BookNowCTA: React.FC<BookNowCTAProps> = ({ 
  variant = 'primary', 
  size = 'medium',
  className = '' 
}) => {
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-[#1B4B9E] text-white hover:bg-[#D42B2B]',
    secondary: 'bg-white text-[#1B4B9E] border-2 border-[#1B4B9E] hover:bg-[#1B4B9E] hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(27, 75, 158, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/booking')}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        font-semibold rounded-lg
        transition-all duration-300 ease-in-out
        flex items-center gap-2
        shadow-lg
      `}
    >
      <Calendar size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />
      <span>Book Now</span>
      
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 bg-[#D42B2B] pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 0px rgba(212, 43, 43, 0)',
            '0 0 20px rgba(212, 43, 43, 0.5)',
            '0 0 0px rgba(212, 43, 43, 0)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </motion.button>
  );
};

export default BookNowCTA;
