import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle, XCircle, Info, MessageSquare, Heart, Printer, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface RSVP {
  id: string;
  guest_name: string;
  attending: boolean;
  guest_count: number;
  dietary_preference: string;
  will_attend_reception: boolean;
  message_to_couple: string;
  phone_number: string;
  response_date: string;
}

interface Invitation {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  custom_config?: any;
}

export default function SharedRSVPPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ invitation: Invitation; rsvps: RSVP[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRSVPs();
  }, [token]);

  const fetchRSVPs = async () => {
    try {
      const response = await api.get(`/rsvp/shared/${token}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch RSVPs', err);
      setError('Invalid or expired share link.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-lightGold">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
         <Heart className="w-12 h-12 text-wedding-gold" />
       </motion.div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">{error || 'Data not found'}</p>
      </div>
    </div>
  );

  const { invitation, rsvps } = data;

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending).reduce((sum, r) => sum + r.guest_count, 0),
    responses: rsvps.filter(r => r.attending).length,
    notAttending: rsvps.filter(r => !r.attending).length,
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          .print-footer { display: block !important; }
          main { margin-top: 0 !important; padding: 0 !important; max-width: 100% !important; }
          .bg-white { box-shadow: none !important; border: 1px solid #eee !important; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; margin-bottom: 20px !important; }
          table { width: 100% !important; border: 1px solid #eee !important; }
          th, td { padding: 10px !important; font-size: 10px !important; }
          .print-table { display: block !important; }
          .mobile-cards { display: none !important; }
          .page-break { page-break-after: always; }
        }
        .print-header, .print-footer { display: none; }
      `}} />

      {/* Screen Header */}
      <header className="no-print bg-wedding-dark text-white p-8 md:p-12 shadow-lg text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <Heart className="absolute top-0 left-0 w-32 h-32 -translate-x-10 -translate-y-10" />
            <Heart className="absolute bottom-0 right-0 w-48 h-48 translate-x-10 translate-y-10" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif italic mb-3">
                {invitation.custom_config?.swap_names ? (
                    <>{invitation.bride_name} <span className="text-wedding-lightGold">&</span> {invitation.groom_name}</>
                ) : (
                    <>{invitation.groom_name} <span className="text-wedding-lightGold">&</span> {invitation.bride_name}</>
                )}
            </h1>
            <p className="text-wedding-lightGold uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-6">Guest List Dashboard</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-wedding-lightGold" />
                    <span>{new Date(invitation.wedding_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-wedding-lightGold" />
                    <span>{invitation.venue_name}</span>
                </div>
            </div>
        </div>
      </header>

      {/* Print Header */}
      <div className="print-header text-center py-12 border-b-4 border-double border-wedding-gold/30 mb-8">
        <h2 className="text-4xl font-serif italic text-wedding-dark mb-4">
            {invitation.custom_config?.swap_names ? `${invitation.bride_name} & ${invitation.groom_name}` : `${invitation.groom_name} & ${invitation.bride_name}`}
        </h2>
        <div className="flex justify-center items-center gap-8 text-xs uppercase tracking-widest text-gray-500 font-bold">
            <span>Wedding Guest List</span>
            <span className="w-2 h-2 bg-wedding-gold rounded-full"></span>
            <span>{new Date(invitation.wedding_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            <span className="w-2 h-2 bg-wedding-gold rounded-full"></span>
            <span>{invitation.venue_name}</span>
        </div>
      </div>

      <main className="p-4 md:p-8 max-w-6xl mx-auto -mt-8 relative z-20">
        {/* Actions Bar */}
        <div className="no-print flex justify-end mb-6">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-wedding-dark px-6 py-3 rounded-2xl shadow-md border border-wedding-gold/20 font-bold text-xs uppercase tracking-widest transition-all"
            >
                <Printer className="w-4 h-4" />
                Print Guest List
            </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-wedding-gold/20 flex flex-col items-center transition-transform hover:scale-105">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Total Responses</p>
            <p className="text-3xl font-serif text-wedding-dark">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-wedding-gold/20 flex flex-col items-center transition-transform hover:scale-105">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Guests Attending</p>
            <p className="text-3xl font-serif text-green-600">{stats.attending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-wedding-gold/20 flex flex-col items-center transition-transform hover:scale-105">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Confirmed RSVPs</p>
            <p className="text-3xl font-serif text-blue-600">{stats.responses}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-wedding-gold/20 flex flex-col items-center transition-transform hover:scale-105">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Declined</p>
            <p className="text-3xl font-serif text-red-400">{stats.notAttending}</p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block print-table bg-white rounded-2xl shadow-xl border border-wedding-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-wedding-dark text-wedding-lightGold uppercase text-[10px] font-bold tracking-[0.2em]">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Count</th>
                  <th className="px-6 py-4">Preferences / Message</th>
                  <th className="px-6 py-4 text-right">Response Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-wedding-lightGold/5 transition-colors">
                    <td className="px-6 py-4">
                      {rsvp.attending ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                            <CheckCircle className="w-4 h-4" />
                            <span>ATTENDING</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                            <XCircle className="w-4 h-4" />
                            <span>DECLINED</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-serif text-lg text-wedding-dark">{rsvp.guest_name}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{rsvp.guest_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {rsvp.dietary_preference && (
                          <div className="flex items-start gap-1 text-xs text-wedding-gold">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Diet: {rsvp.dietary_preference}</span>
                          </div>
                        )}
                        {rsvp.message_to_couple && (
                          <div className="flex items-start gap-1 text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                            <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-300" />
                            <span>"{rsvp.message_to_couple}"</span>
                          </div>
                        )}
                        {!rsvp.dietary_preference && !rsvp.message_to_couple && (
                            <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] text-gray-400 font-mono">
                      {new Date(rsvp.response_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden mobile-cards space-y-4">
            {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-wedding-gold/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="font-serif text-xl text-wedding-dark">{rsvp.guest_name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-wedding-lightGold/30 text-wedding-dark px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {rsvp.guest_count} {rsvp.guest_count === 1 ? 'Guest' : 'Guests'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {new Date(rsvp.response_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {rsvp.attending ? (
                            <div className="bg-green-50 text-green-600 p-2 rounded-full">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-400 p-2 rounded-full">
                                <XCircle className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    
                    {(rsvp.dietary_preference || rsvp.message_to_couple) && (
                        <div className="pt-4 border-t border-gray-50 space-y-3">
                            {rsvp.dietary_preference && (
                                <div className="flex items-start gap-2 text-xs text-wedding-gold bg-wedding-lightGold/5 p-2 rounded-xl">
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span>{rsvp.dietary_preference}</span>
                                </div>
                            )}
                            {rsvp.message_to_couple && (
                                <div className="flex items-start gap-2 text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">
                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-200" />
                                    <span>{rsvp.message_to_couple}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {rsvps.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-wedding-gold/20">
            <Heart className="w-12 h-12 text-wedding-gold/20 mx-auto mb-4" />
            <p className="text-gray-400 font-serif italic">Waiting for the first responses...</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="no-print py-16 text-center opacity-70">
         <div className="w-12 h-px bg-wedding-gold/30 mx-auto mb-8"></div>
         <a href="/" className="hover:opacity-85 transition-opacity inline-block">
            <p className="text-[10px] text-wedding-gold uppercase tracking-[0.4em] font-bold">AuraVows Premium</p>
            <p className="text-[8px] text-gray-300 mt-2 uppercase tracking-widest font-bold">Premium RSVP Experience</p>
         </a>
      </footer>

      {/* Print Footer */}
      <div className="print-footer text-center py-12 border-t border-gray-100 mt-20">
         <p className="font-serif italic text-wedding-dark text-lg mb-2">Thank you for sharing our joy!</p>
         <p className="text-[10px] text-wedding-gold uppercase tracking-[0.4em] font-bold">
            {invitation.custom_config?.swap_names ? `${invitation.bride_name} & ${invitation.groom_name}` : `${invitation.groom_name} & ${invitation.bride_name}`}
         </p>
         <p className="text-[8px] text-gray-400 mt-4">Printed on {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
