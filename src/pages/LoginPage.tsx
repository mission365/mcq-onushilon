import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
          toast.success('অ্যাডমিন প্যানেলে স্বাগতম');
        } else {
          navigate('/dashboard');
          toast.success('ড্যাশবোর্ডে স্বাগতম');
        }
      } else {
        toast.error('প্রোফাইল পাওয়া যায়নি');
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('ইমেইল/পাসওয়ার্ড লগইন বর্তমানে বন্ধ আছে। অনুগ্রহ করে গুগল ব্যবহার করে লগইন করুন বা অ্যাডমিনকে জানান।');
      } else {
        toast.error(error.message || 'লগইন ব্যর্থ হয়েছে');
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
      
      let role = 'student';
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          fullName: user.displayName || 'Unnamed User',
          email: user.email,
          role: 'student',
          createdAt: serverTimestamp(),
        });
      } else {
        role = docSnap.data().role;
      }
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
        toast.success('অ্যাডমিন প্যানেলে স্বাগতম');
      } else {
        navigate('/dashboard');
        toast.success('লগইন সফল হয়েছে');
      }
    } catch (error: any) {
      toast.error(error.message || 'গুগল লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-2 text-center pb-8 pt-10 px-8 bg-slate-50 border-b border-slate-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-bengali text-slate-900 tracking-tight">লগইন করুন</CardTitle>
            <CardDescription className="font-bengali text-slate-500 text-lg">আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন</CardDescription>
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
                <span className="font-bengali">গুগল দিয়ে প্রবেশ করো</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">অথবা</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
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
                  <div className="flex justify-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bengali font-bold text-lg rounded-xl shadow-lg shadow-blue-100 border-none transition-all" 
                  disabled={loading}
                >
                  {loading ? 'প্রসেসিং...' : 'লগইন করো'}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-8 bg-slate-50 border-t border-slate-100">
            <div className="text-sm text-center text-slate-500 font-bengali flex items-center gap-2 justify-center">
              <span>অ্যাকাউন্ট নেই?</span>
              <Link to="/register" className="text-blue-600 font-bold hover:underline">রেজিস্ট্রেশন করো</Link>
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

export default LoginPage;
