import { useState } from 'react';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';
import { LoginModal } from '@/components/custom/LoginModal';
import { HeroSection } from '@/sections/HeroSection';
import { ScholarshipSection } from '@/sections/ScholarshipSection';
import { ProcessSection } from '@/sections/ProcessSection';
import { ContactSection } from '@/sections/ContactSection';
import { LoginEntrySection } from '@/sections/LoginEntrySection';

interface HomeProps {
  onNavigateToRegister: () => void;
}

export function Home({ onNavigateToRegister }: HomeProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleStudentLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleAdminLogin = () => {
    alert('管理员登录功能演示');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />
      
      <main className="flex-1">
        <HeroSection />
        <ScholarshipSection onApplyClick={handleStudentLogin} />
        <ProcessSection />
        <ContactSection />
        <LoginEntrySection
          onStudentLogin={handleStudentLogin}
          onAdminLogin={handleAdminLogin}
          onRegister={onNavigateToRegister}
        />
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={onNavigateToRegister}
      />
    </div>
  );
}
