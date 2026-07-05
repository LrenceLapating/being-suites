import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Calendar, ChevronDown, Clock3, Star, Users, X } from 'lucide-react';
import heroImg from '../assets/home page picture.png';
import poolside1 from '../assets/Poolside-1.jpg';
import beerGarden1 from '../assets/beer-garden-1.jpg';
import functionHall1 from '../assets/functionhall-1.jpg';
import cafe1 from '../assets/cafe-1.jpg';
import './Home.css';

const reveal = {
  hidden: { opacity: 0, y: 38 },
  visible: { opacity: 1, y: 0 },
};

const facilities = [
  {
    title: 'Poolside',
    image: poolside1,
    details: 'Open-air ambiance by the pool—ideal for socials and sunset gatherings.',
    meta: 'Minimum 25 persons • 4 hours',
    number: '01',
  },
  {
    title: 'Beer Garden',
    image: beerGarden1,
    details: 'Relaxed garden vibe—great for cocktails, socials, and live music.',
    meta: 'Minimum 25 persons • 4 hours',
    number: '02',
  },
  {
    title: 'Function Hall',
    image: functionHall1,
    details: 'Elegant indoor venue—perfect for formal programs and large gatherings.',
    meta: 'Minimum 25 persons • 4 hours',
    number: '03',
  },
  {
    title: "Jury's Cafe",
    image: cafe1,
    details: 'Local flavors meet international cuisine in an elegant setting.',
    meta: 'Open daily 10am–9pm',
    number: '04',
  },
];

type Facility = (typeof facilities)[number];

const TiltCard: React.FC<{ facility: Facility; onOpen: () => void }> = ({ facility, onOpen }) => {
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const smoothY = useSpring(rotateY, { stiffness: 180, damping: 22 });

  const handleMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateX.set(((event.clientY - rect.top) / rect.height - 0.5) * -8);
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      variants={reveal}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onOpen}
      onKeyDown={(event) => event.key === 'Enter' && onOpen()}
      role="button"
      tabIndex={0}
      style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 1100 }}
      className="facility-card group"
      aria-label={`View ${facility.title}`}
    >
      <img src={facility.image} alt={facility.title} loading="lazy" />
      <div className="facility-card__veil" />
      <span className="facility-card__number">{facility.number}</span>
      <div className="facility-card__content">
        <p>{facility.meta}</p>
        <h3>{facility.title}</h3>
        <div className="facility-card__detail">
          <span>{facility.details}</span>
          <span className="facility-card__arrow"><ArrowRight size={18} /></span>
        </div>
      </div>
    </motion.article>
  );
};

const Home: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeFacility, setActiveFacility] = useState<Facility | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '22%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.13]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 105]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.74], [1, 0]);

  return (
    <div className="premium-home">
      <section ref={heroRef} className="hotel-hero">
        <motion.div className="hotel-hero__media" style={{ y: heroY, scale: heroScale }}>
          <img src={heroImg} alt="Being Suites hotel" loading="eager" />
        </motion.div>
        <div className="hotel-hero__overlay" />
        <div className="hotel-hero__grain" />

        <motion.div className="hotel-hero__content" style={{ y: contentY, opacity: contentOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="eyebrow eyebrow--light"
          >
            Davao City · Philippines
          </motion.p>
          <div className="hero-title-wrap">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Welcome to
            </motion.h1>
          </div>
          <div className="hero-title-wrap">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="hero-title-accent"
            >
              Being Suites
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="hotel-hero__subtitle"
          >
            Cozy Suites &amp; Comfort in Davao City
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="hotel-hero__actions"
          >
            <Link to="/booking" className="luxury-button luxury-button--gold">
              <span>Book your stay</span><Calendar size={17} />
            </Link>
            <Link to="/room-rates" className="luxury-button luxury-button--glass">
              <span>Explore rooms</span><ArrowRight size={17} />
            </Link>
          </motion.div>
        </motion.div>

        <a className="hero-scroll" href="#welcome" aria-label="Scroll to discover">
          <span>Discover</span><ChevronDown size={16} />
        </a>
      </section>

      <section id="welcome" className="intro-section section-shell">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ staggerChildren: 0.12 }}
          className="intro-grid"
        >
          <motion.div variants={reveal} className="section-heading">
            <p className="eyebrow">A stay to remember</p>
            <h2>The quiet luxury<br />of feeling <em>at home.</em></h2>
          </motion.div>
          <motion.div variants={reveal} className="intro-copy">
            <p>Experience premium accommodations with world-class amenities, thoughtful service, and the warm spirit of Davao.</p>
            <Link to="/about" className="text-link">Discover our story <ArrowRight size={16} /></Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ staggerChildren: 0.1 }}
          className="feature-row"
        >
          {[
            { icon: Star, title: '3-Star Comfort', desc: 'Premium accommodations and modern amenities.' },
            { icon: Users, title: 'Expert Staff', desc: 'A dedicated team for a memorable stay.' },
            { icon: Calendar, title: 'Flexible Booking', desc: 'Simple reservations and flexible cancellation.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div variants={reveal} className="feature-item" key={title}>
              <span className="feature-item__icon"><Icon size={21} strokeWidth={1.5} /></span>
              <div><h3>{title}</h3><p>{desc}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="facilities-section">
        <div className="section-shell">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={reveal}
            transition={{ duration: 0.8 }}
            className="facilities-heading"
          >
            <div><p className="eyebrow eyebrow--light">Spaces to savour</p><h2>Hotel Facilities</h2></div>
            <p>From sunlit poolside afternoons to intimate gatherings, every space is designed to make the moment linger.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ staggerChildren: 0.12 }}
            className="facilities-grid"
          >
            {facilities.map((facility) => (
              <TiltCard key={facility.title} facility={facility} onOpen={() => setActiveFacility(facility)} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="day-tour-section section-shell">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="day-tour-card"
        >
          <div className="day-tour-card__visual">
            <img src={poolside1} alt="Being Suites poolside day tour" loading="lazy" />
          </div>
          <div className="day-tour-card__content">
            <p className="eyebrow">Slow afternoons by the pool</p>
            <h2>Day Tour</h2>
            <p className="day-tour-card__welcome">Mabuhay ug Madayaw!</p>
            <p>Hi, we have day tour package 450/per head (Adult/Kids) consumable with food. Good for 4 hours only.</p>
            <p>Free use of pool (250/food, 200/entrance fee)</p>
            <div className="day-tour-card__hours"><Clock3 size={18} /><span>Open daily from 10am–9pm</span></div>
          </div>
        </motion.div>
      </section>

      <section className="closing-cta">
        <div className="closing-cta__image"><img src={beerGarden1} alt="Evening at Being Suites" loading="lazy" /></div>
        <div className="closing-cta__overlay" />
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.9 }}
          className="closing-cta__content"
        >
          <p className="eyebrow eyebrow--light">Your Davao escape awaits</p>
          <h2>Ready to Experience<br />Cozy Suites?</h2>
          <p>Discover the perfect blend of comfort and elegance.</p>
          <Link to="/contact" className="luxury-button luxury-button--gold">Contact us now <ArrowRight size={17} /></Link>
        </motion.div>
      </section>

      <AnimatePresence>
        {activeFacility && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveFacility(null)}
            role="dialog" aria-modal="true" aria-label={activeFacility.title}
          >
            <button onClick={() => setActiveFacility(null)} aria-label="Close gallery"><X /></button>
            <motion.figure
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <img src={activeFacility.image} alt={activeFacility.title} />
              <figcaption><span>{activeFacility.meta}</span><h3>{activeFacility.title}</h3><p>{activeFacility.details}</p></figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
