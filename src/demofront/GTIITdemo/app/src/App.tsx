import { useState } from 'react';
import { Home } from '@/pages/Home';
import { Register } from '@/pages/Register';

type Page = 'home' | 'register';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateToRegister = () => {
    setCurrentPage('register');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentPage === 'home' && (
        <Home onNavigateToRegister={navigateToRegister} />
      )}
      {currentPage === 'register' && (
        <Register onNavigateToHome={navigateToHome} />
      )}
    </div>
  );
}

export default App;
