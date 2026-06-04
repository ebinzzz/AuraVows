import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle, XCircle, Info, MessageSquare, LogOut, ArrowLeft, Copy, Check, Phone, Printer, Heart, Users } from 'lucide-react';

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

export default function ClientDashboard() {
  const { id } = useParams<{ id: string }>();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchRSVPs();
    fetchInvitation();
  }, [id]);

  const checkUser = async () => {
    try {
      const response = await api.get('/users/me');
      setIsAdmin(response.data.role === 'admin');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRSVPs = async () => {
    try {
      const response = await api.get(`/rsvp/${id}/list`);
      setRsvps(response.data);
    } catch (err) {
      console.error('Failed to fetch RSVPs', err);
    }
  };

  const fetchInvitation = async () => {
    try {
      const response = await api.get(`/invitations/${id}`);
      setInvitation(response.data);
    } catch (err) {
      console.error('Failed to fetch invitation', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!invitation?.share_token) return;
    const link = `${window.location.origin}/shared/${invitation.share_token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending).reduce((sum, r) => sum + r.guest_count, 0),
    responses: rsvps.filter(r => r.attending).length,
    notAttending: rsvps.filter(r => !r.attending).length,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          .print-footer { display: block !important; }
          body { background: white !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; margin-bottom: 30px !important; }
          .bg-white { border: 1px solid #eee !important; box-shadow: none !important; }
          .print-table { display: block !important; }
          .mobile-cards { display: none !important; }
          th, td { font-size: 10px !important; padding: 8px !important; }
        }
        .print-header, .print-footer { display: none; }
      `}} />

      {/* Screen Header */}
      <header className="no-print bg-wedding-dark text-white p-4 md:p-6 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8">
            <div className="flex items-center gap-4">
            {isAdmin && (
                <button onClick={() => navigate('/admin')} className="text-wedding-lightGold hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                </button>
            )}
            <div>
                <h1 
                  onClick={() => navigate('/')}
                  className="cursor-pointer text-lg md:text-xl font-bold uppercase tracking-widest leading-none mb-1 hover:text-wedding-lightGold transition-colors"
                >
                  AuraVows Tracker
                </h1>
                <p className="text-[8px] text-wedding-lightGold/60 uppercase tracking-[0.2em] font-bold">Premium RSVP Management</p>
            </div>
            </div>
            <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-wedding-lightGold hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-white/10"
            >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
            </button>
        </div>
      </header>

      {/* Print Header */}
      {invitation && (
        <div className="print-header text-center py-10 border-b-2 border-wedding-gold/20 mb-10">
            <h2 className="text-3xl font-serif italic text-wedding-dark mb-2">
                {invitation.custom_config?.swap_names ? `${invitation.bride_name} & ${invitation.groom_name}` : `${invitation.groom_name} & ${invitation.bride_name}`}
            </h2>
            <div className="flex justify-center items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                <span>Guest List Report</span>
                <span className="w-1.5 h-1.5 bg-wedding-gold rounded-full"></span>
                <span>{new Date(invitation.wedding_date).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 bg-wedding-gold rounded-full"></span>
                <span>{invitation.venue_name}</span>
            </div>
        </div>
      )}

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-wedding-dark mb-2">Guest List Control</h2>
            <p className="text-wedding-gray font-medium">Real-time RSVP tracking for {invitation ? (invitation.custom_config?.swap_names ? `${invitation.bride_name} & ${invitation.groom_name}` : `${invitation.groom_name} & ${invitation.bride_name}`) : id}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Share Link Card */}
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-wedding-gold/20 flex items-center gap-4 flex-1 lg:min-w-[400px]">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-wedding-gold uppercase tracking-wider mb-1">Shareable Guest View</p>
                    <div className="truncate text-xs text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {invitation?.share_token ? `${window.location.origin}/shared/${invitation.share_token}` : 'Generating...'}
                    </div>
                </div>
                <button 
                    onClick={copyLink}
                    className="bg-wedding-dark text-white p-3 rounded-xl hover:bg-black transition-all flex items-center justify-center flex-shrink-0"
                    title="Copy Share Link"
                >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>

            <button 
                onClick={handlePrint}
                className="bg-wedding-gold hover:bg-wedding-mid text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-wedding-gold/20 transition-all flex items-center justify-center gap-3"
            >
                <Printer className="w-5 h-5" />
                Print List
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Total Responses', value: stats.total, color: 'wedding-gold', icon: <Users /> },
            { label: 'Total Guests', value: stats.attending, color: 'green-500', icon: <CheckCircle /> },
            { label: 'Confirmed RSVPs', value: stats.responses, color: 'blue-500', icon: <Check /> },
            { label: 'Declined', value: stats.notAttending, color: 'red-400', icon: <XCircle /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-12 translate-x-12 bg-${stat.color} opacity-5 rounded-full group-hover:scale-125 transition-transform`}></div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest relative z-10">{stat.label}</p>
                <p className={`text-4xl font-serif text-wedding-dark relative z-10`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-wedding-gold/20 border-t-wedding-gold"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-wedding-gold">Syncing Guest List...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden md:block print-table bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-wedding-dark text-wedding-lightGold uppercase text-[10px] font-bold tracking-[0.2em]">
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6">Guest Details</th>
                            <th className="px-8 py-6">Count</th>
                            <th className="px-8 py-6">Preferences & Message</th>
                            <th className="px-8 py-6 text-right">Submitted</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-8 py-6">
                            {rsvp.attending ? (
                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1 rounded-full">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>ATTENDING</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-400 font-bold text-xs bg-red-50 w-fit px-3 py-1 rounded-full">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>DECLINED</span>
                                </div>
                            )}
                            </td>
                            <td className="px-8 py-6">
                                <div className="font-serif text-xl text-wedding-dark mb-1">{rsvp.guest_name}</div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 group-hover:text-wedding-gold transition-colors">
                                    <Phone className="w-3 h-3" />
                                    <span className="font-mono tracking-widest">{rsvp.phone_number || 'N/A'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-wedding-dark font-bold">
                                    {rsvp.guest_count}
                                </div>
                            </td>
                            <td className="px-8 py-6 max-w-sm">
                                <div className="space-y-3">
                                    {rsvp.dietary_preference && (
                                        <div className="flex items-start gap-2 text-xs text-wedding-gold font-medium bg-wedding-lightGold/10 p-2 rounded-xl">
                                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                            <span>{rsvp.dietary_preference}</span>
                                        </div>
                                    )}
                                    {rsvp.message_to_couple && (
                                        <div className="flex items-start gap-2 text-xs text-gray-500 italic bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-200" />
                                            <span>"{rsvp.message_to_couple}"</span>
                                        </div>
                                    )}
                                    {!rsvp.dietary_preference && !rsvp.message_to_couple && (
                                        <span className="text-gray-200 text-xs">—</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">
                                    {new Date(rsvp.response_date).toLocaleDateString()}
                                </div>
                                <div className="text-[9px] text-gray-300 font-mono">
                                    {new Date(rsvp.response_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden mobile-cards space-y-4">
                {rsvps.map((rsvp) => (
                    <div key={rsvp.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-serif text-2xl text-wedding-dark mb-1">{rsvp.guest_name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <Phone className="w-3 h-3" />
                                    <span>{rsvp.phone_number || 'N/A'}</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-2xl ${rsvp.attending ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                                {rsvp.attending ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guests</span>
                            <span className="text-lg font-bold text-wedding-dark">{rsvp.guest_count}</span>
                        </div>

                        {(rsvp.dietary_preference || rsvp.message_to_couple) && (
                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                {rsvp.dietary_preference && (
                                    <div className="flex items-start gap-3 text-xs text-wedding-gold font-medium bg-wedding-lightGold/5 p-3 rounded-2xl">
                                        <Info className="w-4 h-4 flex-shrink-0" />
                                        <span>{rsvp.dietary_preference}</span>
                                    </div>
                                )}
                                {rsvp.message_to_couple && (
                                    <div className="flex items-start gap-3 text-xs text-gray-500 italic bg-gray-50 p-4 rounded-2xl">
                                        <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-200" />
                                        <span>"{rsvp.message_to_couple}"</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-6 text-[9px] text-gray-300 font-mono text-center uppercase tracking-widest">
                            Submitted on {new Date(rsvp.response_date).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {rsvps.length === 0 && (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-wedding-dark mb-2">No Responses Yet</h3>
                    <p className="text-wedding-gray text-sm">Share your guest link to start receiving RSVPs.</p>
                </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print py-12 text-center opacity-50">
         <div className="w-10 h-1 bg-wedding-gold/20 mx-auto mb-6 rounded-full"></div>
         <p className="text-[10px] text-gray-300 uppercase tracking-[0.4em] font-bold">
           <a href="/" className="hover:text-wedding-gold transition-colors">AuraVows Premium Invitations © 2026</a>
         </p>
      </footer>

      {/* Print Footer */}
      <div className="print-footer text-center py-10 border-t border-gray-100 mt-20">
          <p className="font-serif italic text-wedding-dark text-lg mb-2">Thank you for sharing our special day!</p>
          <p className="text-[10px] text-wedding-gold uppercase tracking-[0.4em] font-bold">
              {invitation ? (invitation.custom_config?.swap_names ? `${invitation.bride_name} & ${invitation.groom_name}` : `${invitation.groom_name} & ${invitation.bride_name}`) : 'Wedding Event'}
          </p>
          <p className="text-[8px] text-gray-400 mt-6">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
