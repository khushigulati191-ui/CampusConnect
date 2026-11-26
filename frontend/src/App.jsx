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
import TestConsole from './pages/TestConsole';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAdmin, isTestMode } = useAuth();

  return (
    <Routes>
      {/* Standalone Login Screen */}
      <Route path="/login" element={<Login />} />

      {/* Main Authenticated Layout */}
      <Route element={<AppLayout />}>
        {/* Default Landing: separated by role */}
        <Route index element={isAdmin ? <AdminDashboard /> : <Dashboard />} />

        {/* Dedicated Developer Test URL: /test */}
        <Route path="test" element={<TestConsole />} />

        {/* Admin Portal (Protected: only accessible to admin or when in /test mode) */}
        <Route
          path="admin"
          element={
            isAdmin || isTestMode ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Student & Shared Features */}
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
