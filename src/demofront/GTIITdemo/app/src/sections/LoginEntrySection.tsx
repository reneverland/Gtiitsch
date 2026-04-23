import { motion } from 'framer-motion';
import { User, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/custom/AnimatedSection';

interface LoginEntrySectionProps {
  onStudentLogin: () => void;
  onAdminLogin: () => void;
  onRegister: () => void;
}

export function LoginEntrySection({
  onStudentLogin,
  onAdminLogin,
  onRegister,
}: LoginEntrySectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            登录系统
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            选择您的身份登录系统
          </p>
        </AnimatedSection>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full sm:w-auto"
          >
            <Button
              onClick={onStudentLogin}
              size="lg"
              className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-3"
            >
              <User className="w-5 h-5" />
              学生登录
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full sm:w-auto"
          >
            <Button
              onClick={onAdminLogin}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3"
            >
              <Shield className="w-5 h-5" />
              管理员登录
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-slate-600">
            还没有账号？
            <button
              onClick={onRegister}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              立即注册
              <ArrowRight className="w-4 h-4" />
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
