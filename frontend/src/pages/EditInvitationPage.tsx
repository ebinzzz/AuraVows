import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Save, ArrowLeft, Heart, Calendar, Info, Globe, Shield, Activity, Upload, Image as ImageIcon, Trash2, Music, Plus, X, Clock, MessageSquare, Sparkles } from 'lucide-react';

export default function EditInvitationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    invitation_id: '',
    bride_name: '',
    groom_name: '',
    bride_parents: '',
    bride_family: '',
    groom_parents: '',
    groom_family: '',
    wedding_date: '',
    wedding_time: '',
    venue_name: '',
    venue_address: '',
    venue_map_url: '',
    venue_phone: '',
    compliments_title: '',
    compliments_names: '',
    reception_date: '',
    invitation_link: '',
    qr_code_data: '',
    is_active: true,
    template: 'royal',
    hero_bg_image: '',
    hero_bg_opacity: 0.5,
    custom_config: {} as any,
    background_music_url: '',
    wedding_day_music_url: '',
    live_stream_url: '',
    gallery_photos: [] as string[],
    event_timeline: [] as any[],
    invitation_wording: '',
    invitation_quote: '',
    opening_verse: '',
    opening_verse_ref: '',
    hero_subtitle_1: '',
    hero_subtitle_2: '',
    after_marriage_photos: [] as string[],
    after_marriage_text: '',
    after_marriage_bg_opacity: 0.4
  });
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    try {
      const response = await api.get('/templates/');
      setCustomTemplates(response.data);
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, [id]);

  const fetchInvitation = async () => {
    try {
      const response = await api.get(`/invitations/${id}`);
      const data = response.data;
      setFormData({
        invitation_id: data.invitation_id || '',
        bride_name: data.bride_name || '',
        groom_name: data.groom_name || '',
        bride_parents: data.bride_parents || '',
        bride_family: data.bride_family || '',
        groom_parents: data.groom_parents || '',
        groom_family: data.groom_family || '',
        wedding_date: data.wedding_date || '',
        wedding_time: data.wedding_time || '',
        venue_name: data.venue_name || '',
        venue_address: data.venue_address || '',
        venue_map_url: data.venue_map_url || '',
        venue_phone: data.venue_phone || '',
        compliments_title: data.compliments_title || '',
        compliments_names: data.compliments_names || '',
        reception_date: data.reception_date || '',
        invitation_link: data.invitation_link || '',
        qr_code_data: data.qr_code_data || '',
        is_active: data.is_active ?? true,
        template: data.template || 'royal',
        hero_bg_image: data.hero_bg_image || '',
        hero_bg_opacity: data.hero_bg_opacity ?? 0.5,
        custom_config: data.custom_config || {},
        background_music_url: data.background_music_url || '',
        wedding_day_music_url: data.wedding_day_music_url || '',
        live_stream_url: data.live_stream_url || '',
        gallery_photos: data.gallery_photos || [],
        event_timeline: data.event_timeline || [],
        invitation_wording: data.invitation_wording || '',
        invitation_quote: data.invitation_quote || '',
        opening_verse: data.opening_verse || '',
        opening_verse_ref: data.opening_verse_ref || '',
        hero_subtitle_1: data.hero_subtitle_1 || '',
        hero_subtitle_2: data.hero_subtitle_2 || '',
        after_marriage_photos: data.after_marriage_photos || [],
        after_marriage_text: data.after_marriage_text || '',
        after_marriage_bg_opacity: data.after_marriage_bg_opacity ?? 0.4
      });
    } catch (err) {
      console.error('Failed to fetch invitation', err);
      alert('Failed to load invitation data');
      navigate('/admin');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
      );

      await api.put(`/invitations/${id}`, {
        ...cleanedData,
        is_active: formData.is_active
      });
      navigate('/admin');
    } catch (err) {
      console.error('Failed to update invitation', err);
      alert('Failed to update invitation. Check logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/invitations/${id}`);
        navigate('/admin');
      } catch (err) {
        console.error('Failed to delete invitation', err);
        alert('Failed to delete invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, hero_bg_image: response.data.url });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'background_music_url' | 'wedding_day_music_url' = 'background_music_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, [field]: response.data.url });
    } catch (err) {
      console.error(err);
      alert('Music upload failed');
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-wedding-secondary/20 border-t-wedding-secondary"></div>
          <p className="text-wedding-primary font-bold uppercase tracking-widest text-xs animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-bg flex flex-col font-sans selection:bg-wedding-primary/10">
      <header className="bg-wedding-primary text-white py-6 px-8 shadow-2xl sticky top-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin')} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-wedding-secondary transition-all transform hover:-translate-x-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-4 bg-white/95 px-4 py-2 rounded-2xl">
              <img src="/logo.png" alt="AuraVows Logo" className="h-8 w-auto object-contain" />
              <div className="h-6 w-px bg-wedding-primary/20"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-wedding-primary">Update Invitation</span>
            </div>
          </div>
          <button 
            form="invite-form"
            type="submit"
            disabled={loading}
            className="group flex items-center gap-3 bg-wedding-secondary hover:bg-wedding-mid text-wedding-primary px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-wedding-secondary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-wedding-primary/30 border-t-wedding-primary rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 lg:p-12">
        <form id="invite-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-12 pb-24">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-10">
              <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
                <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-wedding-primary fill-wedding-primary/10" />
                  </div>
                  <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Couple Details</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bride's Full Name *</label>
                      <input name="bride_name" required className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.bride_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bride's Parents</label>
                      <input name="bride_parents" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.bride_parents} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bride's Family Name</label>
                      <input name="bride_family" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.bride_family} onChange={handleChange} placeholder="e.g. Kuzhuppilly Family" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Groom's Full Name *</label>
                      <input name="groom_name" required className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.groom_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Groom's Parents</label>
                      <input name="groom_parents" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.groom_parents} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Groom's Family Name</label>
                      <input name="groom_family" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.groom_family} onChange={handleChange} placeholder="e.g. Puthenpurayil Family" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-8 flex items-center justify-between bg-gray-50/50">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-wedding-dark uppercase tracking-wider">Swap Display Order</h4>
                    <p className="text-[10px] text-gray-400 italic">Show Bride's name first instead of Groom's name</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const currentConfig = formData.custom_config || {};
                      setFormData(prev => ({
                        ...prev,
                        custom_config: {
                          ...currentConfig,
                          swap_names: !currentConfig.swap_names
                        }
                      }));
                    }}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.custom_config?.swap_names ? 'bg-wedding-secondary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.custom_config?.swap_names ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
                <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-wedding-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Event Information</h2>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wedding Date *</label>
                      <input type="date" name="wedding_date" required className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.wedding_date} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ceremony Time *</label>
                      <input name="wedding_time" required className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.wedding_time} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Venue Name *</label>
                      <input name="venue_name" required className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.venue_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Venue Phone</label>
                      <input name="venue_phone" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.venue_phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Venue Address *</label>
                    <textarea name="venue_address" required rows={3} className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium resize-none" value={formData.venue_address} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Google Maps Location URL
                    </label>
                    <input name="venue_map_url" className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" value={formData.venue_map_url} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      Live Stream URL (Optional)
                    </label>
                    <input 
                      name="live_stream_url" 
                      placeholder="https://youtube.com/live/..."
                      className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                      value={formData.live_stream_url || ''} 
                      onChange={handleChange} 
                    />
                    <p className="text-[10px] text-gray-400 italic">This will show a "Watch Live" button on your wedding day!</p>
                  </div>
                </div>
              </section>

              <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                <h2 className="text-xl font-bold text-wedding-dark border-b border-wedding-gold/20 pb-2">Family & Compliments</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-wedding-dark mb-1 uppercase tracking-wider">Compliments Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wedding-gold focus:border-transparent outline-none"
                      value={formData.compliments_title}
                      onChange={(e) => setFormData({ ...formData, compliments_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wedding-dark mb-1 uppercase tracking-wider">Family Names</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wedding-gold focus:border-transparent outline-none h-24"
                      value={formData.compliments_names}
                      onChange={(e) => setFormData({ ...formData, compliments_names: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Invitation Matter */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-wedding-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Invitation Wording & Quotes</h2>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Main Wording (Matter)</label>
                    <textarea 
                      name="invitation_wording" 
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium resize-none" 
                      value={formData.invitation_wording} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Special Quote / Closing Verse</label>
                    <textarea 
                      name="invitation_quote" 
                      rows={2}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium resize-none" 
                      value={formData.invitation_quote} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Section: Opening Verse & Header Text */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-wedding-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Header Text & Opening Verse</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Opening Verse / Quote</label>
                      <input 
                        name="opening_verse" 
                        placeholder="The Lord has made..."
                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                        value={formData.opening_verse} onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Verse Reference</label>
                      <input 
                        name="opening_verse_ref" 
                        placeholder="Eccl - 3:11"
                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                        value={formData.opening_verse_ref} onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hero Subtitle 1 (Top)</label>
                    <input 
                      name="hero_subtitle_1" 
                      placeholder="Together with our families"
                      className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                      value={formData.hero_subtitle_1} onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hero Subtitle 2 (Main Invitation)</label>
                    <textarea 
                      name="hero_subtitle_2" 
                      rows={2}
                      placeholder="We extend a warm invitation..."
                      className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium resize-none" 
                      value={formData.hero_subtitle_2} onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Section: Template Selection */}
              <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50">
                <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-wedding-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Choose Theme / Template</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'auravows', name: 'AuraVows Premium', color: 'bg-[#4E2A12]', desc: 'Copper Gold & Floral with Sticky Navigation Bar' },
                    { id: 'royal', name: 'Royal Classic', color: 'bg-[#4A0E0E]', desc: 'Deep Maroon & Gold' },
                    { id: 'modern', name: 'Modern Sage', color: 'bg-[#7C8E7B]', desc: 'Soft Sage & Minimal' },
                    { id: 'floral', name: 'Floral Rose', color: 'bg-[#C08497]', desc: 'Dusty Rose & Elegant' },
                  ].map((tpl) => (
                    <div 
                      key={tpl.id}
                      onClick={() => setFormData(prev => ({ ...prev, template: tpl.id }))}
                      className={`cursor-pointer group p-4 rounded-2xl border-2 transition-all ${formData.template === tpl.id ? 'border-wedding-secondary bg-wedding-accent/30' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className={`h-24 w-full rounded-xl mb-4 ${tpl.color} relative overflow-hidden flex items-center justify-center`}>
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/floral-paper.png')]"></div>
                         <Heart className="text-white w-8 h-8 opacity-40 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-bold text-wedding-dark text-sm mb-1">{tpl.name}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{tpl.desc}</p>
                    </div>
                  ))}

                  {/* Custom Templates */}
                  {customTemplates.map((tpl) => (
                    <div 
                      key={tpl.id}
                      onClick={() => setFormData(prev => ({ ...prev, template: tpl.id }))}
                      className={`cursor-pointer group p-4 rounded-2xl border-2 transition-all ${formData.template === tpl.id ? 'border-wedding-secondary bg-wedding-accent/30' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div 
                        className="h-24 w-full rounded-xl mb-4 relative overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: tpl.config.colors.secondary }}
                      >
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/floral-paper.png')]"></div>
                         <Globe className="text-white w-8 h-8 opacity-40 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-bold text-wedding-dark text-sm mb-1 truncate">{tpl.name}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{tpl.category || 'Custom'}</p>
                    </div>
                  ))}
                </div>
                </section>

                {/* Section: Design Customization */}
                <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                  <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-wedding-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Background Customization</h2>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hero Background Image</label>
                      <div className="flex gap-4">
                        <input 
                          name="hero_bg_image" 
                          placeholder="Image URL"
                          className="flex-1 px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                          value={formData.hero_bg_image} 
                          onChange={handleChange} 
                        />
                        <label className="cursor-pointer bg-wedding-primary text-white p-4 rounded-2xl hover:bg-wedding-mid transition-all flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                          <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hero Image Opacity</label>
                        <span className="text-xs font-bold text-wedding-primary">{(formData.hero_bg_opacity * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        name="hero_bg_opacity"
                        min="0" 
                        max="1" 
                        step="0.05"
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-wedding-primary"
                        value={formData.hero_bg_opacity}
                        onChange={(e) => setFormData({...formData, hero_bg_opacity: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Background Music */}
                <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                  <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                      <Music className="w-5 h-5 text-wedding-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Background Music</h2>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Standard Invitation Music</label>
                      <div className="flex gap-4">
                        <input 
                          name="background_music_url" 
                          placeholder="Standard Song URL"
                          className="flex-1 px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                          value={formData.background_music_url} 
                          onChange={handleChange} 
                        />
                        <label className="cursor-pointer bg-wedding-primary text-white p-4 rounded-2xl hover:bg-wedding-mid transition-all flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                          <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleMusicUpload(e, 'background_music_url')} />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wedding Day Special Song (Plays on the actual day)</label>
                      <div className="flex gap-4">
                        <input 
                          name="wedding_day_music_url" 
                          placeholder="Celebration Song URL"
                          className="flex-1 px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium" 
                          value={formData.wedding_day_music_url || ''} 
                          onChange={handleChange} 
                        />
                        <label className="cursor-pointer bg-wedding-secondary text-wedding-primary p-4 rounded-2xl hover:bg-wedding-mid transition-all flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                          <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleMusicUpload(e, 'wedding_day_music_url')} />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">This song will automatically replace the standard one on your wedding day!</p>
                    </div>
                  </div>
                </section>

                {/* Section: Event Timeline */}
                <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                  <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-wedding-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Event Timeline</h2>
                  </div>
                  <div className="p-8 space-y-6">
                    {formData.event_timeline.map((event, index) => (
                      <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newTimeline = [...formData.event_timeline];
                            newTimeline.splice(index, 1);
                            setFormData({...formData, event_timeline: newTimeline});
                          }}
                          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            placeholder="Event Name (e.g. Mehendi)"
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                            value={event.name}
                            onChange={(e) => {
                              const newTimeline = [...formData.event_timeline];
                              newTimeline[index].name = e.target.value;
                              setFormData({...formData, event_timeline: newTimeline});
                            }}
                          />
                          <input 
                            placeholder="Date & Time"
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                            value={event.time}
                            onChange={(e) => {
                              const newTimeline = [...formData.event_timeline];
                              newTimeline[index].time = e.target.value;
                              setFormData({...formData, event_timeline: newTimeline});
                            }}
                          />
                          <input 
                            placeholder="Venue"
                            className="md:col-span-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
                            value={event.venue}
                            onChange={(e) => {
                              const newTimeline = [...formData.event_timeline];
                              newTimeline[index].venue = e.target.value;
                              setFormData({...formData, event_timeline: newTimeline});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, event_timeline: [...formData.event_timeline, {name: '', time: '', venue: ''}]})}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-wedding-primary hover:border-wedding-primary transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      Add Event to Timeline
                    </button>
                  </div>
                </section>

                {/* Section: Photo Gallery */}
                <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                  <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-wedding-primary/5 rounded-2xl flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-wedding-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">Photo Gallery</h2>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.gallery_photos.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100">
                          <img src={url} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              const newPhotos = [...formData.gallery_photos];
                              newPhotos.splice(index, 1);
                              setFormData({...formData, gallery_photos: newPhotos});
                            }}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-wedding-primary group transition-all">
                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-wedding-primary transition-all" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-wedding-primary uppercase tracking-tighter">Add Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const uploadData = new FormData();
                            uploadData.append('file', file);
                            try {
                              const response = await api.post('/upload', uploadData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              setFormData({ ...formData, gallery_photos: [...formData.gallery_photos, response.data.url] });
                            } catch (err) {
                              alert('Upload failed');
                            }
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                </section>

                {/* Section: After Marriage Content */}
                <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50 mt-10">
                  <div className="bg-gradient-to-r from-wedding-accent to-white p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-wedding-secondary/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-wedding-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-wedding-primary uppercase tracking-wider">After Marriage Content</h2>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Shows automatically after the wedding date passes</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => window.open(`/invite/${id}/memories`, '_blank')}
                      className="px-4 py-2 bg-wedding-primary/5 hover:bg-wedding-primary/10 text-wedding-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-wedding-primary/10"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Preview Page
                    </button>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">After Marriage Message (Matter)</label>
                      <textarea 
                        name="after_marriage_text" 
                        rows={3}
                        placeholder="Thank you for being part of our special day..."
                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-wedding-secondary focus:ring-0 outline-none transition-all text-sm font-medium resize-none" 
                        value={formData.after_marriage_text} 
                        onChange={handleChange} 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wedding Photos Collage (Hero Background)</label>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-wedding-primary uppercase tracking-widest">Opacity: {Math.round((formData.after_marriage_bg_opacity || 0.4) * 100)}%</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={formData.after_marriage_bg_opacity || 0.4}
                            onChange={(e) => setFormData({ ...formData, after_marriage_bg_opacity: parseFloat(e.target.value) })}
                            className="w-24 h-1.5 bg-wedding-primary/20 rounded-lg appearance-none cursor-pointer accent-wedding-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.after_marriage_photos.map((url, index) => (
                          <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100">
                            <img src={url} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => {
                                const newPhotos = [...formData.after_marriage_photos];
                                newPhotos.splice(index, 1);
                                setFormData({...formData, after_marriage_photos: newPhotos});
                              }}
                              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-wedding-primary group transition-all">
                          <Upload className="w-6 h-6 text-gray-300 group-hover:text-wedding-primary transition-all" />
                          <span className="text-[10px] font-bold text-gray-400 group-hover:text-wedding-primary uppercase tracking-tighter text-center">Add Marriage Photo</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const uploadData = new FormData();
                              uploadData.append('file', file);
                              try {
                                const response = await api.post('/upload', uploadData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                setFormData({ ...formData, after_marriage_photos: [...formData.after_marriage_photos, response.data.url] });
                              } catch (err) {
                                alert('Upload failed');
                              }
                            }} 
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Upload 4 or more photos to create a beautiful collage background for the hero section.</p>
                    </div>
                  </div>
                </section>
              </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-wedding-primary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-secondary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-wedding-secondary" />
                    <h3 className="text-lg font-bold">Status & Security</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <Activity className={`w-4 h-4 ${formData.is_active ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest">Active Status</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.is_active ? 'bg-wedding-secondary' : 'bg-white/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.is_active ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1">Invitation Link</label>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                        <p className="text-xs break-all font-mono text-white/60 leading-relaxed italic group-hover:text-wedding-secondary transition-colors">
                          {formData.invitation_link}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Invitation Permanently
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-wedding-secondary/10 rounded-xl flex items-center justify-center">
                    <Info className="w-4 h-4 text-wedding-secondary" />
                  </div>
                  <h3 className="font-bold text-wedding-dark uppercase tracking-wider text-sm">Update Tips</h3>
                </div>
                <ul className="space-y-4 text-xs text-wedding-gray leading-relaxed italic">
                  <li>Updating the venue will immediately reflect for all guests.</li>
                  <li>Toggling status to 'Inactive' will block access to the invitation page.</li>
                </ul>
              </div>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
