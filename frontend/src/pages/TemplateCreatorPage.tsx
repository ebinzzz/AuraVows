import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getImageUrl } from '../lib/api';
import { 
  Heart, Save, ArrowLeft, GripVertical, Plus, Trash2, 
  Moon, Star, Cross, Flower2, Palette, Layout as LayoutIcon, 
  ImageIcon, Upload, Type, Bold
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import FlowerFall from '../components/FlowerFall';

const LOGOS = [
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'cross', icon: Cross, label: 'Christian' },
  { id: 'moon', icon: Moon, label: 'Islamic' },
  { id: 'star', icon: Star, label: 'Hindu/Generic' },
  { id: 'om', icon: Flower2, label: 'Hindu Om' },
];

const PATTERNS = [
  { id: 'none', label: 'None', url: '' },
  { id: 'floral-1', label: 'Floral Paper', url: 'https://www.transparenttextures.com/patterns/floral-paper.png' },
  { id: 'floral-2', label: 'Classic Flowers', url: 'https://www.transparenttextures.com/patterns/flowers.png' },
  { id: 'floral-3', label: 'Wild Flowers', url: 'https://www.transparenttextures.com/patterns/wild-flowers.png' },
  { id: 'floral-4', label: 'Light Floral', url: 'https://www.transparenttextures.com/patterns/light-floral.png' },
  { id: 'swirl', label: 'Elegant Swirl', url: 'https://www.transparenttextures.com/patterns/swirl.png' },
  { id: 'damask', label: 'Royal Damask', url: 'https://www.transparenttextures.com/patterns/damask.png' },
];

const SECTION_TYPES = [
  { id: 'quote', label: 'Quote', defaultLabel: 'Bible Verse / Quote' },
  { id: 'hero', label: 'Main Names', defaultLabel: 'Couple Names' },
  { id: 'countdown', label: 'Countdown Timer', defaultLabel: 'Time to Big Day' },
  { id: 'wording', label: 'Invitation Wording', defaultLabel: 'Requesting Presence...' },
  { id: 'parents', label: 'Parents Info', defaultLabel: 'With Blessings of...' },
  { id: 'ceremony', label: 'Ceremony Details', defaultLabel: 'Venue & Time' },
  { id: 'reception', label: 'Reception Details', defaultLabel: 'Dinner & Party' },
  { id: 'timeline', label: 'Event Timeline', defaultLabel: 'Event Schedule' },
  { id: 'gallery', label: 'Photo Gallery', defaultLabel: 'Our Moments' },
  { id: 'message', label: 'Special Message', defaultLabel: 'Note to Guests' },
  { id: 'rsvp', label: 'RSVP Button', defaultLabel: 'Response Section' },
];

