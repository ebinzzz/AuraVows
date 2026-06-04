import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import CreateInvitationPage from './pages/CreateInvitationPage';
import EditInvitationPage from './pages/EditInvitationPage';
import InvitationPage from './pages/InvitationPage';
import RSVPPage from './pages/RSVPPage';
import SharedRSVPPage from './pages/SharedRSVPPage';
import TemplateCreatorPage from './pages/TemplateCreatorPage';
import AfterMarriagePage from './pages/AfterMarriagePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<CreateInvitationPage />} />
        <Route path="/admin/edit/:id" element={<EditInvitationPage />} />
        <Route path="/client/:id" element={<ClientDashboard />} />
        <Route path="/invite/:id" element={<InvitationPage />} />
        <Route path="/invite/:id/rsvp" element={<RSVPPage />} />
        <Route path="/invite/:id/memories" element={<AfterMarriagePage />} />
        <Route path="/shared/:token" element={<SharedRSVPPage />} />
        <Route path="/admin/templates/create" element={<TemplateCreatorPage />} />
        <Route path="/admin/templates/edit/:id" element={<TemplateCreatorPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
