import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { AnimatedSection } from '@/components/custom/AnimatedSection';

const contacts = [
  {
    icon: Phone,
    label: '咨询电话',
    value: '0754-88077012',
    href: 'tel:0754-88077012',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Mail,
    label: '咨询邮箱',
    value: 'sci-scholarship@gtiit.edu.cn',
    href: 'mailto:sci-scholarship@gtiit.edu.cn',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageCircle,
    label: '技术支持QQ',
    value: '2241784329',
    href: '#',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            联系方式
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            如有任何疑问，欢迎通过以下方式联系我们
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contacts.map((contact, index) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div
                className={`w-14 h-14 ${contact.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <contact.icon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">
                {contact.label}
              </h3>
              <p className="text-base font-semibold text-slate-900">
                {contact.value}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
