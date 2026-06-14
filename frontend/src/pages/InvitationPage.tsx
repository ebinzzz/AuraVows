import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../lib/api';
import {
  Heart, MapPin, Clock,
  Cross, Moon, Star, Flower2,
  Calendar, Info, Phone,
  ExternalLink, Send, Gift,
  ChevronRight, Camera, X,
  CalendarPlus, Video, ImageIcon, Music, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import FlowerFall from '../components/FlowerFall';

interface InvitationData {
  invitation_id: string;
  bride_name: string;
  groom_name: string;
  bride_parents: string;
  groom_parents: string;
  bride_family?: string;
  groom_family?: string;
  bride_siblings: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  venue_map_url: string;
  special_message: string;
  compliments_title?: string;
  compliments_names?: string;
  reception_date?: string;
  reception_time?: string;
  reception_venue_name?: string;
  reception_venue_address?: string;
  reception_map_url?: string;
  template?: string;
  custom_config?: any;
  background_music_url?: string;
  wedding_day_music_url?: string;
  live_stream_url?: string;
  gallery_photos?: string[];
  event_timeline?: { name: string; time: string; venue: string }[];
  invitation_wording?: string;
  invitation_quote?: string;
  opening_verse?: string;
  opening_verse_ref?: string;
  hero_subtitle_1?: string;
  hero_subtitle_2?: string;
  after_marriage_photos?: string[];
  after_marriage_text?: string;
  after_marriage_bg_opacity?: number;
  parent_id?: string | null;
}

interface CustomTemplate {
  name: string;
  config: {
    colors: { bg: string; cardBg?: string; primary: string; secondary: string; text: string };
    font: string;
    logo: string;
    pattern?: string;
    heroBgImage?: string;
    heroBgOpacity?: number;
    layout: { id: string; type: string; visible: boolean; bgImage?: string; bgOpacity?: number }[];
    showFlowers?: boolean;
    silhouetteSize?: number;
    silhouetteOpacity?: number;
    showSilhouette?: boolean;
  };
}

const DEFAULT_SILHOUETTE = '/static/uploads/default_silhouette.png';

const LOGOS: Record<string, any> = {
  heart: Heart,
  cross: Cross,
  moon: Moon,
  star: Star,
  om: Flower2,
};

const PATTERNS = [
  { id: 'none', label: 'None', url: '' },
  { id: 'floral-1', label: 'Floral Paper', url: 'https://www.transparenttextures.com/patterns/floral-paper.png' },
  { id: 'floral-2', label: 'Classic Flowers', url: 'https://www.transparenttextures.com/patterns/flowers.png' },
  { id: 'floral-3', label: 'Wild Flowers', url: 'https://www.transparenttextures.com/patterns/wild-flowers.png' },
  { id: 'floral-4', label: 'Light Floral', url: 'https://www.transparenttextures.com/patterns/light-floral.png' },
  { id: 'swirl', label: 'Elegant Swirl', url: 'https://www.transparenttextures.com/patterns/swirl.png' },
  { id: 'damask', label: 'Royal Damask', url: 'https://www.transparenttextures.com/patterns/damask.png' },
];

export default function InvitationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InvitationData | null>(null);
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'inactive' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showOverlay, setShowOverlay] = useState(true);
  const [isWeddingDay, setIsWeddingDay] = useState(false);
  const [showeringFlowers, setShoweringFlowers] = useState(false);
  const [flowerKey, setFlowerKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let dayStr = "25";
  let monthStr = "MAY";
  let yearStr = "2026";
  let weekdayStr = "MONDAY";
  let timeStr = "5:00 PM ONWARDS";

  if (data?.wedding_date) {
    try {
      const dateParts = data.wedding_date.split("-");
      let dateObj: Date;
      if (dateParts.length === 3) {
        dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      } else {
        dateObj = new Date(data.wedding_date);
      }
      
      if (!isNaN(dateObj.getTime())) {
        dayStr = dateObj.getDate().toString().padStart(2, '0');
        monthStr = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        yearStr = dateObj.getFullYear().toString();
        weekdayStr = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      }
    } catch (e) {
      console.error("Error formatting date", e);
    }
  }

  if (data?.wedding_time) {
    const rawTime = data.wedding_time.toUpperCase();
    timeStr = rawTime + (rawTime.includes("ONWARDS") ? "" : " ONWARDS");
  }

  useEffect(() => {
    if (data?.wedding_date) {
      // Force comparison using Indian Standard Time (IST)
      const indiaTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const indiaDate = new Date(indiaTimeStr);

      const year = indiaDate.getFullYear();
      const month = String(indiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(indiaDate.getDate()).padStart(2, '0');
      const todayInIndia = `${year}-${month}-${day}`;

      setIsWeddingDay(data.wedding_date === todayInIndia);
    }
  }, [data?.wedding_date]);

  useEffect(() => {
    if (data?.wedding_date) {
      const timer = setInterval(() => {
        // Robust date parsing
        let timeStr = data.wedding_time || '00:00';
        // Handle AM/PM if present
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
          const modifier = timeStr.toLowerCase().includes('pm') ? 'pm' : 'am';
          const timePart = timeStr.replace(/am|pm/i, '').trim();
          let [hours, minutes] = timePart.split(':');
          if (hours === '12') hours = '00';
          if (modifier === 'pm') hours = (parseInt(hours, 10) + 12).toString();
          timeStr = `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
        }

        // Ensure time is in HH:mm format for ISO
        const cleanTime = timeStr.match(/\d{2}:\d{2}/) ? timeStr.match(/\d{2}:\d{2}/)![0] : '00:00';

        const weddingDateStr = `${data.wedding_date}T${cleanTime}:00`;
        const weddingDate = new Date(weddingDateStr).getTime();
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const musicUrl = isWeddingDay && data.wedding_day_music_url
        ? data.wedding_day_music_url
        : data.background_music_url;

      if (musicUrl) {
        audio.src = getImageUrl(musicUrl);
        audio.loop = true;
        audio.preload = "auto";
        audio.load();

        return () => {
          audio.pause();
        };
      }
    }
  }, [data?.background_music_url, data?.wedding_day_music_url, isWeddingDay, audio]);

  const handleOpenInvitation = () => {
    setShowOverlay(false);
    const musicUrl = isWeddingDay && data?.wedding_day_music_url
      ? data.wedding_day_music_url
      : data?.background_music_url;

    if (musicUrl) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Playback failed on mobile interaction:", err));
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const addToCalendar = () => {
    if (!data) return;
    const dateStr = data.wedding_date.replace(/-/g, '');
    const names = data.custom_config?.swap_names
      ? `${data.bride_name} & ${data.groom_name}`
      : `${data.groom_name} & ${data.bride_name}`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Wedding: ' + names)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent('Join us for our wedding ceremony!')}&location=${encodeURIComponent(data.venue_name + ', ' + data.venue_address)}`;
    window.open(url, '_blank');
  };

  const triggerFlowerShower = () => {
    setShoweringFlowers(true);
    setFlowerKey(prev => prev + 1);
    setTimeout(() => setShoweringFlowers(false), 8000);
  };

  const handleRSVPClick = async () => {
    if (data?.parent_id) {
      try {
        const response = await api.get(`/invitations/by-id/${data.parent_id}`);
        const parentCode = response.data.invitation_id;
        navigate(`/invite/${parentCode}/rsvp`);
      } catch (err) {
        console.error("Failed to fetch parent invitation code", err);
        navigate(`/invite/${id}/rsvp`);
      }
    } else {
      navigate(`/invite/${id}/rsvp`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/invitations/${id}`);
        const invData = response.data;
        setData(invData);

        // Instant redirect if passed
        const indiaTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const indiaDate = new Date(indiaTimeStr);
        const todayInIndia = `${indiaDate.getFullYear()}-${String(indiaDate.getMonth() + 1).padStart(2, '0')}-${String(indiaDate.getDate()).padStart(2, '0')}`;

        if (todayInIndia > invData.wedding_date) {
          navigate(`/invite/${id}/memories`, { replace: true });
          return;
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (invData.template && uuidRegex.test(invData.template)) {
          try {
            const tplResponse = await api.get(`/templates/${invData.template}`);
            setCustomTemplate(tplResponse.data);
          } catch (tplErr) {
            console.error("Failed to fetch custom template:", tplErr);
          }
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
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-lightGold">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-wedding-primary"
      >
        <Heart className="w-12 h-12 fill-current" />
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

  const getTemplateStyles = () => {
    if (customTemplate && data) {
      const cfg = customTemplate.config;
      return {
        bg: '', text: '', accent: '', button: '', card: '', heroOverlay: '',
        font: cfg.font === 'serif' ? 'font-serif' : 'font-sans',
        isCustom: true, colors: cfg.colors, logo: cfg.logo, pattern: cfg.pattern || 'none',
        heroBgImage: cfg.heroBgImage || '', heroBgOpacity: cfg.heroBgOpacity ?? 0.5,
        layout: cfg.layout,
        showFlowers: cfg.showFlowers || false,
        silhouetteSize: cfg.silhouetteSize || 200,
        silhouetteOpacity: cfg.silhouetteOpacity ?? 0.3,
        showSilhouette: cfg.showSilhouette !== false,
        custom_config: data.custom_config || {},
        showBottomNav: false
      };
    }

    switch (data.template) {
      case 'auravows':
        return {
          bg: 'bg-[#FAF6F0]', text: 'text-[#4E2A12]', accent: 'text-[#C5A880]',
          button: 'bg-[#4E2A12] text-white hover:bg-[#5C3818] transition-colors', card: 'bg-white/85 border-[#C5A880]/30 backdrop-blur-sm shadow-md rounded-3xl',
          heroOverlay: 'bg-[#4E2A12]/5', font: 'font-serif', isCustom: false, showFlowers: true,
          showBottomNav: true,
          heroBgImage: '/auravows_hero.png', heroBgOpacity: 0.12,
          logo: 'heart', pattern: 'none', showSilhouette: false, silhouetteSize: 0, silhouetteOpacity: 0,
          colors: { bg: '#FAF6F0', primary: '#4E2A12', secondary: '#C5A880', text: '#4E2A12' }
        };
      case 'modern':
        return {
          bg: 'bg-[#F9FBF9]', text: 'text-wedding-sage', accent: 'text-wedding-sage',
          button: 'bg-wedding-sage hover:bg-opacity-90', card: 'bg-white border-wedding-sage/20',
          heroOverlay: 'bg-wedding-sage/5', font: 'font-sans', isCustom: false, showFlowers: false,
          showBottomNav: false, logo: 'heart', pattern: 'none', showSilhouette: true, silhouetteSize: 200, silhouetteOpacity: 0.3,
          colors: { bg: '#F9FBF9', primary: '#4A5D4E', secondary: '#7F9F85', text: '#4A5D4E' }
        };
      case 'floral':
        return {
          bg: 'bg-[#FFF5F7]', text: 'text-wedding-rose', accent: 'text-wedding-rose',
          button: 'bg-wedding-rose hover:bg-opacity-90', card: 'bg-white border-wedding-rose/20',
          heroOverlay: 'bg-wedding-rose/5', font: 'font-serif', isCustom: false,
          showBottomNav: false, logo: 'heart', pattern: 'none', showSilhouette: true, silhouetteSize: 200, silhouetteOpacity: 0.3,
          colors: { bg: '#FFF5F7', primary: '#8C3E52', secondary: '#D97E96', text: '#8C3E52' }
        };
      case 'royal':
      default:
        return {
          bg: 'bg-[#FFFEF5]', text: 'text-wedding-dark', accent: 'text-wedding-gold',
          button: 'bg-wedding-gold hover:bg-wedding-mid', card: 'bg-white border-wedding-gold/20',
          heroOverlay: 'bg-wedding-gold/5', font: 'font-serif', isCustom: false,
          showBottomNav: false, logo: 'heart', pattern: 'none', showSilhouette: true, silhouetteSize: 200, silhouetteOpacity: 0.3,
          colors: { bg: '#FFFEF5', primary: '#1A1A1A', secondary: '#D4AF37', text: '#1A1A1A' }
        };
    }
  };

  const styles = getTemplateStyles();
  const LogoIcon = LOGOS[styles.isCustom ? styles.logo : 'heart'] || Heart;

  const renderSection = (section: any) => {
    const type = section.type || section;
    const sectionBg = getImageUrl(section.bgImage) || (type === 'hero' && !styles.heroBgImage && styles.showSilhouette !== false ? getImageUrl(DEFAULT_SILHOUETTE) : '');
    const bgOpacity = section.bgOpacity ?? (type === 'hero' ? styles.heroBgOpacity : 0.1);

    return (
      <section
        className={`relative overflow-hidden ${type === 'hero' ? 'pt-8 pb-12' : 'py-12'} flex flex-col items-center justify-center text-center px-4`}
      >
        {/* Background Layer (Custom Only) */}
        {sectionBg && !sectionBg.includes('default_silhouette') && (
          <div
            className={`absolute inset-0 z-0 bg-cover bg-no-repeat bg-center`}
            style={{
              backgroundImage: `url(${sectionBg})`,
              opacity: bgOpacity,
              backgroundSize: 'cover'
            }}
          />
        )}

        <div className="relative z-10 w-full max-w-4xl mx-auto" style={{ fontSize: section.fontSize ? `${section.fontSize}px` : undefined, fontWeight: section.fontWeight || 'normal' }}>
          {type === 'quote' && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-4">
              <p className="text-xl md:text-2xl italic opacity-70 px-6 whitespace-pre-line" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}), fontSize: 'inherit' }}>
                {data.opening_verse || "\"The Lord has made everything beautiful in his time\""}
              </p>
              <p className="text-xs uppercase tracking-[0.4em] opacity-50" style={styles.isCustom ? { color: styles.colors.secondary } : {}}>
                {data.opening_verse_ref || "Eccl - 3:11"}
              </p>
            </motion.div>
          )}

          {type === 'hero' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-4">
              <div className="flex justify-center mb-2 relative z-10">
                {data.template === 'auravows' ? (
                  <img src="/logo.png" alt="AuraVows Logo" className="h-24 md:h-28 w-auto object-contain" />
                ) : (
                  <LogoIcon className="w-10 h-10" style={styles.isCustom ? { color: styles.colors.secondary } : {}} />
                )}
              </div>
              
              {data.template === 'auravows' ? (
                <div className="space-y-8 relative z-10 pt-4 text-center px-4">
                  <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-[#4E2A12]/60">
                    {data.hero_subtitle_1 || "TOGETHER WITH THEIR FAMILIES"}
                  </p>
                  
                  <h1 className="font-serif text-5xl md:text-7xl text-[#4E2A12] font-normal tracking-wide py-2">
                    {data.custom_config?.swap_names 
                      ? `${data.bride_name} & ${data.groom_name}` 
                      : `${data.groom_name} & ${data.bride_name}`}
                  </h1>
                  
                  {/* Gold flourish heart separator */}
                  <div className="flex items-center justify-center gap-4 w-full py-2 text-[#C5A880]">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#C5A880]/60" />
                    <svg className="w-14 h-5 fill-current text-[#C5A880]" viewBox="0 0 64 20">
                      <path d="M2,10 C15,2 24,8 28,10 C24,11 15,11 10,12 C18,8 24,9 28,10" stroke="currentColor" strokeWidth="0.75" fill="none" strokeLinecap="round" />
                      <path d="M32,15 C31,13.5 28.5,11 28.5,8.5 C28.5,6.5 30,5 32,7 C34,5 35.5,6.5 35.5,8.5 C35.5,11 33,13.5 32,15 Z" fill="currentColor" />
                      <path d="M62,10 C49,2 40,8 36,10 C40,11 49,11 54,12 C46,8 40,9 36,10" stroke="currentColor" strokeWidth="0.75" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#C5A880]/60" />
                  </div>

                  <p className="uppercase tracking-[0.2em] text-[10px] font-bold text-[#4E2A12]/60 pt-2 max-w-[280px] mx-auto leading-relaxed">
                    {data.hero_subtitle_2 || "INVITE YOU TO CELEBRATE THEIR WEDDING"}
                  </p>

                  <div className="pt-6 space-y-3">
                    <div className="flex items-center justify-center gap-8 text-3xl font-serif font-bold text-[#4E2A12] py-2 select-none tracking-widest">
                      <span>{dayStr}</span>
                      <span className="text-[#C5A880]/60 font-light text-2xl">|</span>
                      <span>{monthStr}</span>
                      <span className="text-[#C5A880]/60 font-light text-2xl">|</span>
                      <span>{yearStr}</span>
                    </div>
                    <p className="text-[10px] tracking-[0.2em] font-semibold text-[#4E2A12]/80 uppercase">
                      {weekdayStr} • {timeStr}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <div className="space-y-0.5">
                    <p className="uppercase tracking-[0.3em] text-[9px] font-bold opacity-60" style={styles.isCustom ? { color: styles.colors.secondary } : {}}>
                      {data.hero_subtitle_1 || "Together with our families"}
                    </p>
                    <p className="uppercase tracking-[0.1em] text-[10px] italic opacity-80 px-4" style={styles.isCustom ? { color: styles.colors.text } : {}}>
                      {data.hero_subtitle_2 || "We extend a warm invitation to join the wedding celebration of"}
                    </p>
                  </div>
                  {data.custom_config?.swap_names ? (
                    <>
                      <div className="space-y-1">
                        <h1 className={`${styles.font} text-4xl md:text-7xl`} style={{ ...(styles.isCustom ? { color: styles.colors.primary } : {}), fontSize: section.fontSize ? `${section.fontSize}px` : undefined }}>{data.bride_name}</h1>
                        <div className="space-y-0.5 opacity-70" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}) }}>
                          <p className="italic text-sm">Daughter of {data.bride_parents}</p>
                          {data.bride_family && <p className="font-bold tracking-widest text-[11px] uppercase">{data.bride_family}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 w-full">
                        <div className="h-px w-10 bg-current opacity-20" />
                        <span className="text-3xl font-serif italic opacity-40">&</span>
                        <div className="h-px w-10 bg-current opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <h1 className={`${styles.font} text-4xl md:text-7xl`} style={{ ...(styles.isCustom ? { color: styles.colors.primary } : {}), fontSize: section.fontSize ? `${section.fontSize}px` : undefined }}>{data.groom_name}</h1>
                        <div className="space-y-0.5 opacity-70" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}) }}>
                          <p className="italic text-sm">Son of {data.groom_parents}</p>
                          {data.groom_family && <p className="font-bold tracking-widest text-[11px] uppercase">{data.groom_family}</p>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <h1 className={`${styles.font} text-4xl md:text-7xl`} style={{ ...(styles.isCustom ? { color: styles.colors.primary } : {}), fontSize: section.fontSize ? `${section.fontSize}px` : undefined }}>{data.groom_name}</h1>
                        <div className="space-y-0.5 opacity-70" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}) }}>
                          <p className="italic text-sm">Son of {data.groom_parents}</p>
                          {data.groom_family && <p className="font-bold tracking-widest text-[11px] uppercase">{data.groom_family}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 w-full">
                        <div className="h-px w-10 bg-current opacity-20" />
                        <span className="text-3xl font-serif italic opacity-40">&</span>
                        <div className="h-px w-10 bg-current opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <h1 className={`${styles.font} text-4xl md:text-7xl`} style={{ ...(styles.isCustom ? { color: styles.colors.primary } : {}), fontSize: section.fontSize ? `${section.fontSize}px` : undefined }}>{data.bride_name}</h1>
                        <div className="space-y-0.5 opacity-70" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}) }}>
                          <p className="italic text-sm">Daughter of {data.bride_parents}</p>
                          {data.bride_family && <p className="font-bold tracking-widest text-[11px] uppercase">{data.bride_family}</p>}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="pt-6 space-y-2">
                    <div className="w-40 h-px mx-auto opacity-50" style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }} />
                    <p className={`text-3xl md:text-4xl ${styles.font} font-bold tracking-widest`} style={styles.isCustom ? { color: styles.colors.primary } : {}}>
                      {new Date(data.wedding_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xl tracking-[0.3em] uppercase opacity-70" style={styles.isCustom ? { color: styles.colors.text } : {}}>{data.wedding_time}</p>
                    <div className="w-40 h-px mx-auto opacity-50" style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {type === 'wording' && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="max-w-2xl mx-auto px-6">
              <p className="leading-relaxed italic opacity-80 font-serif whitespace-pre-line" style={{ ...(styles.isCustom ? { color: styles.colors.text } : {}), fontSize: 'inherit' }}>
                {data.invitation_wording || "cordially request the honour of your presence with your family on the auspicious occasion of the marriage of our daughter"}
              </p>
            </motion.div>
          )}

          {type === 'parents' && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-10">
              <div>
                <p
                  className="mb-4 uppercase text-[10px] tracking-[0.3em] font-bold"
                  style={styles.isCustom ? { color: styles.colors.secondary } : { color: '#9CA3AF' }}
                >
                  {data.compliments_title || "WITH THE BLESSINGS OF OUR ELDERS"}
                </p>
                <p className={`${styles.font} leading-relaxed whitespace-pre-line`} style={{ ...(styles.isCustom ? { color: styles.colors.primary } : {}), fontSize: 'inherit' }}>
                  {data.compliments_names}
                </p>
              </div>
              <h3 className={`text-2xl ${styles.font} italic opacity-60 px-6 max-w-2xl mx-auto whitespace-pre-line`}>
                {data.invitation_quote || "Invite you to celebrate their union"}
              </h3>
              <div className="pt-8">
                <div className="w-40 h-px mx-auto opacity-30" style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }} />
              </div>
            </motion.div>
          )}

          {type === 'ceremony' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className={`p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border backdrop-blur-md relative overflow-hidden`}
              style={{
                borderColor: styles.isCustom ? styles.colors.secondary + '33' : undefined,
                backgroundColor: styles.isCustom
                  ? (styles.colors as any).cardBg || 'rgba(255, 255, 255, 0.8)'
                  : (data.template === 'modern' ? 'rgba(249, 251, 249, 0.8)' : data.template === 'floral' ? 'rgba(255, 245, 247, 0.8)' : data.template === 'auravows' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 254, 245, 0.8)')
              }}
            >
              <div className="absolute top-0 right-0 p-6">
                <LogoIcon
                  style={{
                    width: styles.silhouetteSize ? `${styles.silhouetteSize}px` : '120px',
                    height: styles.silhouetteSize ? `${styles.silhouetteSize}px` : '120px',
                    opacity: styles.silhouetteOpacity ?? 0.05,
                    color: styles.isCustom ? styles.colors.secondary : undefined
                  }}
                />
              </div>
              <h4 className="uppercase tracking-[0.3em] font-bold mb-10 text-xs text-wedding-gold" style={styles.isCustom ? { color: styles.colors.secondary } : {}}>The Ceremony</h4>

              <div className="space-y-10 mb-12">
                <p className={`text-2xl md:text-5xl ${styles.font} font-bold tracking-widest`} style={styles.isCustom ? { color: styles.colors.primary } : {}}>
                  {new Date(data.wedding_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center justify-center gap-4 text-2xl">
                  <Clock className="w-6 h-6 text-wedding-gold" style={styles.isCustom ? { color: styles.colors.secondary } : {}} />
                  <span className="font-medium" style={styles.isCustom ? { color: styles.colors.text } : {}}>{data.wedding_time}</span>
                </div>
              </div>

              <div className="w-20 h-px mx-auto bg-wedding-gold/30 mb-10" />

              <h2 className={`text-3xl md:text-5xl ${styles.font} mb-8`} style={styles.isCustom ? { color: styles.colors.primary } : {}}>{data.venue_name}</h2>
              <div className="space-y-4 text-base md:text-lg max-w-md mx-auto mb-10">
                <div className="flex items-start justify-center gap-4">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 mt-1 text-wedding-gold flex-shrink-0" style={styles.isCustom ? { color: styles.colors.secondary } : {}} />
                  <span className="leading-relaxed" style={styles.isCustom ? { color: styles.colors.text } : {}}>{data.venue_address}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <a href={data.venue_map_url} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full border-2 transition-all uppercase text-xs font-bold tracking-[0.3em]" style={styles.isCustom ? { borderColor: styles.colors.secondary, color: styles.colors.secondary } : { borderColor: '#D4AF37', color: '#D4AF37' }}>
                  View Venue Location
                </a>

                <button onClick={addToCalendar} className="px-8 py-4 rounded-full border-2 transition-all uppercase text-xs font-bold tracking-[0.3em]" style={styles.isCustom ? { borderColor: styles.colors.secondary, color: styles.colors.secondary } : { borderColor: '#D4AF37', color: '#D4AF37' }}>
                  <CalendarPlus className="inline-block w-4 h-4 mr-2 mb-1" />
                  Add to Calendar
                </button>

                {data.live_stream_url && (
                  <a href={data.live_stream_url} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full bg-red-600 text-white shadow-xl transition-all hover:bg-red-700 uppercase text-xs font-bold tracking-[0.3em] flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Watch Live
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {type === 'rsvp' && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-10">
              <h2 className={`text-4xl md:text-6xl ${styles.font} italic`} style={styles.isCustom ? { color: styles.colors.primary } : {}}>Will you join us?</h2>
              <p className="opacity-50 text-xs tracking-widest uppercase">Kindly respond to let us know your plans</p>
              <button
                onClick={handleRSVPClick}
                className="px-10 md:px-16 py-4 md:py-6 rounded-full font-bold uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-white"
                style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }}
              >
                RSVP Now
              </button>
            </motion.div>
          )}

          {/* New Sections */}
          {type === 'countdown' && data.wedding_date && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="py-16 px-4">
              {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl md:text-6xl font-serif italic"
                    style={styles.isCustom ? { color: styles.colors.primary } : {}}
                  >
                    The Big Day is Here!
                  </motion.div>
                  <p className="text-[10px] uppercase tracking-[0.4em] opacity-50">Congratulations to the Happy Couple</p>
                </div>
              ) : (
                data.template === 'auravows' ? (
                  <div className="space-y-8 px-4">
                    <div className="border border-[#C5A880]/30 rounded-2xl py-4 px-2 bg-[#FAF5EE]/50 backdrop-blur-md max-w-sm mx-auto grid grid-cols-4 divide-x divide-[#C5A880]/20 text-center shadow-sm">
                      {[
                        { label: 'DAYS', value: timeLeft.days },
                        { label: 'HOURS', value: timeLeft.hours },
                        { label: 'MINUTES', value: timeLeft.minutes },
                        { label: 'SECONDS', value: timeLeft.seconds },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center justify-center px-1">
                          <div className="text-3xl font-serif font-semibold text-[#4E2A12] tracking-tighter">
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] uppercase tracking-[0.2em] opacity-60 font-bold mt-1 text-[#4E2A12]/80">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Featured Couple Photo */}
                    <div className="max-w-sm mx-auto">
                      <img 
                        src={data.gallery_photos && data.gallery_photos.length > 0 ? getImageUrl(data.gallery_photos[0]) : "/couple_default.png"} 
                        alt="Couple" 
                        className="w-full h-auto object-cover rounded-3xl shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 md:gap-8 max-w-3xl mx-auto">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Minutes', value: timeLeft.minutes },
                      { label: 'Seconds', value: timeLeft.seconds },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center relative">
                        <div className="relative group">
                          <div className="text-3xl sm:text-4xl md:text-7xl font-serif font-bold mb-3 tracking-tighter" style={styles.isCustom ? { color: styles.colors.primary } : {}}>
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-px opacity-20"
                            style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }}
                            initial={{ width: 0 }}
                            whileInView={{ width: '100%' }}
                          />
                        </div>
                        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold mt-2">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          )}

          {type === 'gallery' && data.gallery_photos && data.gallery_photos.length > 0 && (
            <div className="py-12 w-full max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-px w-12 bg-current opacity-20" />
                <h2 className={`text-4xl ${styles.font} italic opacity-80`}>Our Moments</h2>
                <div className="h-px w-12 bg-current opacity-20" />
              </div>
              <div className="columns-2 md:columns-3 gap-6 space-y-6">
                {data.gallery_photos.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="break-inside-avoid rounded-3xl overflow-hidden shadow-xl border border-white/20 relative group"
                  >
                    <img src={getImageUrl(url)} alt={`Gallery ${i}`} className="w-full h-auto transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white w-8 h-8" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {type === 'timeline' && data.event_timeline && data.event_timeline.length > 0 && (
            <div className="py-12 md:py-24 max-w-5xl mx-auto w-full px-6">
              <div className="flex items-center justify-center gap-4 mb-12 md:mb-20">
                <div className="h-px w-8 md:w-12 bg-current opacity-20" />
                <h2 className={`text-3xl md:text-4xl ${styles.font} italic opacity-80`}>The Celebration</h2>
                <div className="h-px w-8 md:w-12 bg-current opacity-20" />
              </div>

              <div className="relative">
                {/* Central Vertical Line */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 opacity-20"
                  style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }}
                />

                <div className="space-y-12 md:space-y-0">
                  {data.event_timeline.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 relative ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                    >
                      {/* Timeline Dot (Mobile: visible between events) */}
                      <div className="md:hidden relative z-10 flex items-center justify-center w-12 h-4">
                        <div
                          className="w-3 h-3 rounded-full border shadow-sm"
                          style={styles.isCustom ? {
                            borderColor: styles.colors.secondary,
                            backgroundColor: styles.colors.bg
                          } : {
                            borderColor: '#D4AF37',
                            backgroundColor: '#FFFEF5'
                          }}
                        />
                      </div>

                      {/* Event Content */}
                      <div className={`w-full md:w-1/2 px-4 md:px-12 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="inline-block space-y-3">
                          <h3 className="text-xl md:text-3xl font-bold tracking-[0.2em] uppercase leading-tight" style={styles.isCustom ? { color: styles.colors.primary } : {}}>{event.name.toUpperCase() === 'LUCHION' ? 'LUNCHEON' : event.name}</h3>
                          <div className="space-y-1">
                            <p className="text-sm md:text-base italic opacity-60 font-serif" style={styles.isCustom ? { color: styles.colors.text } : {}}>{event.time}</p>
                            <p className="text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase opacity-40">{event.venue}</p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Dot (Desktop only) */}
                      <div className="hidden md:flex relative z-10 items-center justify-center w-12">
                        <div
                          className="w-4 h-4 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.05)]"
                          style={styles.isCustom ? {
                            borderColor: styles.colors.secondary,
                            backgroundColor: styles.colors.bg
                          } : {
                            borderColor: '#D4AF37',
                            backgroundColor: '#FFFEF5'
                          }}
                        />
                      </div>

                      {/* Spacer for alternate layout */}
                      <div className="hidden md:block md:w-1/2" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const defaultLayout = (isWeddingDay && data?.template !== 'auravows')
    ? ['hero', 'ceremony', 'timeline', 'gallery'] // Simplified for Wedding Day
    : ['hero', 'countdown', 'ceremony', 'timeline', 'parents', 'gallery', 'rsvp'];

  let layout: any[] = styles.isCustom ? styles.layout.filter((s: any) => s.visible) : defaultLayout;

  // Filter out RSVP on wedding day even if in custom layout (except for auravows)
  if (isWeddingDay && data?.template !== 'auravows') {
    layout = layout.filter(s => (s.type || s) !== 'rsvp' && (s.type || s) !== 'countdown');
  }

  // Fail-safe: If custom layout is missing new sections but data exists, append them
  if (styles.isCustom) {
    const sectionTypes = layout.map((s: any) => s.type || s);
    if (!sectionTypes.includes('timeline') && data.event_timeline && data.event_timeline.length > 0) {
      layout = [...layout, { type: 'timeline', visible: true }];
    }
    if (!sectionTypes.includes('gallery') && data.gallery_photos && data.gallery_photos.length > 0) {
      layout = [...layout, { type: 'gallery', visible: true }];
    }
  }

  return (
    <div 
      className={`min-h-screen relative selection:bg-wedding-gold selection:text-white flex flex-col ${styles.showBottomNav ? 'pb-32 md:pb-28' : ''}`}
      style={data?.template === 'auravows' ? { background: 'radial-gradient(circle, #FCF9F5 0%, #FAF5EE 100%)', color: '#4E2A12' } : (styles.isCustom ? { backgroundColor: styles.colors.bg, color: styles.colors.text } : {})}
    >
      {/* Decorative absolute flowers for AuraVows */}
      {data?.template === 'auravows' && (
        <>
          {/* Top Left Corner Leaf/Flower Ornament */}
          <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none opacity-25 text-[#C5A880] z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="0.5">
              <path d="M 0,0 C 30,10 60,30 80,60 C 50,50 20,30 0,0 Z" fill="currentColor" fillOpacity="0.03" />
              <path d="M 0,10 C 20,20 40,40 50,70" />
              <path d="M 10,0 C 20,20 40,40 70,50" />
              <path d="M 0,0 C 15,25 35,45 60,60" />
              <path d="M 25,25 C 35,20 45,15 50,10" />
              <path d="M 25,25 C 20,35 15,45 10,50" />
              <path d="M 40,40 C 50,35 60,30 65,25" />
              <path d="M 40,40 C 35,50 30,60 25,65" />
              <path d="M 55,55 C 65,50 75,45 80,40" />
              <path d="M 55,55 C 50,65 45,75 40,80" />
            </svg>
          </div>
          {/* Top Right Corner Leaf/Flower Ornament */}
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-25 text-[#C5A880] z-0 scale-x-[-1]">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="0.5">
              <path d="M 0,0 C 30,10 60,30 80,60 C 50,50 20,30 0,0 Z" fill="currentColor" fillOpacity="0.03" />
              <path d="M 0,10 C 20,20 40,40 50,70" />
              <path d="M 10,0 C 20,20 40,40 70,50" />
              <path d="M 0,0 C 15,25 35,45 60,60" />
              <path d="M 25,25 C 35,20 45,15 50,10" />
              <path d="M 25,25 C 20,35 15,45 10,50" />
              <path d="M 40,40 C 50,35 60,30 65,25" />
              <path d="M 40,40 C 35,50 30,60 25,65" />
              <path d="M 55,55 C 65,50 75,45 80,40" />
              <path d="M 55,55 C 50,65 45,75 40,80" />
            </svg>
          </div>
        </>
      )}

      {/* Floating Hamburger Menu Button */}
      {data?.template === 'auravows' && !showOverlay && (
        <>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="fixed top-8 right-6 z-50 p-2 text-[#4E2A12] hover:opacity-80 focus:outline-none bg-transparent"
          >
            <div className="space-y-1.5 w-6">
              <span className={`block h-0.5 w-6 bg-[#4E2A12] transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-[#4E2A12] transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-[#4E2A12] transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
          
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-0 bg-[#FAF6F0] z-40 border-b border-[#C5A880]/30 shadow-xl p-8 pt-20 max-w-md mx-auto rounded-b-[2rem] text-center select-none"
            >
              <div className="flex flex-col gap-6 font-serif text-lg text-[#4E2A12]">
                <button onClick={() => { scrollToSection('parents'); setIsMenuOpen(false); }} className="hover:text-[#C5A880] transition-colors uppercase tracking-widest text-xs font-bold">Our Story</button>
                <button onClick={() => { scrollToSection('timeline'); setIsMenuOpen(false); }} className="hover:text-[#C5A880] transition-colors uppercase tracking-widest text-xs font-bold">Events</button>
                <button onClick={() => { scrollToSection('gallery'); setIsMenuOpen(false); }} className="hover:text-[#C5A880] transition-colors uppercase tracking-widest text-xs font-bold">Gallery</button>
                <button onClick={() => { handleRSVPClick(); setIsMenuOpen(false); }} className="hover:text-[#C5A880] transition-colors uppercase tracking-widest text-xs font-bold">RSVP</button>
                <button onClick={() => { scrollToSection('ceremony'); setIsMenuOpen(false); }} className="hover:text-[#C5A880] transition-colors uppercase tracking-widest text-xs font-bold">Venue</button>
              </div>
            </motion.div>
          )}
        </>
      )}
      {/* Welcome Overlay (Ensures Music Plays on Mobile) */}
      {showOverlay && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
          style={styles.isCustom ? { backgroundColor: styles.colors.bg } : {}}
        >
          <div className="text-center space-y-8 p-12">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex justify-center"
            >
              <LogoIcon className="w-16 h-16" style={styles.isCustom ? { color: styles.colors.primary } : { color: '#D4AF37' }} />
            </motion.div>
            <div className="space-y-2">
              <h2 className={`text-3xl ${styles.font} tracking-widest uppercase`} style={styles.isCustom ? { color: styles.colors.primary } : { color: '#1A1A1A' }}>
                {data.custom_config?.swap_names ? `${data.bride_name} & ${data.groom_name}` : `${data.groom_name} & ${data.bride_name}`}
              </h2>
              <p className="text-xs uppercase tracking-[0.4em] opacity-40">Invitation</p>
            </div>
            <button 
              onClick={handleOpenInvitation}
              className="px-12 py-5 rounded-full font-bold uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-white"
              style={styles.isCustom ? { backgroundColor: styles.colors.secondary } : { backgroundColor: '#D4AF37' }}
            >
              Open Invitation
            </button>
          </div>
        </motion.div>
      )}

      {(styles.showFlowers || showeringFlowers) && <FlowerFall key={flowerKey} />}
      
      {/* Pattern Overlay */}
      {styles.isCustom && styles.pattern !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0 animate-fade-in" 
          style={{ 
            backgroundImage: `url(${getImageUrl(PATTERNS.find(p => p.id === styles.pattern)?.url)})`,
            backgroundRepeat: 'repeat'
          }}
        ></div>
      )}

      {/* Hero Background Image */}
      {styles.heroBgImage && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${getImageUrl(styles.heroBgImage)})`,
            opacity: styles.heroBgOpacity
          }}
        ></div>
      )}

      <div className="relative z-10 flex-grow">
        {layout.map((section, index) => (
          <div key={index} id={`section-${section.type || section}`}>
            {renderSection(section)}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="py-24 text-center opacity-40 relative z-10">
         <a href="/" className="inline-block hover:opacity-80 transition-opacity mb-4">
           <div className="flex items-center justify-center gap-3">
              <LogoIcon className="w-6 h-6 fill-current" />
              <span className="uppercase text-[10px] tracking-[0.5em] font-bold">AuraVows Premium</span>
           </div>
         </a>
         <p className="text-xs uppercase tracking-widest mb-2">© 2026 {data.custom_config?.swap_names ? `${data.bride_name} & ${data.groom_name}` : `${data.groom_name} & ${data.bride_name}`}'s Wedding</p>
         <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-50">
           Powered by <a href="/" className="hover:underline font-bold">AuraVows</a>
         </p>
      </footer>

      {/* Interactive Controls */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[100]">
        {/* Music Player Toggle */}
        {(data.background_music_url || (isWeddingDay && data.wedding_day_music_url)) && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMusic}
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center group overflow-hidden"
            style={styles.isCustom ? { backgroundColor: styles.colors.primary, color: 'white' } : { backgroundColor: '#1A1A1A', color: 'white' }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
               {isPlaying ? <Music className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </motion.div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {[1, 2, 3].map(i => (
                   <motion.div
                     key={i}
                     animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                     className="absolute w-10 h-10 rounded-full border border-white/30"
                   />
                 ))}
              </div>
            )}
          </motion.button>
        )}
      </div>

      {styles.showBottomNav && !showOverlay && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#4E2A12] text-white shadow-[0_-8px_30px_rgba(0,0,0,0.15)] py-4 px-4 z-[99] flex justify-around items-center border-t border-[#C5A880]/20 md:max-w-md md:mx-auto md:rounded-t-3xl">
          {data?.template === 'auravows' ? (
            <>
              <button 
                onClick={() => scrollToSection('parents')}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FAF6F0] hover:bg-white shadow-md transition-all">
                  <Heart className="w-5 h-5 text-[#4E2A12]" />
                </div>
                <span className="text-[9px] font-medium text-[#FAF6F0] opacity-90 group-hover:opacity-100 transition-opacity">Our Story</span>
              </button>

              <button 
                onClick={() => scrollToSection('timeline')}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FAF6F0] hover:bg-white shadow-md transition-all">
                  <Calendar className="w-5 h-5 text-[#4E2A12]" />
                </div>
                <span className="text-[9px] font-medium text-[#FAF6F0] opacity-90 group-hover:opacity-100 transition-opacity">Events</span>
              </button>

              <button 
                onClick={() => scrollToSection('gallery')}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FAF6F0] hover:bg-white shadow-md transition-all">
                  <ImageIcon className="w-5 h-5 text-[#4E2A12]" />
                </div>
                <span className="text-[9px] font-medium text-[#FAF6F0] opacity-90 group-hover:opacity-100 transition-opacity">Gallery</span>
              </button>

              <button 
                onClick={handleRSVPClick}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FAF6F0] hover:bg-white shadow-md transition-all">
                  <Clock className="w-5 h-5 text-[#4E2A12]" />
                </div>
                <span className="text-[9px] font-medium text-[#FAF6F0] opacity-90 group-hover:opacity-100 transition-opacity">RSVP</span>
              </button>

              <button 
                onClick={() => scrollToSection('ceremony')}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FAF6F0] hover:bg-white shadow-md transition-all">
                  <MapPin className="w-5 h-5 text-[#4E2A12]" />
                </div>
                <span className="text-[9px] font-medium text-[#FAF6F0] opacity-90 group-hover:opacity-100 transition-opacity">Venue</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => scrollToSection('parents')}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-white/5 group-hover:bg-[#C5A880]/20 group-hover:border-[#C5A880]/60 transition-all">
                  <Heart className="w-4 h-4 text-[#C5A880] fill-[#C5A880]/10" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#FAF6F0] opacity-80 group-hover:opacity-100 transition-opacity">Story</span>
              </button>

              <button 
                onClick={() => scrollToSection('timeline')}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-white/5 group-hover:bg-[#C5A880]/20 group-hover:border-[#C5A880]/60 transition-all">
                  <Calendar className="w-4 h-4 text-[#C5A880]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#FAF6F0] opacity-80 group-hover:opacity-100 transition-opacity">Events</span>
              </button>

              <button 
                onClick={() => scrollToSection('gallery')}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-white/5 group-hover:bg-[#C5A880]/20 group-hover:border-[#C5A880]/60 transition-all">
                  <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#FAF6F0] opacity-80 group-hover:opacity-100 transition-opacity">Gallery</span>
              </button>

              <button 
                onClick={handleRSVPClick}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-white/5 group-hover:bg-[#C5A880]/20 group-hover:border-[#C5A880]/60 transition-all">
                  <Clock className="w-4 h-4 text-[#C5A880]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#FAF6F0] opacity-80 group-hover:opacity-100 transition-opacity">RSVP</span>
              </button>

              <button 
                onClick={() => scrollToSection('ceremony')}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-white/5 group-hover:bg-[#C5A880]/20 group-hover:border-[#C5A880]/60 transition-all">
                  <MapPin className="w-4 h-4 text-[#C5A880]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-[#FAF6F0] opacity-80 group-hover:opacity-100 transition-opacity">Venue</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
