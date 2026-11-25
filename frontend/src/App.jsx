import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import FifoQueue from './pages/FifoQueue';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="submit" element={<SubmitComplaint />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="history" element={<ComplaintHistory />} />
        <Route path="queue" element={<FifoQueue />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
