import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterProps {
  onNavigateToHome: () => void;
}

export function Register({ onNavigateToHome }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: '',
  });

  const handleSendCode = () => {
    if (!formData.email) {
      alert('请先输入邮箱地址');
      return;
    }
    setIsCodeSending(true);
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCodeSending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('注册功能演示');
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">注册 Register</h1>
            <p className="text-blue-100">
              广东以色列理工学院奖学金申请系统
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-5">
              {/* Full Name */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  学生姓名
                  <span className="block text-xs text-slate-400 font-normal">Full Name</span>
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    placeholder="请输入学生本人中文姓名"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* ID Number */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  学生本人身份证号
                  <span className="block text-xs text-slate-400 font-normal">ID No.</span>
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    placeholder="请输入18位身份证号"
                    value={formData.idNumber}
                    onChange={(e) => handleChange('idNumber', e.target.value)}
                    className="h-12"
                    maxLength={18}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  密码
                  <span className="block text-xs text-slate-400 font-normal">Password</span>
                </Label>
                <div className="sm:col-span-3 relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="6位以上字母和数字组合"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  确认密码
                  <span className="block text-xs text-slate-400 font-normal">Confirm Password</span>
                </Label>
                <div className="sm:col-span-3 relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="请再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  邮件地址
                  <span className="block text-xs text-slate-400 font-normal">Email Address</span>
                </Label>
                <div className="sm:col-span-3 flex gap-3">
                  <Input
                    type="email"
                    placeholder="请输入常用邮箱"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="h-12 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isCodeSending}
                    variant="outline"
                    className="h-12 px-4 whitespace-nowrap"
                  >
                    {isCodeSending ? `${codeCountdown}s` : '获取验证码'}
                  </Button>
                </div>
              </div>

              {/* Verification Code */}
              <div className="grid sm:grid-cols-4 items-center gap-4">
                <Label className="sm:text-right text-slate-700 font-medium">
                  邮箱验证码
                  <span className="block text-xs text-slate-400 font-normal">Verification Code</span>
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    placeholder="请输入邮箱验证码"
                    value={formData.verificationCode}
                    onChange={(e) => handleChange('verificationCode', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800">注意：</p>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <span className="inline-flex items-center gap-1 mr-1">
                      <CheckCircle className="w-3 h-3" />
                      1.
                    </span>
                    请确认以上信息为<strong>学生本人</strong>的真实证件信息和密码。证件号将作为唯一报名证号，无法更改，确认无误后再提交。
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <span className="inline-flex items-center gap-1 mr-1">
                      <CheckCircle className="w-3 h-3" />
                      2.
                    </span>
                    请填写常用的邮箱地址，所有的系统邮件会发送到此地址。此地址不对外公开，当需要联系您时，也会使用此邮件地址或获取其他您预留的联系方式。
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                注册 Register
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onNavigateToHome}
                className="w-full sm:w-auto h-12 px-10 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                返回 Return
              </Button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                已有账号？
                <button
                  type="button"
                  onClick={onNavigateToHome}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  返回首页登录
                </button>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
