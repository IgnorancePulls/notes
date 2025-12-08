import { ExclamationTriangleIcon,HomeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <ExclamationTriangleIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />

        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
        >
          <HomeIcon className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
}
