import React from 'react';
import {
  CalendarCheck,
  Clock,
  Coffee,
  HelpCircle,
  Home,
  LockKeyhole,
  MessageCircle,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';
import SirvoyBookingEmbed from '../components/booking/SirvoyBookingEmbed';
import heroImage from '../assets/deluxe room-1.png';

export type RoomType = 'deluxe' | 'regular' | 'suite';

export interface BookingData {
  roomType: RoomType | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  guestInfo: {
    fullName: string;
    contactNumber: string;
    email: string;
  };
}

const benefits = [
  {
    icon: CalendarCheck,
    title: 'Direct booking',
    description: 'Reserve your room through the official Being Suites booking engine.',
  },
  {
    icon: Wifi,
    title: 'Real-time availability from Sirvoy',
    description: 'Room options and dates come directly from Sirvoy.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure reservation',
    description: 'Complete your booking using Sirvoy\'s secure reservation flow.',
  },
  {
    icon: MessageCircle,
    title: 'No need to message first',
    description: 'Check dates, choose a room, and confirm when you are ready.',
  },
];

const policies = [
  { icon: Clock, label: 'Check-in', value: '2:00 PM' },
  { icon: Clock, label: 'Check-out', value: '12:00 NN' },
  { icon: Coffee, label: 'Breakfast', value: 'Included for 2 guests' },
  { icon: PawPrint, label: 'Pets', value: 'Not allowed' },
  { icon: Home, label: 'Smoking', value: 'No smoking inside rooms' },
  { icon: Users, label: 'Extra person', value: 'Charges may apply' },
];

const Booking: React.FC = () => {
  return (
    <div className="premium-booking booking-page">
      <section className="booking-hero">
        <img src={heroImage} alt="" className="booking-hero__image" />
        <div className="booking-hero__overlay" />
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e8c98d]">
              <Sparkles size={16} />
              Direct reservations
            </p>
            <h1 className="mb-6 text-white">Book Your Stay at Being Suites</h1>
            <p className="max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              Check room availability and reserve directly through our official Sirvoy booking engine.
            </p>
          </div>
        </div>
      </section>

      <section id="booking-engine" className="booking-engine-section px-4 sm:px-6 lg:px-8" aria-labelledby="sirvoy-booking-heading">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#a1773e]">Official booking engine</p>
            <h2 id="sirvoy-booking-heading" className="mb-4 text-4xl">Check availability and book</h2>
            <p className="mx-auto max-w-2xl leading-8 text-[#626c68]">
              The form below is powered by Sirvoy. Availability and reservation details are managed in Sirvoy, not this website.
            </p>
          </div>

          <div className="booking-engine-card">
            <div className="booking-engine-card__header">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a1773e]">Being Suites</p>
                <h3 className="mt-2 text-2xl">Secure direct reservation</h3>
              </div>
              <span className="booking-engine-card__badge">
                <LockKeyhole size={16} />
                Sirvoy
              </span>
            </div>
            <SirvoyBookingEmbed />
          </div>

          <div className="booking-engine-card mt-6">
            <div className="booking-engine-card__header">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a1773e]">Guest portal</p>
                <h3 className="mt-2 text-2xl">Find your reservation</h3>
              </div>
              <span className="booking-engine-card__badge">
                <Search size={16} />
                Sirvoy
              </span>
            </div>
            <p className="mb-6 leading-8 text-[#626c68]">
              Already booked? Search your reservation details through the official Sirvoy guest portal.
            </p>
            <SirvoyBookingEmbed
              widget="review"
              loadingTitle="Loading guest portal..."
              fallbackText="If the guest portal does not appear, paste the latest Sirvoy review widget code inside"
              errorTitle="The guest portal could not load."
              errorText="Please refresh the page or contact Being Suites for reservation assistance."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="booking-card p-6">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#173c38] text-[#e8c98d]">
                    <Icon size={21} />
                  </span>
                  <h2 className="mb-3 text-xl font-semibold">{benefit.title}</h2>
                  <p className="text-sm leading-7 text-[#626c68]">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee4] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#a1773e]">Hotel policies</p>
            <h2 className="mb-5 text-4xl">Good to know before you arrive</h2>
            <p className="max-w-2xl leading-8 text-[#626c68]">
              Review the basics before confirming your stay. Final reservation details and any applicable charges will be shown in Sirvoy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {policies.map((policy) => {
              const Icon = policy.icon;
              return (
                <div key={`${policy.label}-${policy.value}`} className="booking-policy">
                  <Icon size={19} />
                  <div>
                    <p className="booking-policy__label">{policy.label}</p>
                    <p className="booking-policy__value">{policy.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="booking-help mx-auto max-w-5xl">
          <span className="booking-help__icon">
            <HelpCircle size={24} />
          </span>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a1773e]">Need assistance?</p>
            <h2 className="mb-3 text-3xl">We can help with your reservation</h2>
            <p className="leading-8 text-[#626c68]">
              If the booking engine does not answer your question, contact Being Suites for help with room details, special requests, or check-in concerns.
            </p>
          </div>
          <div className="booking-help__contacts">
            <a href="tel:+63823082595">Call (082) 308-2595</a>
            <a href="tel:+639338584013">Call 0933-858-4013</a>
            <a href="mailto:chbeing@gmail.com">Email chbeing@gmail.com</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
