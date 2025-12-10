import { BrowserRouter, Route,Routes } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/Toast';
import { NotesProvider } from '@/context/NotesProvider';
import { useToast } from '@/context/toastContext';
import { ToastProvider } from '@/context/ToastProvider';
import { UsersProvider } from '@/context/UsersProvider';
import { EditPage } from '@/pages/EditPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function ToastContainer() {
  const { toast, hideToast } = useToast();
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={hideToast} />;
}

function AppContent() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit/:id" element={<EditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <UsersProvider>
            <NotesProvider>
              <AppContent />
            </NotesProvider>
          </UsersProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
