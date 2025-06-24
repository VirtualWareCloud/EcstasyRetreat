import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Share2, Calendar, MapPin, User, Phone, Mail, 
  Star, ChevronRight, Heart, Camera, Send, Instagram, 
  Facebook, Twitter, WhatsApp, Clock, DollarSign, Award
} from 'lucide-react';

// Hero Slideshow Component
export const HeroSlideshow = () => {
  const slides = [
    {
      image: "https://images.pexels.com/photos/18251594/pexels-photo-18251594.jpeg",
      title: "Luxury Mobile Massage",
      subtitle: "Experience ultimate relaxation in your own space"
    },
    {
      image: "https://images.unsplash.com/photo-1635257153190-6313ae8a9fdc",
      title: "Premium Spa Experience",
      subtitle: "Professional therapists at your doorstep"
    },
    {
      image: "https://images.pexels.com/photos/6075005/pexels-photo-6075005.jpeg",
      title: "Therapeutic Wellness",
      subtitle: "Rejuvenate your mind, body and soul"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div 
            className="h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#d4af37]">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-[#fff3a8]">
                  {slides[currentSlide].subtitle}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#d4af37] text-[#18243D] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#fff3a8] transition-all duration-300 shadow-xl"
                >
                  Book Now
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-[#d4af37]' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Header Component
export const Header = ({ isMenuOpen, setIsMenuOpen, currentPage }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#18243D]/95 backdrop-blur-sm border-b border-[#d4af37]/20">
      <div className="flex items-center justify-between px-4 py-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2 text-[#d4af37] hover:text-[#fff3a8] transition-colors"
        >
          <Share2 size={24} />
        </motion.button>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <h1 className="text-[#d4af37] text-xl font-bold">Ecstasy Retreat</h1>
          <p className="text-[#fff3a8] text-xs">Mobile Massage Therapists</p>
        </motion.div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-[#d4af37] hover:text-[#fff3a8] transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>
    </header>
  );
};

// Navigation Menu Component
export const NavigationMenu = ({ isMenuOpen, setIsMenuOpen, setCurrentPage }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <User size={20} /> },
    { id: 'booking', label: 'Book Appointment', icon: <Calendar size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <Camera size={20} /> },
    { id: 'therapists', label: 'Our Therapists', icon: <Heart size={20} /> },
    { id: 'join', label: 'Join as Therapist', icon: <Award size={20} /> }
  ];

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed top-0 right-0 bottom-0 w-80 bg-[#18243D] z-40 shadow-2xl"
        >
          <div className="pt-20 px-6">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 text-left text-[#d4af37] hover:text-[#fff3a8] hover:bg-[#d4af37]/10 rounded-lg transition-all duration-300"
                >
                  {item.icon}
                  <span className="text-lg">{item.label}</span>
                  <ChevronRight size={16} className="ml-auto" />
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Therapist Card Component
export const TherapistCard = ({ therapist, onViewProfile }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#d4af37]/20"
    >
      <div className="relative h-48">
        <img 
          src={therapist.image} 
          alt={therapist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{therapist.name}</h3>
          <p className="text-[#fff3a8]">{therapist.area}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={`${i < therapist.rating ? 'text-[#d4af37] fill-current' : 'text-gray-300'}`} 
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({therapist.reviews} reviews)</span>
        </div>
        <p className="text-gray-700 text-sm mb-4">{therapist.specialties.slice(0, 2).join(', ')}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewProfile(therapist)}
          className="w-full bg-[#18243D] text-[#d4af37] py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#18243D] transition-all duration-300"
        >
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
};

// Booking Form Component
export const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    service: '',
    preferences: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappMessage = `Hello! I'd like to book a massage appointment:
Name: ${formData.name}
Date: ${formData.date}
Time: ${formData.time}
Location: ${formData.location}
Service: ${formData.service}
Special Preferences: ${formData.preferences}`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/1234567890?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 border border-[#d4af37]/20"
    >
      <h2 className="text-2xl font-bold text-[#18243D] mb-6 text-center">Book Your Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#18243D] font-semibold mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#18243D] font-semibold mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[#18243D] font-semibold mb-2">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-[#18243D] font-semibold mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Your address or preferred location"
            className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
            required
          />
        </div>
        
        <div>
          <label className="block text-[#18243D] font-semibold mb-2">Service</label>
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
            required
          >
            <option value="">Select a service</option>
            <option value="Swedish Massage">Swedish Massage - $120/hr</option>
            <option value="Deep Tissue">Deep Tissue Massage - $150/hr</option>
            <option value="Hot Stone">Hot Stone Massage - $180/hr</option>
            <option value="Aromatherapy">Aromatherapy Massage - $160/hr</option>
            <option value="Couples">Couples Massage - $300/hr</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[#18243D] font-semibold mb-2">Special Preferences</label>
          <textarea
            value={formData.preferences}
            onChange={(e) => setFormData({...formData, preferences: e.target.value})}
            placeholder="Any special requests or health considerations..."
            rows={3}
            className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-[#18243D] text-[#d4af37] py-4 rounded-lg font-bold text-lg hover:bg-[#d4af37] hover:text-[#18243D] transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <WhatsApp size={20} />
          <span>Book via WhatsApp</span>
        </motion.button>
      </form>
    </motion.div>
  );
};

// Gallery Component
export const Gallery = () => {
  const categories = ['All', 'Massage Therapy', 'Spa Environment', 'Relaxation'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    {
      id: 1,
      url: "https://images.pexels.com/photos/360209/pexels-photo-360209.jpeg",
      category: "Spa Environment",
      title: "Aromatherapy Ambiance"
    },
    {
      id: 2,
      url: "https://images.pexels.com/photos/7544430/pexels-photo-7544430.jpeg",
      category: "Massage Therapy",
      title: "Professional Massage Tools"
    },
    {
      id: 3,
      url: "https://images.pexels.com/photos/139396/lavender-flowers-blue-flowers-purple-139396.jpeg",
      category: "Relaxation",
      title: "Lavender Relaxation"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1703980467952-760bcd0e464a",
      category: "Spa Environment",
      title: "Luxury Spa Setting"
    }
  ];

  const filteredImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === category
                ? 'bg-[#d4af37] text-[#18243D]'
                : 'bg-[#18243D]/10 text-[#18243D] hover:bg-[#18243D]/20'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square cursor-pointer rounded-xl overflow-hidden shadow-lg"
          >
            <img 
              src={image.url} 
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold">{image.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              layoutId={`image-${selectedImage.id}`}
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-[#d4af37] transition-colors"
            >
              <X size={32} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Join as Therapist Form
export const JoinTherapistForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    experience: '',
    certifications: '',
    specialties: '',
    availability: '',
    transportation: '',
    emergencyContact: '',
    emergencyPhone: '',
    references: '',
    portfolio: '',
    languages: '',
    equipment: '',
    insurance: '',
    background: '',
    motivation: '',
    expectations: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailSubject = "New Therapist Application - Ecstasy Retreat";
    const emailBody = Object.entries(formData)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
      .join('\n');
    
    window.location.href = `mailto:therapists@ecstasyretreat.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18243D] via-purple-900 to-[#18243D] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37] rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random()
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, Math.random(), 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-[#18243D] mb-6 text-center">Join Our Elite Team</h2>
          <p className="text-center text-gray-600 mb-8">Become a luxury mobile massage therapist</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                className="p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
            </div>

            <select
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors"
              required
            >
              <option value="">Years of Experience</option>
              <option value="0-1">0-1 years</option>
              <option value="2-5">2-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>

            <textarea
              placeholder="Certifications & Licenses"
              value={formData.certifications}
              onChange={(e) => setFormData({...formData, certifications: e.target.value})}
              rows={3}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
              required
            />

            <textarea
              placeholder="Specialties & Techniques"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              rows={3}
              className="w-full p-3 border border-[#d4af37]/30 rounded-lg focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
              required
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#18243D] text-[#d4af37] py-4 rounded-lg font-bold text-lg hover:bg-[#d4af37] hover:text-[#18243D] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Submit Application</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// Individual Therapist Profile
export const TherapistProfile = ({ therapist, onBack }) => {
  const handleBooking = () => {
    const whatsappMessage = `Hello! I'd like to book a session with ${therapist.name}. Please provide available times.`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/1234567890?text=${encodedMessage}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="relative h-80">
        <img 
          src={therapist.image} 
          alt={therapist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight size={24} className="rotate-180" />
        </motion.button>
        <div className="absolute bottom-6 left-6 text-white">
          <h2 className="text-3xl font-bold mb-2">{therapist.name}</h2>
          <p className="text-[#fff3a8] text-lg flex items-center">
            <MapPin size={16} className="mr-2" />
            {therapist.area}
          </p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={18} 
                className={`${i < therapist.rating ? 'text-[#d4af37] fill-current' : 'text-white/50'}`} 
              />
            ))}
            <span className="ml-2 text-sm">({therapist.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#18243D] mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {therapist.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-[#d4af37]/20 text-[#18243D] rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBooking}
            className="flex items-center justify-center space-x-2 bg-[#18243D] text-[#d4af37] py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#18243D] transition-all duration-300"
          >
            <Calendar size={18} />
            <span>Book Session</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 border-2 border-[#18243D] text-[#18243D] py-3 rounded-lg font-semibold hover:bg-[#18243D] hover:text-[#d4af37] transition-all duration-300"
          >
            <Camera size={18} />
            <span>View Gallery</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 bg-[#d4af37]/20 text-[#18243D] py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-white transition-all duration-300"
          >
            <DollarSign size={18} />
            <span>Prices</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2 bg-purple-100 text-purple-700 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-all duration-300"
          >
            <Instagram size={18} />
            <span>Social</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};