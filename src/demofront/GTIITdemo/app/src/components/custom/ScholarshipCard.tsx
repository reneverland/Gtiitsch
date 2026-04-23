import { motion } from 'framer-motion';
import { Calendar, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScholarshipCardProps {
  title: string;
  titleEn: string;
  icon: string;
  color: 'gold' | 'cyan';
  conditions: string;
  materials: string;
  deadline: string;
  resultDate: string;
  onApply: () => void;
  delay?: number;
}

export function ScholarshipCard({
  title,
  titleEn,
  icon,
  color,
  conditions,
  materials,
  deadline,
  resultDate,
  onApply,
  delay = 0,
}: ScholarshipCardProps) {
  const colorStyles = {
    gold: {
      bar: 'bg-gradient-to-r from-amber-400 to-amber-500',
      iconBg: 'bg-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-200',
      lightBg: 'bg-amber-50',
    },
    cyan: {
      bar: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-100',
      button: 'bg-cyan-600 hover:bg-cyan-700',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      lightBg: 'bg-cyan-50',
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100"
    >
      {/* Color Bar */}
      <div className={`h-1.5 ${styles.bar}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
            <img src={icon} alt={title} className="w-10 h-10 object-contain" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className={`text-sm font-medium ${styles.text} mt-1`}>{titleEn}</p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Conditions */}
          <div className={`${styles.lightBg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className={`w-4 h-4 ${styles.text}`} />
              <h4 className={`text-sm font-semibold ${styles.text}`}>申请条件</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{conditions}</p>
          </div>

          {/* Materials */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">申请材料</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{materials}</p>
          </div>

          {/* Dates */}
          <div className={`${styles.lightBg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${styles.text}`} />
              <h4 className={`text-sm font-semibold ${styles.text}`}>重要日期</h4>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-slate-600">
                <span className="font-medium">申请截止：</span>
                <span className={styles.text}>{deadline}</span>
              </p>
              <p className="text-slate-600">
                <span className="font-medium">结果公布：</span>
                <span className={styles.text}>{resultDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={onApply}
          className={`w-full mt-6 h-12 ${styles.button} text-white font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
        >
          立即申请
        </Button>
      </div>
    </motion.div>
  );
}
