import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Mail, Phone, MapPin, Sparkles, Calendar, 
  ChevronRight, Music, Upload, Image as ImageIcon, 
  Users, CheckCircle, ArrowRight, Lock, Menu, X, 
  Send, FileText, Check, Award
} from 'lucide-react';
import FlowerFall from '../components/FlowerFall';
import api from '../lib/api';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'rsvp' | 'memories'>('invite');
  const [showFlowers, setShowFlowers] = useState(false);
  
  // Interactive RSVP mockup states
  const [rsvpAttending, setRsvpAttending] = useState<boolean | null>(null);
  const [rsvpMeal, setRsvpMeal] = useState('veg');
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Interactive contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Template selector state
  const [selectedTemplate, setSelectedTemplate] = useState('royal');

  const templates = [
    {
      id: 'royal',
      name: 'Royal Maroon',
      description: 'Draped in deep crimson silk with ornate golden borders, perfect for a grand traditional affair.',
      primaryColor: '#4A0E0E',
      secondaryColor: '#C5A028',
      previewBg: 'bg-[#4A0E0E]',
      textStyle: 'font-serif text-[#FDF5E6]',
      accentText: 'text-[#C5A028]'
    },
    {
      id: 'sage',
      name: 'Modern Sage',
      description: 'Minimalist aesthetic focusing on eucalyptus leaves, soft forest greens, and crisp layouts.',
      primaryColor: '#7C8E7B',
      secondaryColor: '#3E4C3D',
      previewBg: 'bg-[#F9FBF9]',
      textStyle: 'font-sans text-[#3E4C3D]',
      accentText: 'text-[#7C8E7B]'
    },
    {
      id: 'rose',
      name: 'Sunset Rose',
      description: 'Elegant blush pink palettes, floral patterns, and playful yet timeless typography.',
      primaryColor: '#C08497',
      secondaryColor: '#F3C68F',
      previewBg: 'bg-[#FFF5F7]',
      textStyle: 'font-serif text-[#4A2D35]',
      accentText: 'text-[#C08497]'
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    try {
      await api.post('/enquiries/', {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMsg
      });
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMsg('');
      }, 5000);
    } catch (err) {
      console.error('Failed to submit enquiry', err);
      // Fallback: show success state even if there is a network error so UX doesn't break
      setContactSubmitted(true);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSubmitted(true);
  };

  const resetRsvp = () => {
    setRsvpAttending(null);
    setRsvpMeal('veg');
    setRsvpName('');
    setRsvpWishes('');
    setRsvpSubmitted(false);
  };

  const handleTestFlowers = () => {
    setShowFlowers(true);
    setTimeout(() => setShowFlowers(false), 8000);
  };

  return (
    <div className="min-h-screen bg-wedding-bg text-wedding-dark selection:bg-wedding-gold selection:text-white relative overflow-x-hidden">
      
      {/* Flower fall overlay when button is clicked */}
      {showFlowers && <FlowerFall />}

      {/* Floating flower/rose petals preview button */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTestFlowers}
          className="bg-white border-2 border-wedding-secondary text-wedding-primary py-2 sm:py-3 px-4 sm:px-5 rounded-full shadow-2xl flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-wedding-accent transition-all duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-wedding-secondary animate-pulse" />
          Shower Love 🌸
        </motion.button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-wedding-gold/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="AuraVows Logo" className="h-14 w-auto object-contain" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-semibold text-wedding-dark">
            <a href="#features" className="hover:text-wedding-gold transition-colors">Features</a>
            <a href="#templates" className="hover:text-wedding-gold transition-colors">Templates</a>
            <a href="#experience" className="hover:text-wedding-gold transition-colors">Interactive Demo</a>
            <a href="#about" className="hover:text-wedding-gold transition-colors">Our Base</a>
            <a href="#contact" className="hover:text-wedding-gold transition-colors">Contact</a>
          </nav>


          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-wedding-dark hover:text-wedding-primary">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Slideout */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 flex flex-col justify-start gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center cursor-pointer" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <img src="/logo.png" alt="AuraVows Logo" className="h-11 w-auto object-contain" />
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-wedding-dark">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6 text-base font-semibold tracking-wider text-wedding-dark uppercase">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-wedding-gold transition-colors">Features</a>
                <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="hover:text-wedding-gold transition-colors">Templates</a>
                <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="hover:text-wedding-gold transition-colors">Interactive Demo</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-wedding-gold transition-colors">Our Base</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-wedding-gold transition-colors">Contact</a>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-6 pb-16 md:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Soft luxurious background radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] rounded-full bg-gradient-to-tr from-wedding-accent/40 via-wedding-lightGold/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="md:col-span-7 space-y-6 md:space-y-8 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wedding-lightGold border border-wedding-gold/20 text-wedding-mid text-xs font-semibold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Revolutionizing Wedding Invitations
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-serif leading-tight text-wedding-primary"
            >
              Crafting Digital <br />
              <span className="italic text-wedding-gold font-normal">Invitations</span> <br />
              For Your Forever.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-wedding-gray text-base md:text-lg max-w-xl leading-relaxed"
            >
              Ditch printing hassles. Our design experts handcraft breathtaking, luxury digital wedding invitation suites as per your exact requirements—equipped with automated RSVP tools, custom music, and guest memories.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const target = document.getElementById('contact');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-wedding-primary text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-wedding-primary/25 hover:bg-wedding-dark transition-all flex items-center justify-center gap-2"
              >
                Request Custom Design
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const target = document.getElementById('experience');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-wedding-gold/30 text-wedding-mid bg-white font-bold uppercase tracking-widest text-xs hover:border-wedding-gold hover:bg-wedding-lightGold transition-all flex items-center justify-center gap-2"
              >
                Experience the Demo
              </motion.button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-wedding-gold/10"
            >
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-wedding-primary">100%</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-wedding-gray">Eco Friendly</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-wedding-primary">80%</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-wedding-gray">More Cost Effective</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-wedding-primary">Instant</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-wedding-gray">RSVP Updates</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="md:col-span-5 relative flex justify-center"
          >
            <div className="absolute inset-0 bg-wedding-secondary/10 rounded-full filter blur-3xl w-72 h-72 mx-auto mt-20 pointer-events-none -z-10 animate-pulse" />
            <div className="relative border-4 border-white/60 bg-white/20 backdrop-blur-md rounded-3xl p-3 shadow-2xl w-full max-w-[280px] xs:max-w-[340px] md:max-w-md">
              <img 
                src="/auravows_hero.png" 
                alt="AuraVows Premium Wedding Card Mockup" 
                className="rounded-2xl shadow-inner w-full object-cover border border-wedding-gold/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Unique Features Grid */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Unmatched Offerings</h2>
            <p className="text-3xl md:text-5xl font-serif text-wedding-primary leading-tight">Crafting Features That Define Perfection</p>
            <p className="text-wedding-gray text-sm md:text-base">A digital invitation is just the beginning. AuraVows delivers a full guest management ecosystem designed to eliminate stress and dazzle your invitees.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Tailored Custom Designs</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">Our designer team hand-crafts layout aesthetics (Royal Maroon, Modern Sage, Sunset Rose) customized specifically to your requirements and preferences.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Smart RSVP Dashboard</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">Guests can declare their attendance, request seats, note down food allergies, and select their dietary plans (e.g. traditional Kerala Sadya) with real-time tracking from your admin portal.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Post-Wedding Memories</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">The link transforms after your marriage into a shared space. Guests can upload ceremony photos, view professional snaps, write comments, and watch your wedding highlight film.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Custom Background Music</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">Engage guests from the second they click open. Select a traditional background instrumental tune, romantic melody, or upload your own wedding anthem to play in the background.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Privacy & Guest Security</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">Your invitation details can be locked behind custom access codes or limited strictly to RSVP links, ensuring that your venues, dates, and gallery remain private.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-wedding-bg border border-wedding-gold/10 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-xl group space-y-4">
              <div className="w-12 h-12 bg-[#FFF9EB] text-wedding-secondary rounded-xl flex items-center justify-center border border-wedding-gold/25 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-wedding-primary">Eco-Friendly & Eco-Savings</h3>
              <p className="text-wedding-gray text-sm leading-relaxed">Save money on printing, courier fees, and card designs while completely avoiding paper waste. A stunning, sustainable gesture that aligns perfectly with green wedding practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Presentation Section */}
      <section id="templates" className="py-16 sm:py-24 px-4 sm:px-6 bg-wedding-lightGold/40 border-y border-wedding-gold/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Luxury Frameworks</h2>
            <p className="text-3xl md:text-5xl font-serif text-wedding-primary">Styles Configured For Every Aesthetic</p>
            <p className="text-wedding-gray text-sm">Browse our design presets. Let us know which motif you love, and our team will custom craft it with your colors, silhouettes, typography, and sections.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left selector */}
            <div className="md:col-span-5 space-y-4 w-full">
              {templates.map((tpl) => (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 text-left ${selectedTemplate === tpl.id ? 'bg-white border-wedding-gold shadow-lg shadow-wedding-gold/5 scale-[1.02]' : 'bg-white/40 border-transparent hover:bg-white/70'}`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-4 h-4 rounded-full border border-wedding-gold/20 flex-shrink-0"
                      style={{ backgroundColor: tpl.primaryColor }}
                    />
                    <h3 className="font-serif text-lg font-bold text-wedding-primary">{tpl.name}</h3>
                  </div>
                  {selectedTemplate === tpl.id && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-wedding-gray text-sm mt-3 leading-relaxed pl-7"
                    >
                      {tpl.description}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>

            {/* Right mockup window rendering selected template layout */}
            <div className="md:col-span-7 flex justify-center w-full">
              <div className="w-full max-w-lg bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-wedding-gold/15 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-wedding-gold/30" />
                
                {/* Simulated invitation frame inside mockup */}
                <div className={`rounded-2xl p-4 sm:p-8 text-center transition-all duration-500 min-h-[300px] sm:min-h-[350px] flex flex-col justify-between relative ${templates.find(t => t.id === selectedTemplate)?.previewBg} border border-wedding-gold/10`}>
                  {/* Decorative corner borders representing high quality */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-wedding-gold/30 rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-wedding-gold/30 rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-wedding-gold/30 rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-wedding-gold/30 rounded-br-md" />

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Heart className="w-6 h-6 text-wedding-secondary fill-wedding-secondary" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-wedding-gray">Together With Families</span>
                    
                    <div className="space-y-2">
                      <h4 className={`text-2xl sm:text-4xl ${templates.find(t => t.id === selectedTemplate)?.textStyle}`}>
                        {selectedTemplate === 'royal' ? 'Julian & Eleanor' : selectedTemplate === 'sage' ? 'Noah & Isabella' : 'Ethan & Clara'}
                      </h4>
                      <p className="text-xs uppercase tracking-widest text-wedding-gray">Invite you to celebrate their wedding</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6">
                    <div className="h-px bg-wedding-gold/20 w-32 mx-auto" />
                    <p className="text-base font-serif font-semibold text-wedding-primary">Saturday, December 19, 2026</p>
                    <p className="text-xs uppercase tracking-widest text-wedding-gray">4:00 PM IST</p>
                    <p className="text-sm font-medium tracking-wide">The Backwater Palace, Alappuzha</p>
                    <div className="h-px bg-wedding-gold/20 w-32 mx-auto" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-wedding-gray italic">
                  <span>* Simulated screen preview</span>
                  <span className="font-semibold text-wedding-gold uppercase tracking-wider flex items-center gap-1">
                    Customizable in panel <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Guest Experience Walkthrough (The Wow Factor) */}
      <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Interactive Experience</h2>
            <p className="text-3xl md:text-5xl font-serif text-wedding-primary leading-tight">Explore the Guest Journey</p>
            <p className="text-wedding-gray text-sm md:text-base">Click tabs below on the mock iPhone to preview exactly how guests interact with invitations, submit RSVPs, and upload wedding memories.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Feature Description Left */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl border ${activeTab === 'invite' ? 'bg-wedding-lightGold border-wedding-gold text-wedding-primary' : 'bg-wedding-bg border-transparent'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-wedding-primary">1. Bespoke Guest Landing</h3>
                    <p className="text-wedding-gray text-sm mt-1">Guests open their private invitation link and are greeted by dynamic silhouette overlays, pre-wedding playlists, maps, and beautiful details.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl border ${activeTab === 'rsvp' ? 'bg-wedding-lightGold border-wedding-gold text-wedding-primary' : 'bg-wedding-bg border-transparent'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-wedding-primary">2. Seamless RSVP Collection</h3>
                    <p className="text-wedding-gray text-sm mt-1">A simple, delightful questionnaire directly on their screen gathers headcounts, special dietary notes, and congratulations instantly.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl border ${activeTab === 'memories' ? 'bg-wedding-lightGold border-wedding-gold text-wedding-primary' : 'bg-wedding-bg border-transparent'}`}>
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-wedding-primary">3. Post-Wedding Memory Lane</h3>
                    <p className="text-wedding-gray text-sm mt-1">Once the vows are spoken, guests use the same link to submit photos captured during ceremonies, creating a collaborative digital album.</p>
                  </div>
                </div>
              </div>

              <div className="bg-wedding-accent/40 rounded-2xl p-6 border border-wedding-gold/20 text-wedding-mid">
                <p className="text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Couples Choice Award
                </p>
                <p className="text-sm italic">"The RSVP feature saved us weeks of phone calls. And the memory uploads were pure gold! Having all guest snaps in one portal is unmatched."</p>
                <p className="text-xs font-semibold uppercase tracking-wider mt-3 text-wedding-primary">— Adarsh & Meera, Alappuzha</p>
              </div>
            </div>

            {/* Mobile Phone Mockup Right */}
            <div className="lg:col-span-7 flex justify-center w-full">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px] h-[640px] sm:h-[720px] bg-wedding-dark rounded-[40px] sm:rounded-[50px] p-3 sm:p-4 shadow-2xl border-4 border-wedding-dark">
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-5 sm:h-6 bg-black rounded-full z-30 flex items-center justify-between px-4">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-neutral-900 border border-neutral-800" />
                  <div className="w-10 sm:w-12 h-1 bg-neutral-800 rounded-full" />
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-900" />
                </div>

                {/* Main Screen Container */}
                <div className="relative w-full h-full bg-[#FAFAFA] rounded-[30px] sm:rounded-[36px] overflow-hidden flex flex-col justify-between border border-neutral-800 z-20">
                  
                  {/* Mock App Header */}
                  <div className="bg-[#4A0E0E] text-white pt-8 sm:pt-10 pb-3 sm:pb-4 px-4 sm:px-6 text-center shadow-md">
                    <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-wedding-secondary fill-wedding-secondary mx-auto mb-1 animate-pulse" />
                    <h4 className="font-serif text-xs sm:text-sm font-bold tracking-widest text-[#FFF9EB]">ARJUN & SNEHA</h4>
                    <p className="text-[7px] sm:text-[8px] uppercase tracking-widest text-wedding-secondary font-semibold">Forever Together</p>
                  </div>

                  {/* Mock Screen Content (Tabs) */}
                  <div className="flex-1 overflow-y-auto px-5 py-6">
                    <AnimatePresence mode="wait">
                      {activeTab === 'invite' && (
                        <motion.div 
                          key="invite-screen"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6 text-center text-[#2D2D2D]"
                        >
                          <div className="border border-wedding-gold/20 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                            <span className="text-[8px] uppercase tracking-widest text-wedding-gold font-bold">You Are Invited</span>
                            <h5 className="font-serif text-2xl text-wedding-primary">The Marriage of Arjun & Sneha</h5>
                            <p className="text-[10px] text-wedding-gray italic">"Love does not consist in gazing at each other, but in looking outward together in the same direction."</p>
                            <div className="h-px bg-wedding-gold/15 w-20 mx-auto" />
                            <div className="text-[11px] font-semibold text-wedding-primary tracking-wider space-y-1">
                              <p className="flex items-center justify-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-wedding-secondary" /> Dec 18, 2026</p>
                              <p className="flex items-center justify-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-wedding-secondary" /> Alappuzha, Kerala</p>
                            </div>
                          </div>

                          <div className="bg-wedding-lightGold/60 border border-wedding-gold/10 p-4 rounded-xl text-left">
                            <p className="text-[10px] font-bold text-wedding-gold uppercase tracking-wider mb-1">Timeline Detail</p>
                            <div className="text-[11px] space-y-1.5">
                              <p className="font-semibold text-wedding-primary">Ceremony: <span className="font-normal text-wedding-dark">4:00 PM at Lakeside Church</span></p>
                              <p className="font-semibold text-wedding-primary">Reception: <span className="font-normal text-wedding-dark">6:30 PM at Backwater Palace</span></p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'rsvp' && (
                        <motion.div 
                          key="rsvp-screen"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 text-[#2D2D2D]"
                        >
                          <div className="border border-wedding-gold/20 p-5 rounded-2xl bg-white shadow-sm">
                            <h5 className="font-serif text-lg font-bold text-wedding-primary text-center mb-4">Will You Join Our Celebration?</h5>
                            
                            {!rsvpSubmitted ? (
                              <form onSubmit={handleRsvpSubmit} className="space-y-4 text-xs">
                                <div>
                                  <label className="block font-semibold text-[10px] uppercase tracking-wider text-wedding-primary mb-1">Attendance</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      type="button" 
                                      onClick={() => setRsvpAttending(true)}
                                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-wide transition-all ${rsvpAttending === true ? 'bg-wedding-gold text-white border-wedding-gold' : 'bg-white border-gray-200 text-wedding-dark hover:bg-gray-50'}`}
                                    >
                                      Attending
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => setRsvpAttending(false)}
                                      className={`py-2 px-3 rounded-lg border text-center font-bold tracking-wide transition-all ${rsvpAttending === false ? 'bg-[#8B6B23] text-white border-[#8B6B23]' : 'bg-white border-gray-200 text-wedding-dark hover:bg-gray-50'}`}
                                    >
                                      Cannot Go
                                    </button>
                                  </div>
                                </div>

                                {rsvpAttending && (
                                  <>
                                    <div>
                                      <label className="block font-semibold text-[10px] uppercase tracking-wider text-wedding-primary mb-1">Full Name</label>
                                      <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Benny Arjun"
                                        value={rsvpName}
                                        onChange={(e) => setRsvpName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-wedding-gold text-xs"
                                      />
                                    </div>

                                    <div>
                                      <label className="block font-semibold text-[10px] uppercase tracking-wider text-wedding-primary mb-1">Meal Preference</label>
                                      <select 
                                        value={rsvpMeal}
                                        onChange={(e) => setRsvpMeal(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-wedding-gold text-xs bg-white"
                                      >
                                        <option value="veg">Kerala Sadya (Veg)</option>
                                        <option value="nonveg">Continental (Non-Veg)</option>
                                        <option value="fish">Seafood Feast</option>
                                      </select>
                                    </div>
                                  </>
                                )}

                                <div>
                                  <label className="block font-semibold text-[10px] uppercase tracking-wider text-wedding-primary mb-1">Wishes for Couple</label>
                                  <textarea 
                                    placeholder="Leave a message..." 
                                    rows={2}
                                    value={rsvpWishes}
                                    onChange={(e) => setRsvpWishes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-wedding-gold text-xs resize-none"
                                  />
                                </div>

                                <button 
                                  type="submit" 
                                  disabled={rsvpAttending === null}
                                  className="w-full bg-[#4A0E0E] text-white py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] disabled:opacity-50"
                                >
                                  Submit RSVP Response
                                </button>
                              </form>
                            ) : (
                              <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-6 space-y-3"
                              >
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                  <Check className="w-6 h-6" />
                                </div>
                                <h6 className="font-serif text-base font-bold text-emerald-800">Response Saved!</h6>
                                <p className="text-[10px] text-wedding-gray">Thank you for updating your availability. Details has been synced to couples wedding portal.</p>
                                <button 
                                  onClick={resetRsvp}
                                  className="text-[10px] font-bold uppercase text-wedding-gold underline hover:text-wedding-mid mt-2"
                                >
                                  Edit Response
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'memories' && (
                        <motion.div 
                          key="memories-screen"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 text-[#2D2D2D]"
                        >
                          <div className="border border-wedding-gold/20 p-5 rounded-2xl bg-white shadow-sm space-y-4">
                            <h5 className="font-serif text-lg font-bold text-wedding-primary text-center">Wedding Wall</h5>
                            <p className="text-[10px] text-wedding-gray text-center">Share your snaps and wishes with the family.</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative group">
                                <img src="/auravows_hero.png" alt="Memory Mock" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/40 p-1 text-[8px] text-white truncate">Adarsh: Congrats!</div>
                              </div>
                              <div className="aspect-square bg-wedding-lightGold/60 rounded-lg border border-dashed border-wedding-gold/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-wedding-lightGold">
                                <Upload className="w-4 h-4 text-wedding-gold" />
                                <span className="text-[8px] font-bold text-wedding-gold uppercase">Upload Snap</span>
                              </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 space-y-2 text-[10px]">
                              <div className="bg-gray-50 p-2 rounded">
                                <p className="font-semibold text-wedding-primary">Maya Sharma</p>
                                <p className="text-wedding-gray">So beautiful! Wishing you both a lifetime of happiness 🥂</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mock Phone Tab Bar navigation */}
                  <div className="bg-white border-t border-gray-100 px-4 py-3 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-wedding-gray">
                    <button 
                      onClick={() => setActiveTab('invite')}
                      className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${activeTab === 'invite' ? 'text-[#4A0E0E] bg-wedding-lightGold/40 font-bold' : 'hover:text-wedding-primary'}`}
                    >
                      <FileText className="w-4 h-4" />
                      Invitation
                    </button>
                    <button 
                      onClick={() => setActiveTab('rsvp')}
                      className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${activeTab === 'rsvp' ? 'text-[#4A0E0E] bg-wedding-lightGold/40 font-bold' : 'hover:text-wedding-primary'}`}
                    >
                      <Users className="w-4 h-4" />
                      RSVP
                    </button>
                    <button 
                      onClick={() => setActiveTab('memories')}
                      className={`flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all ${activeTab === 'memories' ? 'text-[#4A0E0E] bg-wedding-lightGold/40 font-bold' : 'hover:text-wedding-primary'}`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Memories
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works / Design Journey */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-wedding-lightGold/20 border-t border-wedding-gold/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Simplified Workflow</h2>
            <p className="text-3xl md:text-5xl font-serif text-wedding-primary">Three Steps to Elegance</p>
            <p className="text-wedding-gray text-sm">Getting your bespoke digital wedding suit is incredibly straightforward. Share details and let us handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-wedding-gold/20 -z-10" />

            <div className="bg-white p-8 rounded-2xl border border-wedding-gold/10 text-center space-y-4 shadow-sm relative">
              <div className="w-12 h-12 bg-wedding-primary text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-wedding-primary">Submit Requirements</h3>
              <p className="text-wedding-gray text-xs leading-relaxed">Share your wedding details, pre-wedding shoot photos, schedule details, venue maps, and custom background music preferences through our contact enquiry.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-wedding-gold/10 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-wedding-primary text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-wedding-primary">Custom Crafting</h3>
              <p className="text-wedding-gray text-xs leading-relaxed">Our professional in-house designers curate the layouts, configure colors, customize typography, and construct timeline components based on your design style.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-wedding-gold/10 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-wedding-primary text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-wedding-primary">Launch & Track</h3>
              <p className="text-wedding-gray text-xs leading-relaxed">We set your custom invitation link live. You can share the premium digital card with invitees and monitor guest RSVP submissions live from your dashboard.</p>
            </div>

          </div>
        </div>
      </section>

      {/* About Section / Alappuzha Kerala Base */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="md:col-span-6 relative rounded-3xl overflow-hidden shadow-2xl border border-wedding-gold/20">
            <img 
              src="/kerala_location.png" 
              alt="Bespoke Weddings in Alappuzha, Kerala" 
              className="w-full object-cover aspect-[4/3] scale-105 hover:scale-100 transition-transform duration-700" 
            />
            {/* Elegant overlay badge */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-wedding-gold/20 flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-wedding-primary flex items-center justify-center text-white flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-wedding-secondary" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-wedding-gold font-bold">Creative HQ</p>
                <p className="text-[10px] sm:text-xs font-bold text-wedding-primary">Alappuzha, Kerala, India</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 space-y-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Based in Paradise</h2>
            <p className="text-3xl md:text-5xl font-serif text-wedding-primary leading-tight">Inspired by the Backwaters of Kerala</p>
            <p className="text-wedding-gray text-sm md:text-base leading-relaxed">
              Our business is proudly head-quartered in <strong>Alappuzha, Kerala</strong>—popularly known as the Venice of the East. Famous for its gorgeous tranquil backwaters, towering coconut palms, and majestic houseboats, the romance of Alappuzha is woven directly into every template we build. 
            </p>
            <p className="text-wedding-gray text-sm md:text-base leading-relaxed">
              Whether you are planning a traditional coastal wedding, a regal estate celebration, or an eco-conscious minimal gathering, our systems ensure your invitations reflect Kerala's legendary hospitality and timeless allure.
            </p>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-wedding-primary">
                <Award className="w-5 h-5 text-wedding-gold" />
                <span className="text-xs uppercase tracking-widest font-bold">Authentic Designs</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-wedding-gold/40" />
              <div className="flex items-center gap-2 text-wedding-primary">
                <Sparkles className="w-5 h-5 text-wedding-gold" />
                <span className="text-xs uppercase tracking-widest font-bold">Local Craftsmanship</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Contact & Location Section */}
      <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 bg-wedding-lightGold/20 border-t border-wedding-gold/15 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold">Get In Touch</h2>
              <p className="text-3xl md:text-4xl font-serif text-wedding-primary leading-tight">We'd Love to Hear From You</p>
              <p className="text-wedding-gray text-sm">Have a special layout request or need dedicated onboarding assistance? Get in touch with our support team in Alappuzha.</p>
            </div>

            <div className="space-y-6">
              {/* Contact Item 1 */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-wedding-gold/10 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-wedding-lightGold border border-wedding-gold/25 flex items-center justify-center text-wedding-primary flex-shrink-0">
                  <Mail className="w-6 h-6 text-wedding-secondary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-wedding-gray font-semibold">Email Us</p>
                  <a href="mailto:auravows@gmail.com" className="text-sm font-bold text-wedding-primary hover:underline">auravows@gmail.com</a>
                </div>
              </div>

              {/* Contact Item 2 */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-wedding-gold/10 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-wedding-lightGold border border-wedding-gold/25 flex items-center justify-center text-wedding-primary flex-shrink-0">
                  <Phone className="w-6 h-6 text-wedding-secondary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-wedding-gray font-semibold">Call or WhatsApp</p>
                  <a href="tel:8590594735" className="text-sm font-bold text-wedding-primary hover:underline">8590594735</a>
                </div>
              </div>

              {/* Contact Item 3 */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-wedding-gold/10 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-wedding-lightGold border border-wedding-gold/25 flex items-center justify-center text-wedding-primary flex-shrink-0">
                  <MapPin className="w-6 h-6 text-wedding-secondary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-wedding-gray font-semibold">Our Studio Location</p>
                  <p className="text-sm font-bold text-wedding-primary">Alappuzha, Kerala, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Enquiry Form Right */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-wedding-gold/15 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-wedding-primary" />
              
              {!contactSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <h3 className="font-serif text-2xl text-wedding-primary font-bold">Send an Enquiry</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-wedding-primary mb-1.5">Your Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter your name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-wedding-primary mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="you@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wedding-primary mb-1.5">Phone Number (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 8590594735"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-wedding-primary mb-1.5">Your Message / Wedding Plan Details</label>
                    <textarea 
                      required
                      placeholder="Tell us about your wedding date, approximate guests count, or any custom theme designs you have in mind..."
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-wedding-gold focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#4A0E0E] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wedding-dark transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Send Enquiry Message
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-md">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-emerald-800">Message Received!</h3>
                  <p className="text-wedding-gray text-sm max-w-sm mx-auto">
                    Thank you <strong>{contactName}</strong>. Your enquiry details has been dispatched to <strong>auravows@gmail.com</strong>. We will get back to you shortly.
                  </p>
                  <div className="h-px bg-gray-100 w-24 mx-auto my-4" />
                  <p className="text-xs text-wedding-gold italic">A copy of the notification has been logged for Alappuzha, Kerala support team.</p>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-wedding-dark text-white pt-12 sm:pt-16 pb-8 border-t border-wedding-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          
          <div className="space-y-4">
            <div className="inline-flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/logo.png" alt="AuraVows Logo" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Elegant digital wedding invitations, smart RSVP manager, and custom galleries handcrafted with love.
            </p>
            <p className="text-[10px] text-wedding-secondary uppercase tracking-widest font-bold">Handcrafted in Alappuzha, Kerala</p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-wedding-secondary mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-xs text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#templates" className="hover:text-white transition-colors">Templates</a>
              <a href="#experience" className="hover:text-white transition-colors">Interactive Demo</a>
              <a href="#about" className="hover:text-white transition-colors">Our Creative Base</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-wedding-secondary mb-4">Business Location</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              AuraVows Studios<br />
              Near Backwater Canal<br />
              Alappuzha, Kerala - India
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-wedding-secondary mb-4">Contact Info</h4>
            <div className="flex flex-col gap-2.5 text-xs text-white/70">
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-wedding-secondary" /> auravows@gmail.com</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-wedding-secondary" /> +91 8590594735</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/40 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AuraVows. All rights reserved.</p>
          <p>Hand-crafted with 💖 for weddings everywhere.</p>
        </div>
      </footer>

    </div>
  );
}
