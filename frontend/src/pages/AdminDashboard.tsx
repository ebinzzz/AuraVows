import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Users, Calendar, MapPin, ExternalLink, LogOut, Search, Filter, MoreVertical, Edit3, Trash2, Palette, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Invitation {
  id: string;
  invitation_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  venue_name: string;
  is_active: boolean;
  template: string;
  total_rsvps: number;
  total_guests: number;
  custom_config?: any;
}

export default function AdminDashboard() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'invitations' | 'templates'>('invitations');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invResponse, tplResponse] = await Promise.all([
        api.get('/invitations/'),
        api.get('/templates/')
      ]);
      setInvitations(invResponse.data);
      setTemplates(tplResponse.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateName = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    if (tpl) return tpl.name;
    
    const systemTemplates: Record<string, string> = {
       royal: 'Royal Classic',
       modern: 'Modern Sage',
       floral: 'Floral Rose'
    };
    return systemTemplates[id] || id;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (invitationId: string) => {
    if (window.confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      try {
        await api.delete(`/invitations/${invitationId}`);
        setInvitations(invitations.filter(inv => inv.invitation_id !== invitationId));
      } catch (err) {
        console.error('Failed to delete invitation', err);
        alert('Failed to delete invitation. Please try again.');
      }
    }
  };

  const filteredInvitations = invitations.filter(invite => 
    invite.bride_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.groom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.invitation_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-wedding-bg flex flex-col font-sans">
      {/* Header */}
      <header className="bg-wedding-primary text-white py-6 px-10 shadow-2xl flex justify-between items-center sticky top-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-wedding-secondary p-3 rounded-2xl shadow-lg transform rotate-3">
            <Calendar className="w-6 h-6 text-wedding-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em] mb-0.5">AuraVows Admin</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Premium Invitation Management</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="relative z-10 flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full text-wedding-secondary border border-white/10 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </button>
      </header>

      <main className="flex-1 p-10 lg:p-16 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Stats / Welcome */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-5xl font-bold text-wedding-primary mb-3 tracking-tight">Overview</h2>
              <p className="text-wedding-gray font-medium max-w-md">Real-time performance of your active wedding invitations.</p>
            </div>
            <div className="flex gap-4">
              <button 
                  className="flex items-center gap-3 bg-wedding-accent hover:bg-wedding-lightGold text-wedding-primary px-8 py-4 rounded-full font-bold uppercase text-sm tracking-widest transition-all shadow-xl hover:shadow-wedding-accent/20 transform hover:-translate-y-1 border border-wedding-gold/20"
                  onClick={() => navigate('/admin/templates/create')}
              >
                  <Palette className="w-5 h-5" />
                  <span>Create Template</span>
              </button>
              <button 
                  className="flex items-center gap-3 bg-wedding-secondary hover:bg-wedding-mid text-wedding-primary px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest transition-all shadow-xl hover:shadow-wedding-secondary/20 transform hover:-translate-y-1"
                  onClick={() => navigate('/admin/create')}
              >
                  <Plus className="w-5 h-5" />
                  <span>Create New Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Events', value: invitations.length, icon: <Calendar className="w-6 h-6" />, color: 'bg-wedding-primary' },
              { label: 'Total RSVPs', value: invitations.reduce((sum, i) => sum + i.total_rsvps, 0), icon: <Users className="w-6 h-6" />, color: 'bg-wedding-secondary' },
              { label: 'Confirmed Guests', value: invitations.reduce((sum, i) => sum + i.total_guests, 0), icon: <Heart className="w-6 h-6" />, color: 'bg-wedding-accent' },
              { label: 'Active Pages', value: invitations.filter(i => i.is_active).length, icon: <ExternalLink className="w-6 h-6" />, color: 'bg-green-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Live Sync</div>
                </div>
                <h4 className="text-sm font-bold text-wedding-gray uppercase tracking-widest mb-1">{stat.label}</h4>
                <p className="text-4xl font-bold text-wedding-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* View Toggle */}
        <div className="flex gap-4 border-b border-gray-100">
           <button 
             onClick={() => setView('invitations')}
             className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all ${view === 'invitations' ? 'text-wedding-primary border-b-2 border-wedding-secondary' : 'text-gray-300'}`}
           >
             Invitations
           </button>
           <button 
             onClick={() => setView('templates')}
             className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all ${view === 'templates' ? 'text-wedding-primary border-b-2 border-wedding-secondary' : 'text-gray-300'}`}
           >
             Custom Templates
           </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type="text" 
              placeholder={view === 'invitations' ? "Search by couple name or ID..." : "Search templates..."}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-wedding-secondary/30 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 bg-gray-50 text-wedding-gray rounded-2xl flex items-center gap-2 hover:bg-gray-100 transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-wedding-secondary/20 border-t-wedding-secondary"></div>
            <p className="text-wedding-primary font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Invitations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {view === 'invitations' ? (
              filteredInvitations.length === 0 ? (
                <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-24 text-center">
                  <div className="w-24 h-24 bg-wedding-accent rounded-full flex items-center justify-center mx-auto mb-8">
                    <Calendar className="w-10 h-10 text-wedding-secondary opacity-30" />
                  </div>
                  <h3 className="text-2xl font-bold text-wedding-primary mb-2">No matches found</h3>
                  <p className="text-wedding-gray text-sm">Try adjusting your search or create a new invitation.</p>
                </div>
              ) : (
                filteredInvitations.map((invite) => (
                  <div key={invite.id} className="group bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 transform hover:-translate-y-2">
                    <div className="relative h-2 bg-gradient-to-r from-wedding-primary via-wedding-secondary to-wedding-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-2">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${invite.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {invite.is_active ? '● Active' : '○ Inactive'}
                          </div>
                          <div className="px-3 py-1.5 rounded-full bg-wedding-accent text-wedding-gold text-[8px] font-bold uppercase tracking-widest border border-wedding-gold/20">
                              {getTemplateName(invite.template)}
                          </div>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-300 cursor-pointer transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-wedding-primary mb-6 leading-tight">
                        {invite.custom_config?.swap_names ? (
                          <>{invite.bride_name} <span className="text-wedding-secondary font-serif italic font-normal">&</span> {invite.groom_name}</>
                        ) : (
                          <>{invite.groom_name} <span className="text-wedding-secondary font-serif italic font-normal">&</span> {invite.bride_name}</>
                        )}
                      </h3>
                      
                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-4 text-xs font-medium text-wedding-gray bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                          <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-wedding-secondary" />
                          </div>
                          <span>{new Date(invite.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-wedding-gray bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                          <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-wedding-secondary" />
                          </div>
                          <span className="truncate">{invite.venue_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-wedding-gray bg-wedding-accent/20 p-3 rounded-2xl border border-wedding-gold/10">
                          <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-wedding-primary" />
                          </div>
                          <span>{invite.total_guests} Confirmed Guests ({invite.total_rsvps} RSVPs)</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/admin/edit/${invite.invitation_id}`)}
                          className="flex-1 bg-wedding-primary hover:bg-black text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Details
                        </button>
                        <button 
                          onClick={() => window.open(`/invite/${invite.invitation_id}`, '_blank')}
                          className="w-14 bg-wedding-accent text-wedding-primary rounded-2xl hover:bg-wedding-secondary hover:text-white transition-all flex items-center justify-center"
                          title="View Live Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/client/${invite.invitation_id}`)}
                          className="w-14 bg-gray-50 text-wedding-gray rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center"
                          title="Guest List"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invite.invitation_id)}
                          className="w-14 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          title="Delete Invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              templates.length === 0 ? (
                <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-24 text-center">
                  <h3 className="text-2xl font-bold text-wedding-primary mb-2">No templates created</h3>
                  <p className="text-wedding-gray text-sm">Click "Create Template" to start designing your own themes.</p>
                </div>
              ) : (
                templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((template) => (
                  <div key={template.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-wedding-accent rounded-xl flex items-center justify-center">
                          <Palette className="w-5 h-5 text-wedding-secondary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-wedding-primary">{template.name}</h3>
                          <p className="text-[10px] text-wedding-gray uppercase tracking-widest font-bold">{template.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-8">
                        {template.config?.colors && Object.values(template.config.colors).map((c: any, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border border-gray-100" style={{ backgroundColor: c }}></div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/admin/templates/edit/${template.id}`)}
                      className="w-full bg-wedding-secondary hover:bg-wedding-mid text-wedding-primary py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Design
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </main>
      
      <footer className="p-10 text-center">
        <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em] font-bold">AuraVows Premium Invitations © 2026</p>
      </footer>
    </div>
  );
}
