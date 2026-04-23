import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-800/30" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              2026广东以色列理工学院
              <br />
              <span className="text-blue-100">奖学金申请系统</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="text-lg sm:text-xl text-blue-100 font-medium tracking-widest uppercase mb-6">
              GTIIT - Scholarship Application System
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="text-base sm:text-lg text-blue-50 max-w-2xl mx-auto leading-relaxed">
              为优秀学子提供丰厚的奖学金支持，助力您的学术梦想
              <br className="hidden sm:block" />
              开启国际化教育之旅
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="mt-10"
          >
            <a
              href="#scholarships"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              了解奖学金
              <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
}
