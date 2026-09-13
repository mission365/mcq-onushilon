import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('পাসওয়ার্ড মেলেনি');
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'profiles', user.uid), {
        fullName,
        email,
        role: 'student',
        createdAt: serverTimestamp(),
      });
      
      toast.success('রেজিস্ট্রেশন সফল হয়েছে');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('ইমেইল/পাসওয়ার্ড লগইন বর্তমানে বন্ধ আছে। অনুগ্রহ করে গুগল ব্যবহার করে লগইন করুন বা অ্যাডমিনকে জানান।');
      } else {
        toast.error(error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          fullName: user.displayName || 'Unnamed User',
          email: user.email,
          role: 'student',
          createdAt: serverTimestamp(),
        });
      }
      
      toast.success('লগইন সফল হয়েছে');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'গুগল লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-2 text-center pb-8 pt-10 px-8 bg-slate-50 border-b border-slate-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-bengali text-slate-900 tracking-tight">রেজিস্ট্রেশন করুন</CardTitle>
            <CardDescription className="font-bengali text-slate-500 text-lg">আপনার তথ্য দিয়ে নতুন অ্যাকাউন্ট খুলুন</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <Button 
                onClick={handleGoogleLogin} 
                variant="outline" 
                className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-600 rounded-xl"
                disabled={loading}
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                <span className="font-bengali">গুগল দিয়ে শুরু করো</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">অথবা</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-bengali text-slate-700 font-bold ml-1">পূর্ণ নাম</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="fullName" 
                      placeholder="আপনার নাম" 
                      required 
                      className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-500 transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bengali text-slate-700 font-bold ml-1">ইমেইল</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-500 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" title="password" className="font-bengali text-slate-700 font-bold ml-1">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        required 
                        className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-500 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" title="confirmPassword" className="font-bengali text-slate-700 font-bold ml-1">নিশ্চিত করুন</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        required 
                        className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-500 transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold text-lg rounded-xl shadow-lg shadow-blue-100 border-none transition-all" 
                  disabled={loading}
                >
                  {loading ? 'প্রসেসিং...' : 'রেজিস্ট্রেশন করো'}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-8 bg-slate-50 border-t border-slate-100">
            <div className="text-sm text-center text-slate-500 font-bengali flex items-center gap-2 justify-center">
              <span>ইতিমধ্যেই অ্যাকাউন্ট আছে?</span>
              <Link to="/login" className="text-blue-600 font-bold hover:underline">লগইন করো</Link>
            </div>
            <div className="text-sm text-center font-bengali">
              <Link to="/" className="font-semibold text-slate-500 hover:text-blue-600 hover:underline">
                হোম পেজে ফিরে যাও
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
