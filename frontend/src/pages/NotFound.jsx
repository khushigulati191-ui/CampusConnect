import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { EmptyState } from '../components/ui/States';

export default function NotFound() {
  return (
    <div className="card mx-auto mt-8 max-w-xl">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link to="/" className="btn-primary">
            <Home size={16} /> Back to dashboard
          </Link>
        }
      />
    </div>
  );
}
