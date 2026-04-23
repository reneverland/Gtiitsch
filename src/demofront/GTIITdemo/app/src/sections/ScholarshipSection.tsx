import { ScholarshipCard } from '@/components/custom/ScholarshipCard';
import { AnimatedSection } from '@/components/custom/AnimatedSection';

interface ScholarshipSectionProps {
  onApplyClick: () => void;
}

export function ScholarshipSection({ onApplyClick }: ScholarshipSectionProps) {
  const scholarships = [
    {
      title: '学科特长奖学金',
      titleEn: 'SUBJECT SPECIALTY SCHOLARSHIP',
      icon: '/icon-trophy.png',
      color: 'gold' as const,
      conditions:
        '高中阶段获得全国中学生奥林匹克竞赛（数学、物理、化学、生物、信息学）省级三等奖及以上，并经过全国青少年科技竞赛获奖公示的高三学生。',
      materials:
        '学生本人身份证扫描件（正反面）；奥赛获奖证书扫描件及公示链接。',
      deadline: '2026年7月5日',
      resultDate: '2026年6月中旬起逐批公布',
    },
    {
      title: '创新潜质奖学金',
      titleEn: 'INNOVATIVE POTENTIAL SCHOLARSHIP',
      icon: '/icon-bulb.png',
      color: 'cyan' as const,
      conditions:
        '高中阶段成绩优秀、综合素质突出，有志于理工科学习，希望接受国际化教育的高三年级学生。',
      materials:
        '学生本人身份证扫描件（正反面）；高三年级2次模考成绩及排名（须加盖中学或教务处公章）；其他可反映个人优秀综合素质的证明材料（如有）。',
      deadline: '2026年5月31日',
      resultDate: '2026年6月中旬',
    },
  ];

  return (
    <section id="scholarships" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            奖学金项目
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            我们提供多种奖学金项目，助力优秀学子实现学术梦想
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {scholarships.map((scholarship, index) => (
            <ScholarshipCard
              key={scholarship.title}
              {...scholarship}
              onApply={onApplyClick}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
