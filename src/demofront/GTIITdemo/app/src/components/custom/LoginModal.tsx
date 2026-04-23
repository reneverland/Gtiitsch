import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    alert('登录功能演示');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">学生登录</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    广东以色列理工学院奖学金申请系统
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">登录 Login</TabsTrigger>
                    <TabsTrigger value="register">注册 Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">身份证号</Label>
                        <Input
                          id="idNumber"
                          type="text"
                          placeholder="请输入18位身份证号"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          忘记密码？
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        登录 Login
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-4">
                        还没有账号？请点击下方按钮前往注册页面
                      </p>
                      <Button
                        onClick={() => {
                          onClose();
                          onRegisterClick();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        前往注册
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
