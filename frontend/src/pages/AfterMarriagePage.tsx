import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../lib/api';
import { 
  Heart, Camera, Music, Sparkles, 
  ChevronDown, Play, 
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvitationData {
  invitation_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  after_marriage_photos?: string[];
  after_marriage_text?: string;
  after_marriage_bg_opacity?: number;
  background_music_url?: string;
  template?: string;
  custom_config?: any;
  is_active?: boolean;
}

export default function AfterMarriagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'inactive' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/invitations/${id}`);
        setData(response.data);
        if (response.data.background_music_url) {
          audio.src = getImageUrl(response.data.background_music_url);
          audio.loop = true;
          // Attempt auto-play
          audio.play().then(() => setIsPlaying(true)).catch(() => {
             console.log("Auto-play blocked by browser, waiting for interaction");
          });
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setError('inactive');
        } else {
          setError('not_found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, audio]);

  // Background Slideshow Logic
  useEffect(() => {
    if (data && data.after_marriage_photos && data.after_marriage_photos.length > 1) {
      const interval = setInterval(() => {
        setActivePhotoIndex((prev) => (prev + 1) % data.after_marriage_photos!.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [data]);

  const toggleMusic = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
       <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Heart className="w-12 h-12 text-[#B89462] fill-current" />
       </motion.div>
    </div>
  );

  if (error === 'inactive') return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFEF5] px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white shadow-2xl border border-wedding-gold/20">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-wedding-lightGold/30 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-wedding-gold opacity-40" />
          </div>
        </div>
        <h2 className="text-3xl font-serif text-wedding-dark">Invitation Closed</h2>
        <p className="text-wedding-gray italic leading-relaxed">
          This invitation is currently inactive or the event has passed.
          Please contact the family directly for any inquiries.
        </p>
        <div className="w-12 h-px bg-wedding-gold/30 mx-auto"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-wedding-gold font-bold">Forever & Always</p>
      </motion.div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFEF5] px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white shadow-2xl border border-red-50">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-200" />
          </div>
        </div>
        <h2 className="text-3xl font-serif text-wedding-dark">Invitation Not Found</h2>
        <p className="text-wedding-gray italic leading-relaxed">
          We couldn't find the invitation you're looking for.
          Please double-check the link or contact the host.
        </p>
      </motion.div>
    </div>
  );

  const photos = data.after_marriage_photos || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D241E] font-serif overflow-hidden">
      {/* Premium Hero Section with Parallax Collage */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Collage Background - Slideshow Effect */}
        <div 
          className="absolute inset-0 z-0 scale-105 pointer-events-none blur-[1px]"
          style={{ opacity: data.after_marriage_bg_opacity ?? 0.4 }}
        >
          <AnimatePresence mode="wait">
            {photos.length > 0 ? (
              <motion.div 
                key={activePhotoIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src={getImageUrl(photos[activePhotoIndex % photos.length])} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#B89462]/20 to-transparent" />
            )}
          </AnimatePresence>
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/80 via-transparent to-[#FDFBF7] z-[1]" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 text-center space-y-8 max-w-4xl"
        >
          <div className="flex justify-center">
            <Sparkles className="text-[#B89462] w-8 h-8 animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <h2 className="uppercase tracking-[0.6em] text-xs font-bold text-[#B89462] opacity-80">Happily Ever After</h2>
            <h1 className="text-5xl md:text-8xl font-light italic leading-tight">
              {data.custom_config?.swap_names ? (
                <>{data.bride_name} <span className="text-[#B89462]">&</span> {data.groom_name}</>
              ) : (
                <>{data.groom_name} <span className="text-[#B89462]">&</span> {data.bride_name}</>
              )}
            </h1>
            <p className="text-sm md:text-lg tracking-[0.2em] uppercase opacity-60">
              {new Date(data.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="w-24 h-px bg-[#B89462] mx-auto opacity-30" />

          <p className="text-xl md:text-2xl italic leading-relaxed text-[#5C4D3C] max-w-2xl mx-auto px-6">
            {data.after_marriage_text || "Thank you for being part of our beautiful journey. We are forever grateful for your love and blessings."}
          </p>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="pt-12"
          >
            <ChevronDown className="w-6 h-6 text-[#B89462] opacity-50 mx-auto" />
          </motion.div>
        </motion.div>

        {/* Auto-play Fallback Hint */}
        {!isPlaying && data.background_music_url && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggleMusic}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 px-6 py-2 rounded-full border border-[#B89462]/30 text-[#B89462] text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-sm flex items-center gap-2 hover:bg-white/40 transition-all"
          >
            <Music className="w-3 h-3" />
            Tap to enable music
          </motion.button>
        )}
      </section>

      {/* Main Gallery Showcase */}
      <section className="py-24 px-4 max-w-7xl mx-auto space-y-24">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-[#B89462] opacity-20" />
            <h3 className="text-3xl md:text-5xl font-light italic">Wedding Memories</h3>
            <div className="h-px w-12 bg-[#B89462] opacity-20" />
          </div>
          <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#B89462] opacity-60">Reliving the most beautiful day of our lives</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedImage(photo)}
              className="relative group cursor-pointer overflow-hidden rounded-[2rem] shadow-xl border border-[#B89462]/10 bg-white"
            >
              <img 
                src={getImageUrl(photo)} 
                alt="" 
                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gratitude Section */}
      <section className="py-24 bg-[#F8F5F0] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Heart className="w-64 h-64 text-[#B89462]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
          <div className="space-y-6">
            <h4 className="text-2xl md:text-4xl font-light italic">A Note of Gratitude</h4>
            <div className="w-16 h-px bg-[#B89462] mx-auto opacity-30" />
            <p className="text-lg md:text-xl text-[#5C4D3C] leading-relaxed">
              "To our families and friends, your presence made our wedding complete. Your love, laughter, and support mean the world to us. Thank you for making our special day even more memorable."
            </p>
          </div>
          
          <div className="pt-8">
            <p className="font-serif text-3xl font-light italic tracking-widest text-[#B89462]">
              With Love, {data.custom_config?.swap_names ? `${data.bride_name} & ${data.groom_name}` : `${data.groom_name} & ${data.bride_name}`}
            </p>
          </div>
        </div>
      </section>

      {/* Floating Controls */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button 
          onClick={toggleMusic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl backdrop-blur-md ${isPlaying ? 'bg-[#B89462] text-white rotate-12' : 'bg-white/80 text-[#B89462]'}`}
        >
          {isPlaying ? <Music className="w-6 h-6 animate-bounce" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <button 
          onClick={() => navigate(`/invite/${id}`)}
          className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#B89462] shadow-2xl transition-all hover:scale-110"
          title="Back to Invitation"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <ChevronDown className="w-10 h-10 rotate-90" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={getImageUrl(selectedImage)} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 text-center border-t border-[#B89462]/10 mt-12 opacity-40">
        <a href="/" className="inline-block hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-4 h-4 fill-current text-[#B89462]" />
            <span className="uppercase text-[8px] tracking-[0.5em] font-bold text-[#2D241E]">AuraVows Legacy Memories</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-60 italic">Designed for Eternal Moments</p>
        </a>
      </footer>
    </div>
  );
}
