import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">广东以色列理工学院</h3>
              <p className="text-xs text-slate-400">奖学金申请系统</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-slate-400">
              © 2026 广东以色列理工学院 奖学金申请系统
            </p>
            <p className="text-xs text-slate-500 mt-1">
              保留所有权利
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
