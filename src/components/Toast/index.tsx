import { CheckCircleIcon, XCircleIcon,XMarkIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps)=> {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const Icon = type === 'error' ? XCircleIcon : CheckCircleIcon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in`}
    >
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export { Toast };
