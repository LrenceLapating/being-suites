import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, Coffee, Utensils } from 'lucide-react';
import cafe1 from '../assets/cafe-1.jpg';
import cafe2 from '../assets/cafe-2.jpg';
import cafe3 from '../assets/cafe-3.jpg';

const JurysCafe: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Resolve image asset paths without importing each file
  const asset = (name: string) => new URL(`../assets/${name}`, import.meta.url).href;

  const menuCategories = [
    { id: 'all', name: 'All Items', icon: Utensils },
    { id: 'pasta', name: 'Pasta', icon: Utensils },
    { id: 'pizza', name: 'Pizza', icon: Utensils },
    { id: 'chickenBasket', name: "Chicken", icon: Utensils },
    { id: 'riceBowl', name: 'Rice Bowl', icon: Utensils },
    { id: 'favorites', name: 'All Time Favorite', icon: Utensils },
    { id: 'pulutan', name: 'Sizzling Pulutan', icon: Utensils },
    { id: 'snacks', name: 'Snacks', icon: Utensils },
    { id: 'smoothie', name: 'Smoothie', icon: Coffee },
    { id: 'soupSalad', name: 'Soup/Salad', icon: Utensils },
    { id: 'veggiesNoodles', name: 'Vegetables/Noodles', icon: Utensils }
  ];

  const menuItems = [
    // Pasta
    { id: 1, name: 'Al Pesto', category: 'pasta', price: '₱199.00', description: 'Choice of Penne, Linguine, or Spaghetti', image: asset('Al pesto pasta.jpg') },
    { id: 2, name: 'Aglio e Olio', category: 'pasta', price: '₱199.00', description: 'Garlic and olive oil pasta', image: asset('Aglio Olio.jpeg') },
    { id: 3, name: 'Seafood Marinara', category: 'pasta', price: '₱249.00', description: 'Tomato-based sauce with seafood', image: asset('Sea food marinara pasta.jpg') },
    { id: 4, name: 'Tomato Mozzarella', category: 'pasta', price: '₱260.00', description: 'Fresh tomato with mozzarella', image: asset('Tomato Mozzzarella pasta.jpg') },
    { id: 5, name: 'Napolitan', category: 'pasta', price: '₱249.00', description: 'Classic Japanese-style spaghetti', image: asset('Napolitan pasta.jpg') },
    { id: 6, name: 'Tuna Umeboshi', category: 'pasta', price: '₱290.00', description: 'Tuna with pickled plum', image: asset('Tuna umeboshi.jpg') },
    { id: 7, name: 'Carbonara', category: 'pasta', price: '₱249.00', description: 'Creamy bacon and egg sauce', image: asset('Carbonara.jpg') },

    // Pizza
    { id: 20, name: 'Pizza Margherita', category: 'pizza', price: '₱319.00', description: 'Tomato, mozzarella, basil', image: asset('pizza margharita.jpg') },
    { id: 21, name: 'Hawaiian Fiesta', category: 'pizza', price: '₱329.00', description: 'Ham and pineapple', image: asset('hawaiian fiesta.jpg') },
    { id: 22, name: "Jury’s Pepperoni", category: 'pizza', price: '₱339.00', description: 'Signature pepperoni', image: asset('pizza margharita.jpg') },
    { id: 23, name: 'Protein Overload', category: 'pizza', price: '₱369.00', description: 'Meat-lovers special', image: asset('protein overload pizza.jpg') },
    { id: 24, name: 'Seafood Marinara', category: 'pizza', price: '₱369.00', description: 'Seafood toppings', image: asset('Sea food marinara pizza.jpg') },
    { id: 25, name: '3 Cheese', category: 'pizza', price: '₱369.00', description: 'Mozzarella, cheddar, parmesan', image: asset('3 cheese.jpg') },
    { id: 26, name: 'Al Pesto', category: 'pizza', price: '₱339.00', description: 'Pesto base with cheese', image: asset('al pesto pizza.jpg') },

    // Chicken n' Basket
    { id: 40, name: 'Chicken in Basket w/ Fries', category: 'chickenBasket', price: '₱349.00', description: 'Crispy chicken with fries', image: asset('chicken n basket with fires.jpg') },
    { id: 41, name: 'Karaage', category: 'chickenBasket', price: '₱329.00', description: 'Japanese fried chicken', image: asset('chicken karaage.jpg') },
    { id: 42, name: 'Spicy Korean', category: 'chickenBasket', price: '₱379.00', description: 'Korean-style spicy glaze', image: asset('spicy korean chicken.jpg') },
    { id: 43, name: 'Buffalo', category: 'chickenBasket', price: '₱349.00', description: 'Classic buffalo sauce', image: asset('chicken buffalo.jpg') },
    { id: 44, name: 'Parmesan Garlic', category: 'chickenBasket', price: '₱379.00', description: 'Garlic parmesan coating', image: asset('Parmesan Garlic.jpg') },
    { id: 45, name: 'Lemon-Fire', category: 'chickenBasket', price: '₱379.00', description: 'Zesty and spicy', image: asset('chicken lemon fire.avif') },
    { id: 46, name: 'Honey BBQ', category: 'chickenBasket', price: '₱379.00', description: 'Sweet and smoky BBQ', image: asset('chicken honey bbq.jpg') },
    { id: 47, name: 'Sweet & Spicy', category: 'chickenBasket', price: '₱379.00', description: 'Sweet heat glaze', image: asset('chicken sweet & spicy.webp') },

    // Rice Bowl
    { id: 60, name: 'Katsudon', category: 'riceBowl', price: '₱249.00', description: 'Pork cutlet rice bowl', image: asset('Katsudon.jpg') },
    { id: 61, name: 'Tonkatsu', category: 'riceBowl', price: '₱249.00', description: 'Crispy pork cutlet', image: asset('Tonkatsu.jpg') },
    { id: 62, name: '2-pc Spicy Korean', category: 'riceBowl', price: '₱199.00', description: 'Spicy Korean chicken', image: asset('2pc spicy korean.jpg') },
    { id: 63, name: '2-pc Parmesan Garlic', category: 'riceBowl', price: '₱199.00', description: 'Garlic parmesan chicken', image: asset('2-pc Parmesan Garlic.jpg') },
    { id: 64, name: '2-pc Buffalo Wings', category: 'riceBowl', price: '₱199.00', description: 'Buffalo chicken wings', image: asset('2-pc Buffalo Wings.jpg') },
    { id: 65, name: '2-pc Chicken Lemon-Fire', category: 'riceBowl', price: '₱199.00', description: 'Lemon-fire chicken', image: asset('chicken lemon fire.avif') },
    { id: 66, name: '2-pc Honey BBQ', category: 'riceBowl', price: '₱199.00', description: 'Honey BBQ chicken', image: asset('chicken honey bbq.jpg') },
    { id: 67, name: '2-pc Sweet & Spicy', category: 'riceBowl', price: '₱199.00', description: 'Sweet & spicy chicken', image: asset('chicken sweet & spicy.webp') },

    // All Time Favorite
    { id: 80, name: 'Crispy Pata', category: 'favorites', price: '₱750.00', description: 'Crispy pork knuckle', image: asset('Crispy Pata.jpg') },
    { id: 81, name: 'Lechon Kawali', category: 'favorites', price: '₱379.00', description: 'Crispy pork belly', image: asset('Lechon Kawali.webp') },
    { id: 82, name: 'Shrimp Halabos', category: 'favorites', price: '₱349.00', description: 'Garlic butter shrimp', image: asset('Shrimp Halabos.jpg') },
    { id: 83, name: 'Spicy Gambas', category: 'favorites', price: '₱349.00', description: 'Spicy sautéed shrimp', image: asset('Spicy Gambas.webp') },
    { id: 84, name: 'Beef Caldereta w/Rice', category: 'favorites', price: '₱319.00', description: 'Hearty beef stew', image: asset('Beef Caldereta wRice.webp') },

    // Sizzling Pulutan
    { id: 100, name: 'Pork Sisig', category: 'pulutan', price: '₱289.00', description: 'Sizzling pork sisig', image: asset('Pork Sisig.jpg') },
    { id: 101, name: 'Calamares', category: 'pulutan', price: '₱299.00', description: 'Fried squid rings', image: asset('Calamares.avif') },
    { id: 102, name: 'Tuna Belly/Panga', category: 'pulutan', price: '₱279.00', description: 'Grilled tuna belly/panga', image: asset('Tuna Belly Panga.webp') },
    { id: 103, name: 'Tuna Kinilaw', category: 'pulutan', price: '₱319.00', description: 'Filipino tuna ceviche', image: asset('Tuna Kinilaw.avif') },
    { id: 104, name: 'Sashimi', category: 'pulutan', price: '₱309.00', description: 'Assorted sashimi', image: asset('Sashimi.webp') },
    { id: 105, name: 'Fish & Chips', category: 'pulutan', price: '₱289.00', description: 'Battered fish with fries', image: asset('Fish & Chips.jpg') },

    // Snacks
    { id: 120, name: 'French Fries', category: 'snacks', price: '₱179.00', description: 'Crispy fries', image: asset('French Fries.jpg') },
    { id: 121, name: 'Overload Fries', category: 'snacks', price: '₱199.00', description: 'Loaded fries', image: asset('Overload Fries.jpg') },
    { id: 122, name: 'Nachos', category: 'snacks', price: '₱219.00', description: 'Cheesy nachos', image: asset('Natchos.jpg') },
    { id: 123, name: 'Cheese Sticks', category: 'snacks', price: '₱199.00', description: 'Fried cheese sticks', image: asset('Cheese Sticks.jpg') },
    { id: 124, name: 'Potato Chips', category: 'snacks', price: '₱149.00', description: 'Crispy potato chips', image: asset('Potato Chips.jpg') },
    { id: 125, name: 'Bacon Mushroom Burger', category: 'snacks', price: '₱249.00', description: 'Burger with bacon & mushroom', image: asset('Bacon Mushroom Burger.jpg') },
    { id: 126, name: 'Chicken Burger w/ Fries', category: 'snacks', price: '₱229.00', description: 'Chicken burger meal', image: asset('Chicken Burger w Fries.jpg') },
    { id: 127, name: 'Fish Fillet Burger w/ Fries', category: 'snacks', price: '₱219.00', description: 'Fish burger meal', image: asset('Fish Fillet Burger w Fries.webp') },
    { id: 128, name: 'Bacon Burger w/ Fries', category: 'snacks', price: '₱219.00', description: 'Bacon burger meal', image: asset('Bacon Burger w Fries.jpg') },

    // Smoothie
    { id: 140, name: 'Mango', category: 'smoothie', price: '₱110.00', description: 'Fresh mango smoothie', image: asset('mango-smoothie.jpg') },
    { id: 141, name: 'Avocado', category: 'smoothie', price: '₱100.00', description: 'Creamy avocado smoothie', image: asset('Avocado.jpg') },
    { id: 142, name: 'Melon', category: 'smoothie', price: '₱110.00', description: 'Refreshing melon smoothie', image: asset('Melon.jpg') },
    { id: 143, name: 'Mix-Berries', category: 'smoothie', price: '₱120.00', description: 'Mixed berries smoothie', image: asset('Mix-Berries.jpg') },
    { id: 144, name: 'Matcha Iced Tea', category: 'smoothie', price: '₱120.00', description: 'Matcha green tea ice blend', image: asset('Matcha Iced Tea.jpg') },

    // Soup/Salad
    { id: 160, name: 'Beef Bulalo', category: 'soupSalad', price: '₱430.00', description: 'Beef marrow soup', image: asset('Beef Bulalo.jpg') },
    { id: 161, name: 'Balbacua', category: 'soupSalad', price: '₱379.00', description: 'Beef stew specialty', image: asset('Balbacua.webp') },
    { id: 162, name: 'Sinigang Pork', category: 'soupSalad', price: '₱389.00', description: 'Tamarind pork soup', image: asset('Sinigang Pork.jpg') },
    { id: 163, name: 'Sinigang Shrimp', category: 'soupSalad', price: '₱299.00', description: 'Tamarind shrimp soup', image: asset('Sinigang Shrimp.avif') },
    { id: 164, name: 'Tinolang Manok', category: 'soupSalad', price: '₱289.00', description: 'Ginger chicken soup', image: asset('Tinolang Manok.jpg') },
    { id: 165, name: 'Be-ing Salad', category: 'soupSalad', price: '₱289.00', description: 'House salad', image: asset('Be-ing Salad.jpg') },
    { id: 166, name: 'Caesar Salad', category: 'soupSalad', price: '₱279.00', description: 'Classic Caesar', image: asset('Caesar Salad.jpg') },

    // Vegetables/Noodles
    { id: 180, name: 'Chopsuey', category: 'veggiesNoodles', price: '₱309.00', description: 'Stir-fried mixed vegetables', image: asset('Chopsuey.jpg') },
    { id: 181, name: 'Pakbet', category: 'veggiesNoodles', price: '₱249.00', description: 'Filipino vegetable medley', image: asset('Pakbet.jpg') },
    { id: 182, name: 'Pancit Canton', category: 'veggiesNoodles', price: '₱299.00', description: 'Stir-fried noodles', image: asset('Pancit Canton.jpg') },
    { id: 183, name: 'Sauteed Sotanghon', category: 'veggiesNoodles', price: '₱299.00', description: 'Glass noodles sautéed', image: asset('Sauteed Sotanghon.jpg') },
    { id: 184, name: 'Bam-e', category: 'veggiesNoodles', price: '₱299.00', description: 'Cebuano noodle dish', image: asset('Bam-e.jpg') },
    { id: 185, name: 'Bihon Guisado', category: 'veggiesNoodles', price: '₱289.00', description: 'Rice noodles sautéed', image: asset('Bihon Guisado.jpg') }
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // Paginate menu items: show 6 per page with a Next button
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const cafeImages = [cafe1, cafe2];

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
            Jury's <span className="text-brandRed-700">Cafe</span>
          </motion.h1>
          
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-brandBlue-700/80 mb-12 max-w-3xl mx-auto"
          >
            Experience culinary excellence at Jury's Cafe, where local flavors meet international cuisine in an elegant setting.
          </motion.p>
        </div>
      </section>

      {/* Cafe Gallery */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center text-brandBlue-700 mb-12"
          >
            Cafe Ambiance
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {cafeImages.map((image, index) => (
              <motion.div
                key={index}
                initial={false}
                whileInView={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src={image}
                  alt={`Cafe interior ${index + 1}`}
                  className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 border border-brandBlue-100 text-center"
          >
            <Clock className="h-12 w-12 text-brandBlue-700 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-brandBlue-700 mb-6">Operating Hours</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-brandBlue-700 font-semibold mb-2">Breakfast</h4>
                <p className="text-brandBlue-700/80">6:00 AM - 10:30 AM</p>
              </div>
              <div>
                <h4 className="text-brandBlue-700 font-semibold mb-2">Lunch</h4>
                <p className="text-brandBlue-700/80">11:00 AM - 2:30 PM</p>
              </div>
              <div>
                <h4 className="text-brandBlue-700 font-semibold mb-2">Dinner</h4>
                <p className="text-brandBlue-700/80">6:00 PM - 10:00 PM</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-brandRed-700/10 rounded-lg">
              <p className="text-brandRed-700 font-semibold">24-Hour Room Service Available</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center text-brandBlue-700 mb-12"
          >
            Our Menu
          </motion.h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {menuCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-brandBlue-700 text-white'
                      : 'bg-white text-brandBlue-700 hover:bg-brandBlue-50'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{category.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Menu Items (6 per page) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl overflow-hidden border border-brandBlue-100 hover:bg-brandBlue-50 transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                    <div className="absolute top-4 right-4 bg-brandBlue-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.price}
                    </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brandBlue-700 mb-2">{item.name}</h3>
                  <p className="text-brandBlue-700/80 text-sm leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-brandRed-700 fill-current" />
                      ))}
                    </div>
                    <span className="text-brandBlue-700 font-semibold">{item.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination controls: Back and Next */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 0}
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                className="px-6 py-3 bg-brandBlue-700 text-white font-semibold rounded-lg hover:bg-brandBlue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page >= totalPages - 1}
              >
                Next
              </motion.button>
            </div>
          )}
      </div>
    </section>

      {/* Contact Info */}
      <section className="py-20 px-4 bg-gradient-to-r from-brandBlue-700 to-brandRed-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Visit Jury's Cafe
          </motion.h2>
          
          <motion.div 
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-8 mt-8"
          >
            <div className="bg-white rounded-xl p-6 border border-brandBlue-100">
              <MapPin className="h-8 w-8 text-brandBlue-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-brandBlue-700 mb-2">Location</h3>
              <p className="text-brandBlue-700/80">Found in Main entrance right side.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default JurysCafe;
