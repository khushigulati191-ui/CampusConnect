import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import ReviewComplaints from './pages/ReviewComplaints';
import LostAndFound from './pages/LostAndFound';
import AffiliatedColleges from './pages/AffiliatedColleges';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      {/* Standalone Login Screen */}
      <Route path="/login" element={<Login />} />

      {/* Main Authenticated Layout */}
      <Route element={<AppLayout />}>
        <Route index element={isAdmin ? <AdminDashboard /> : <Dashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="review" element={<ReviewComplaints />} />
        <Route path="history" element={<ComplaintHistory />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="colleges" element={<AffiliatedColleges />} />
        <Route path="queue" element={<Navigate to="/review" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
