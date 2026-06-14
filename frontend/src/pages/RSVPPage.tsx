import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Heart, Check, Users, Utensils, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RSVPPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<'not_found' | 'inactive' | null>(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    attending: true,
    guest_count: 1,
    dietary_preference: '',
    will_attend_reception: true,
    message_to_couple: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await api.get(`/invitations/${id}`);
        if (response.data.is_active === false) {
          setError('inactive');
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setError('inactive');
        } else {
          setError('not_found');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchInvitation();
  }, [id]);

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFEF5]">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-wedding-gold/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-2 border-wedding-gold rounded-full animate-spin"></div>
          <Heart className="w-8 h-8 text-wedding-gold animate-pulse fill-wedding-gold/10" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-wedding-gold font-bold animate-pulse">Loading Magic...</p>
      </div>
    );
  }

  if (error === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF5] px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white shadow-2xl border border-wedding-gold/20 flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="AuraVows Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="w-12 h-px bg-wedding-gold/30 mx-auto"></div>
          <h2 className="text-3xl font-serif text-wedding-dark">Invitation Closed</h2>
          <p className="text-wedding-gray italic leading-relaxed">
            This invitation is currently inactive or the event has passed.
            Please contact the family directly for any inquiries.
          </p>
          <div className="flex justify-center gap-4 pt-6 border-t border-gray-100 w-full">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-wedding-gold hover:text-wedding-dark transition-all flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Follow us on Instagram</span>
            </a>
          </div>
          <div className="w-12 h-px bg-wedding-gold/30 mx-auto"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-wedding-gold font-bold">Forever & Always</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalData = {
        ...formData,
        guest_name: formData.guest_name.trim() || 'Anonymous'
      };
      await api.post(`/rsvp/${id}`, finalData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit RSVP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wedding-lightGray flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-wedding-gold/10 my-4"
          >
            <div className="bg-wedding-dark p-6 md:p-10 text-center relative">
               <button 
                 onClick={() => navigate(`/invite/${id}`)}
                 className="absolute top-6 left-6 text-wedding-lightGold/60 hover:text-white transition-colors"
               >
                 <ArrowLeft className="w-4 h-4" />
               </button>
               <div className="bg-wedding-gold w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Heart className="text-white w-5 h-5 fill-current" />
               </div>
               <h1 className="text-xl md:text-2xl font-serif text-white mb-1">Kindly Respond</h1>
               <p className="text-wedding-lightGold font-light italic text-xs md:text-sm px-4">Your presence would mean the world to us</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-wedding-dark uppercase tracking-[0.2em] mb-2">Full Name (Optional)</label>
                  <input 
                    className="w-full bg-gray-50 border-b-2 border-gray-100 px-0 py-2 focus:border-wedding-gold outline-none transition-all text-base font-serif"
                    placeholder="Enter your name (or leave for Anonymous)"
                    value={formData.guest_name}
                    onChange={e => setFormData({...formData, guest_name: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                   <label className="block text-[10px] font-bold text-wedding-dark uppercase tracking-[0.2em] mb-3">Will you be attending?</label>
                   <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, attending: true})}
                        className={`w-full py-3 rounded-xl border-2 transition-all font-bold uppercase text-[9px] md:text-[10px] tracking-widest ${formData.attending ? 'bg-wedding-gold border-wedding-gold text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
                      >
                        Accept with pleasure
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, attending: false})}
                        className={`w-full py-3 rounded-xl border-2 transition-all font-bold uppercase text-[9px] md:text-[10px] tracking-widest ${!formData.attending ? 'bg-wedding-dark border-wedding-dark text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
                      >
                        Decline with regret
                      </button>
                   </div>
                </div>

                {formData.attending && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
                  >
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-wedding-dark uppercase tracking-[0.2em] mb-2">
                        <Users className="w-3.5 h-3.5 text-wedding-gold" />
                        Guests Count
                      </label>
                      <select 
                        className="w-full bg-gray-50 border-b-2 border-gray-100 py-2 outline-none focus:border-wedding-gold transition-all text-sm"
                        value={formData.guest_count}
                        onChange={e => setFormData({...formData, guest_count: parseInt(e.target.value)})}
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-wedding-dark uppercase tracking-[0.2em] mb-2">
                        <Utensils className="w-3.5 h-3.5 text-wedding-gold" />
                        Dietary
                      </label>
                      <input 
                        className="w-full bg-gray-50 border-b-2 border-gray-100 py-2 outline-none focus:border-wedding-gold transition-all text-sm"
                        placeholder="e.g. Veg / Non-Veg"
                        value={formData.dietary_preference}
                        onChange={e => setFormData({...formData, dietary_preference: e.target.value})}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-wedding-dark uppercase tracking-[0.2em] mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-wedding-gold" />
                    Message
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-wedding-gold transition-all text-sm"
                    placeholder="Wishes..."
                    value={formData.message_to_couple}
                    onChange={e => setFormData({...formData, message_to_couple: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-wedding-dark text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? 'Sending...' : 'Send Response'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-16 rounded-[3rem] shadow-2xl text-center max-w-lg border border-wedding-gold/10"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
               <Check className="text-white w-10 h-10" />
            </div>
            <h2 className="text-4xl font-serif text-wedding-dark mb-4">Thank You!</h2>
            <p className="text-wedding-gray leading-relaxed mb-10 italic font-serif">
              Your response has been received. {formData.attending ? "We can't wait to see you!" : "You will be missed."}
            </p>
            <button 
               onClick={() => navigate(`/invite/${id}`)}
               className="text-wedding-gold font-bold uppercase tracking-widest text-xs border-b-2 border-wedding-gold pb-1 hover:text-wedding-mid hover:border-wedding-mid transition-all"
            >
              Return Invitation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