export default function TemplateCreatorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Classic');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>({
    colors: {
      bg: '#FFFEF5',
      primary: '#1A1A2E',
      secondary: '#D4AF37',
      text: '#1A1A2E'
    },
    font: 'serif',
    logo: 'heart',
    pattern: 'none',
    heroBgImage: '',
    heroBgOpacity: 0.5,
    silhouetteSize: 120,
    silhouetteOpacity: 0.3,
    layout: [
      { id: '0', type: 'quote', visible: true, bgImage: '', bgOpacity: 0.1 },
      { id: '1', type: 'hero', visible: true, bgImage: '', bgOpacity: 0.1 },
      { id: '1.5', type: 'wording', visible: true, bgImage: '', bgOpacity: 0.1 },
      { id: '2', type: 'parents', visible: true, bgImage: '', bgOpacity: 0.1 },
      { id: '3', type: 'ceremony', visible: true, bgImage: '', bgOpacity: 0.1 },
      { id: '4', type: 'rsvp', visible: true, bgImage: '', bgOpacity: 0.1 },
    ],
    showFlowers: false,
  });

  const [sections, setSections] = useState<any[]>(config.layout || []);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await api.get(`/templates/${id}`);
      const tpl = response.data;
      setName(tpl.name);
      setCategory(tpl.category);
      setConfig(tpl.config);
      setSections(tpl.config.layout || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch template - check if you are logged in');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
        return;
    }

    if (!name) {
        alert('Please name your template');
        return;
    }
    setLoading(true);
    try {
      if (id) {
        await api.put(`/templates/${id}`, {
          name,
          category,
          config: { ...config, layout: sections }
        });
      } else {
        await api.post('/templates/', {
          name,
          category,
          config: { ...config, layout: sections }
        });
      }
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to save template: ' + (err.response?.data?.detail || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const addSection = (type: string) => {
    setSections([...sections, { id: Math.random().toString(36).substr(2, 9), type, visible: true, bgImage: '', bgOpacity: 0.1 }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data.url;
      if (sectionId) {
        updateSection(sectionId, { bgImage: url });
      } else {
        setConfig({ ...config, heroBgImage: url });
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const DEFAULT_SILHOUETTE = '/static/uploads/default_silhouette.png';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-wedding-dark text-white p-6 shadow-xl flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Template Name" 
              className="bg-transparent border-b-2 border-wedding-gold/30 focus:border-wedding-gold outline-none px-2 py-1 font-serif text-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
         </div>
         <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-wedding-gold hover:bg-wedding-mid text-wedding-dark px-8 py-2 rounded-full font-bold uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Template'}
            </button>
         </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Toolbar: Styling */}
        <aside className="lg:col-span-3 bg-white border-r border-gray-200 p-8 overflow-y-auto space-y-10">
          
          <section>
             <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-wedding-gold" />
                <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Color Palette</h2>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {Object.entries(config.colors as Record<string, string>).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key}</label>
                    <div className="flex items-center gap-3">
                       <input 
                         type="color" 
                         className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                         value={value}
                         onChange={(e) => setConfig({...config, colors: {...config.colors, [key]: e.target.value}})}
                       />
                       <code className="text-xs text-gray-500 uppercase">{value}</code>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-wedding-gold" />
                <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Logo / Symbol</h2>
             </div>
             <div className="grid grid-cols-5 gap-2">
                {LOGOS.map((l) => (
                  <button 
                    key={l.id}
                    title={l.label}
                    onClick={() => setConfig({...config, logo: l.id})}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${config.logo === l.id ? 'border-wedding-gold bg-wedding-lightGold' : 'border-gray-50 hover:border-gray-200'}`}
                  >
                    <l.icon className={`w-5 h-5 ${config.logo === l.id ? 'text-wedding-gold' : 'text-gray-300'}`} />
                  </button>
                ))}
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-wedding-gold" />
                <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Background Pattern</h2>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {PATTERNS.map((p) => (
                  <button 
                    key={p.id}
                    onClick={() => setConfig({...config, pattern: p.id})}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${config.pattern === p.id ? 'border-wedding-gold bg-wedding-lightGold' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div 
                      className="w-full h-12 rounded-xl bg-white border border-gray-100"
                      style={{ backgroundImage: p.url ? `url(${getImageUrl(p.url)})` : 'none', opacity: 0.3 }}
                    ></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.pattern === p.id ? 'text-wedding-gold' : 'text-gray-400'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
             </div>
          </section>
          
          <section>
             <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-wedding-gold" />
                <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Hero Background</h2>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image URL</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-wedding-gold outline-none"
                         placeholder="Image URL"
                         value={config.heroBgImage}
                         onChange={(e) => setConfig({...config, heroBgImage: e.target.value})}
                       />
                       <label className="cursor-pointer bg-wedding-gold/10 hover:bg-wedding-gold/20 p-2 rounded-lg transition-colors">
                          <Upload className="w-4 h-4 text-wedding-gold" />
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e)} />
                       </label>
                    </div>
                </div>
                <div className="space-y-1">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opacity</label>
                      <span className="text-[10px] font-bold text-wedding-gold">{(config.heroBgOpacity * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max="1" 
                     step="0.05"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wedding-gold"
                     value={config.heroBgOpacity}
                     onChange={(e) => setConfig({...config, heroBgOpacity: parseFloat(e.target.value)})}
                   />
                </div>
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-wedding-gold" />
                <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Silhouette Styling</h2>
             </div>
             <div className="space-y-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Silhouette Size</label>
                      <span className="text-[10px] font-bold text-wedding-gold">{config.silhouetteSize}px</span>
                   </div>
                   <input 
                     type="range" min="30" max="400" step="10"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wedding-gold"
                     value={config.silhouetteSize || 120}
                     onChange={(e) => setConfig({...config, silhouetteSize: parseInt(e.target.value)})}
                   />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Silhouette Opacity</label>
                      <span className="text-[10px] font-bold text-wedding-gold">{((config.silhouetteOpacity || 0.3) * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wedding-gold"
                     value={config.silhouetteOpacity || 0.3}
                     onChange={(e) => setConfig({...config, silhouetteOpacity: parseFloat(e.target.value)})}
                   />
                </div>
             </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-wedding-gold/10 rounded-lg flex items-center justify-center">
                      <Flower2 className="w-4 h-4 text-wedding-gold" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-wedding-dark">Flower Fall Animation</span>
                </div>
                <button 
                  onClick={() => setConfig({...config, showFlowers: !config.showFlowers})}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${config.showFlowers ? 'bg-wedding-gold' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${config.showFlowers ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
          </section>

        </aside>

        {/* Center Canvas: Live Preview */}
        <section className="lg:col-span-6 bg-gray-100 p-8 overflow-y-auto flex flex-col items-center">
           <div 
             className="w-full max-w-[450px] min-h-[800px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-[3.5rem] overflow-hidden sticky top-0 transform scale-90 origin-top"
             style={{ backgroundColor: config.colors.bg, color: config.colors.text }}
           >
              <div className="relative h-full overflow-y-auto hide-scrollbar pb-20">
                {config.showFlowers && <FlowerFall />}
                
                {/* Pattern Overlay */}
                {config.pattern !== 'none' && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-40" 
                    style={{ 
                      backgroundImage: `url(${getImageUrl(PATTERNS.find(p => p.id === config.pattern)?.url)})`,
                      backgroundRepeat: 'repeat'
                    }}
                  ></div>
                )}

                {/* Hero Background Preview */}
                {config.heroBgImage && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${getImageUrl(config.heroBgImage)})`,
                      opacity: config.heroBgOpacity
                    }}
                  ></div>
                )}

                <div className="relative z-10 text-center px-6">
                    <div className="py-12 flex justify-center">
                       {(() => {
                          const Icon = LOGOS.find(l => l.id === config.logo)?.icon || Heart;
                          return <Icon className="w-8 h-8" style={{ color: config.colors.secondary }} />;
                       })()}
                    </div>

                     {sections.map((s) => {
                      const bgUrl = s.bgImage || (s.type === 'hero' && !config.heroBgImage ? DEFAULT_SILHOUETTE : '');
                      const isDefaultSilhouette = bgUrl.includes('default_silhouette');
                      
                      return (
                      <div 
                        key={s.id} 
                        className="py-10 border-b border-gray-50 last:border-0 relative overflow-hidden"
                      >
                         {/* Section Background Preview */}
                         {bgUrl && (
                            <div 
                              className="absolute inset-0 z-0 bg-contain bg-no-repeat bg-center pointer-events-none"
                              style={{ 
                                backgroundImage: `url(${getImageUrl(bgUrl)})`,
                                opacity: isDefaultSilhouette ? 0.3 : (s.bgOpacity || 0.1),
                                mixBlendMode: isDefaultSilhouette ? 'multiply' : 'normal',
                                backgroundSize: isDefaultSilhouette ? '50%' : 'contain'
                              }}
                            />
                         )}
                         
                         <div className="relative z-10" style={{ fontSize: s.fontSize ? `${s.fontSize}px` : undefined, fontWeight: s.fontWeight || 'normal' }}>
                             {s.type === 'quote' && (
                               <div className="space-y-1">
                                  <p className="italic opacity-70" style={{ fontSize: 'inherit' }}>"The Lord has made everything beautiful in his time"</p>
                                  <p className="text-[7px] uppercase tracking-widest opacity-50">Eccl - 3:11</p>
                               </div>
                             )}
                             {s.type === 'hero' && (
                               <div className="space-y-4">
                                 <p className="uppercase tracking-[0.2em] text-[10px]" style={{ color: config.colors.secondary }}>wedding</p>
                                 <h2 className="font-serif" style={{ fontSize: 'inherit' }}>Elizabeth & Christopher</h2>
                                 <p className="text-[10px] font-bold tracking-widest opacity-60">June 24, 2026</p>
                                 <div className="w-12 h-px mx-auto" style={{ backgroundColor: config.colors.secondary }}></div>
                               </div>
                             )}
                             {s.type === 'countdown' && (
                               <div className="grid grid-cols-4 gap-2 py-4">
                                  {[12, 10, 45, 30].map((v, i) => (
                                    <div key={i} className="text-center">
                                       <div className="text-2xl font-bold font-serif" style={{ color: config.colors.primary }}>{v}</div>
                                       <div className="text-[6px] uppercase opacity-40">Unit</div>
                                    </div>
                                  ))}
                               </div>
                             )}
                             {s.type === 'wording' && (
                               <p className="leading-relaxed italic opacity-70 px-4" style={{ fontSize: 'inherit' }}>
                                  cordially request the honour of your presence with your family on the auspicious occasion of the marriage of our daughter
                               </p>
                             )}
                             {s.type === 'parents' && (
                                <div className="space-y-2">
                                   <p className="text-[8px] uppercase tracking-widest opacity-60">With Blessings of</p>
                                   <p className="font-serif italic" style={{ fontSize: 'inherit' }}>Parents Name</p>
                                </div>
                             )}
                             {s.type === 'ceremony' && (
                                <div className="space-y-2">
                                   <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: config.colors.secondary }}>Ceremony</p>
                                   <p style={{ fontSize: 'inherit' }}>St. Peters Cathedral</p>
                                   <p className="text-[10px] opacity-60">10:30 AM</p>
                                </div>
                             )}
                             {s.type === 'rsvp' && (
                                <div className="pt-4">
                                   <button className="px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: config.colors.secondary }}>
                                      RSVP Now
                                   </button>
                                </div>
                             )}
                             {s.type === 'timeline' && (
                                <div className="space-y-2 py-4">
                                   <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: config.colors.secondary }}>Event Timeline</p>
                                   <div className="space-y-4 opacity-50">
                                      <div className="text-[10px] border-l-2 border-wedding-gold pl-4 py-1 text-left">
                                         <p className="font-bold">Ceremony</p>
                                         <p>10:30 AM</p>
                                      </div>
                                      <div className="text-[10px] border-l-2 border-wedding-gold pl-4 py-1 text-left">
                                         <p className="font-bold">Reception</p>
                                         <p>07:00 PM</p>
                                      </div>
                                   </div>
                                </div>
                             )}
                             {s.type === 'gallery' && (
                                <div className="space-y-2 py-4">
                                   <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: config.colors.secondary }}>Photo Gallery</p>
                                   <div className="grid grid-cols-3 gap-1 opacity-30">
                                      <div className="aspect-square bg-gray-200 rounded-lg"></div>
                                      <div className="aspect-square bg-gray-200 rounded-lg"></div>
                                      <div className="aspect-square bg-gray-200 rounded-lg"></div>
                                   </div>
                                </div>
                             )}
                             {(s.type === 'message' || s.type === 'reception') && (
                                <p className="italic" style={{ fontSize: 'inherit' }}>Section: {s.type}</p>
                             )}
                         </div>
                      </div>
                      );
                    })}
                 </div>
              </div>
           </div>
        </section>

        {/* Right Toolbar: Layout */}
        <aside className="lg:col-span-3 bg-white border-l border-gray-200 p-8 overflow-y-auto space-y-8">
           <div className="flex items-center gap-2 mb-2">
              <LayoutIcon className="w-5 h-5 text-wedding-gold" />
              <h2 className="font-bold uppercase text-xs tracking-widest text-wedding-dark">Page Sections</h2>
           </div>
           <p className="text-[10px] text-gray-400 italic mb-6">Drag to reorder sections of your invitation</p>

           <div className="space-y-6">
             <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
                {sections.map((section) => (
                   <Reorder.Item 
                    key={section.id} 
                    value={section}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <GripVertical className="text-gray-300 w-5 h-5" />
                           <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-wedding-dark">
                                 {SECTION_TYPES.find(t => t.id === section.type)?.label}
                              </p>
                              <p className="text-[10px] text-gray-400 italic">
                                 {SECTION_TYPES.find(t => t.id === section.type)?.defaultLabel}
                              </p>
                           </div>
                        </div>
                        <button 
                          onClick={() => removeSection(section.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Typography Controls */}
                    <div className="pl-9 pr-2 py-3 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <Type className="w-3 h-3 text-gray-400" />
                                <input 
                                    type="range" min="10" max="80" step="1"
                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wedding-gold"
                                    value={section.fontSize || 18}
                                    onChange={(e) => updateSection(section.id, { fontSize: parseInt(e.target.value) })}
                                />
                                <span className="text-[9px] font-bold text-wedding-gold w-6 text-right">{section.fontSize || 18}px</span>
                            </div>
                            <button 
                                onClick={() => updateSection(section.id, { fontWeight: section.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                className={`p-1.5 rounded-lg border transition-all ${section.fontWeight === 'bold' ? 'bg-wedding-gold border-wedding-gold text-white' : 'bg-white border-gray-200 text-gray-400 hover:border-wedding-gold'}`}
                                title="Toggle Bold"
                            >
                                <Bold className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Section BG Controls */}
                    <div className="pl-9 pr-2 py-3 bg-gray-50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                            <input 
                                type="text"
                                placeholder="Section Background URL"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-wedding-gold"
                                value={section.bgImage || ''}
                                onChange={(e) => updateSection(section.id, { bgImage: e.target.value })}
                            />
                            <label className="cursor-pointer p-1.5 bg-white border border-gray-200 rounded-lg hover:border-wedding-gold transition-colors">
                                <Upload className="w-3 h-3 text-wedding-gold" />
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, section.id)} />
                            </label>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Opacity</span>
                            <input 
                                type="range" min="0" max="1" step="0.05"
                                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wedding-gold"
                                value={section.bgOpacity || 0.1}
                                onChange={(e) => updateSection(section.id, { bgOpacity: parseFloat(e.target.value) })}
                            />
                            <span className="text-[9px] font-bold text-wedding-gold">{((section.bgOpacity || 0.1) * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                  </Reorder.Item>
                ))}
             </Reorder.Group>

             <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Add New Section</p>
                <div className="grid grid-cols-2 gap-2">
                   {SECTION_TYPES.filter(t => !['hero', 'rsvp'].includes(t.id)).map((type) => (
                     <button 
                       key={type.id}
                       onClick={() => addSection(type.id)}
                       className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-[10px] font-bold text-wedding-dark hover:bg-wedding-lightGold hover:border-wedding-gold transition-all flex items-center gap-2"
                     >
                       <Plus className="w-3 h-3 text-wedding-gold" />
                       {type.label}
                     </button>
                   ))}
                </div>
             </div>
           </div>
        </aside>

      </main>
    </div>
  );
}
