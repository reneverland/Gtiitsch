import { motion } from 'framer-motion';
import { UserPlus, Target, Upload, Clock, ChevronRight } from 'lucide-react';
import { AnimatedSection } from '@/components/custom/AnimatedSection';

const steps = [
  {
    icon: UserPlus,
    title: '注册账号',
    description: '填写基本信息完成账号注册',
  },
  {
    icon: Target,
    title: '选择奖学金',
    description: '根据自身条件选择合适的奖学金类型',
  },
  {
    icon: Upload,
    title: '提交材料',
    description: '上传所需申请材料并提交',
  },
  {
    icon: Clock,
    title: '等待审核',
    description: '耐心等待审核结果公布',
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            申请流程
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            简单四步，轻松完成奖学金申请
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="relative"
            >
              <div className="bg-slate-50 rounded-2xl p-6 h-full hover:bg-blue-50 transition-colors duration-300 group">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <step.icon className="w-7 h-7 text-blue-600" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
