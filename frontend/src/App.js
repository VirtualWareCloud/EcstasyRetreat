import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import {
  HeroSlideshow,
  Header,
  NavigationMenu,
  TherapistCard,
  BookingForm,
  Gallery,
  JoinTherapistForm,
  TherapistProfile
} from './Components';

// Mock data for therapists
const mockTherapists = [
  {
    id: 1,
    name: "Amara Williams",
    area: "Downtown & Midtown",
    image: "https://images.unsplash.com/photo-1611169035510-f9af52e6dbe2",
    rating: 5,
    reviews: 124,
    specialties: ["Swedish Massage", "Deep Tissue", "Hot Stone", "Aromatherapy"],
    experience: "8 years",
    price: "$120-180/hr"
  },
  {
    id: 2,
    name: "Zara Chen",
    area: "Uptown & North Side",
    image: "https://images.pexels.com/photos/6075005/pexels-photo-6075005.jpeg",
    rating: 5,
    reviews: 98,
    specialties: ["Thai Massage", "Reflexology", "Prenatal Massage", "Sports Massage"],
    experience: "6 years", 
    price: "$140-200/hr"
  },
  {
    id: 3,
    name: "Luna Rodriguez",
    area: "West Side & Beach Area",
    image: "https://images.pexels.com/photos/360209/pexels-photo-360209.jpeg",
    rating: 4,
    reviews: 156,
    specialties: ["Couples Massage", "Lymphatic Drainage", "Craniosacral", "Energy Healing"],
    experience: "10 years",
    price: "$160-220/hr"
  },
  {
    id: 4,
    name: "Maya Patel",
    area: "East Side & Suburbs",
    image: "https://images.pexels.com/photos/7544430/pexels-photo-7544430.jpeg",
    rating: 5,
    reviews: 203,
    specialties: ["Ayurvedic Massage", "Shiatsu", "Trigger Point", "Myofascial Release"],
    experience: "12 years",
    price: "$150-210/hr"
  }
];

// Services data
const services = [
  {
    name: "Swedish Massage",
    price: "$120/hr",
    duration: "60-90 min",
    description: "Classic relaxation massage with gentle, flowing strokes"
  },
  {
    name: "Deep Tissue Massage",
    price: "$150/hr", 
    duration: "60-90 min",
    description: "Therapeutic massage targeting deep muscle layers"
  },
  {
    name: "Hot Stone Massage",
    price: "$180/hr",
    duration: "90 min",
    description: "Heated stones combined with massage for ultimate relaxation"
  },
  {
    name: "Aromatherapy Massage",
    price: "$160/hr",
    duration: "60-90 min", 
    description: "Essential oils enhance your massage experience"
  },
  {
    name: "Couples Massage",
    price: "$300/hr",
    duration: "60-90 min",
    description: "Side-by-side massage experience for two"
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-[#18243D]">
      <HeroSlideshow />
      
      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#18243D] to-purple-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#d4af37] mb-4">Our Premium Services</h2>
            <p className="text-[#fff3a8] text-lg max-w-2xl mx-auto">
              Indulge in our luxury mobile massage services, delivered by certified professionals to your preferred location
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-[#d4af37] mb-2">{service.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#fff3a8] font-semibold">{service.price}</span>
                  <span className="text-[#fff3a8] text-sm">{service.duration}</span>
                </div>
                <p className="text-white/80 mb-6">{service.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('booking')}
                  className="w-full bg-[#d4af37] text-[#18243D] py-3 rounded-lg font-semibold hover:bg-[#fff3a8] transition-all duration-300"
                >
                  Book Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-900 to-[#18243D]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#d4af37] mb-4">Meet Our Elite Therapists</h2>
            <p className="text-[#fff3a8] text-lg max-w-2xl mx-auto">
              Our certified professionals bring years of expertise and luxury service directly to you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mockTherapists.slice(0, 4).map((therapist, index) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TherapistCard 
                  therapist={therapist} 
                  onViewProfile={() => {
                    setSelectedTherapist(therapist);
                    setCurrentPage('therapist-profile');
                  }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('therapists')}
              className="bg-[#d4af37] text-[#18243D] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#fff3a8] transition-all duration-300"
            >
              View All Therapists
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-[#18243D]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#d4af37] mb-6">Ready to Experience Luxury?</h2>
            <p className="text-[#fff3a8] text-xl mb-8 max-w-2xl mx-auto">
              Book your premium mobile massage experience today and discover the ultimate in relaxation and wellness
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('booking')}
                className="bg-[#d4af37] text-[#18243D] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#fff3a8] transition-all duration-300"
              >
                Book Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('gallery')}
                className="border-2 border-[#d4af37] text-[#d4af37] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#d4af37] hover:text-[#18243D] transition-all duration-300"
              >
                View Gallery
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );

  // Booking Page Component
  const BookingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#18243D] via-purple-900 to-[#18243D] pt-20 px-4">
      <div className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#d4af37] mb-4">Book Your Luxury Experience</h1>
          <p className="text-[#fff3a8] text-lg max-w-2xl mx-auto">
            Schedule your premium mobile massage service at your preferred location and time
          </p>
        </motion.div>
        <BookingForm />
      </div>
    </div>
  );

  // Gallery Page Component
  const GalleryPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#18243D] via-purple-900 to-[#18243D] pt-20 px-4">
      <div className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#d4af37] mb-4">Our Gallery</h1>
          <p className="text-[#fff3a8] text-lg max-w-2xl mx-auto">
            Explore our luxurious spa environments and professional massage services
          </p>
        </motion.div>
        <Gallery />
      </div>
    </div>
  );

  // Therapists Page Component
  const TherapistsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#18243D] via-purple-900 to-[#18243D] pt-20 px-4">
      <div className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#d4af37] mb-4">Our Elite Therapists</h1>
          <p className="text-[#fff3a8] text-lg max-w-2xl mx-auto">
            Meet our certified professionals who bring luxury wellness services directly to you
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTherapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TherapistCard 
                therapist={therapist} 
                onViewProfile={() => {
                  setSelectedTherapist(therapist);
                  setCurrentPage('therapist-profile');
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // Join as Therapist Page Component
  const JoinPage = () => <JoinTherapistForm />;

  // Therapist Profile Page Component
  const TherapistProfilePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#18243D] via-purple-900 to-[#18243D] pt-20 px-4">
      <div className="container mx-auto py-12">
        {selectedTherapist && (
          <TherapistProfile 
            therapist={selectedTherapist}
            onBack={() => {
              setCurrentPage('therapists');
              setSelectedTherapist(null);
            }}
          />
        )}
      </div>
    </div>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'booking':
        return <BookingPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'therapists':
        return <TherapistsPage />;
      case 'join':
        return <JoinPage />;
      case 'therapist-profile':
        return <TherapistProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App relative">
      {/* Header */}
      <Header 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen}
        currentPage={currentPage}
      />

      {/* Navigation Menu */}
      <div className="menu-container">
        <NavigationMenu 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;