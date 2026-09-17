import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';

interface DiscountCountdownProps {
  expiresAt?: string | null;
  title?: string;
  active?: boolean;
  variant?: 'banner' | 'compact';
  isEnglishUi?: boolean;
}

interface TimeLeft {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const DiscountCountdown: React.FC<DiscountCountdownProps> = ({
  expiresAt,
  title,
  active = true,
  variant = 'banner',
  isEnglishUi = false,
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    if (!expiresAt || !active) {
      return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { totalMs: diff, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    if (!expiresAt || !active) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, active]);

  if (!active || !expiresAt || timeLeft.totalMs <= 0) {
    return null;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const toBn = (n: number | string) => {
    if (isEnglishUi) return String(n);
    const bnDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(n).replace(/[0-9]/g, (w) => bnDigits[w] || w);
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
        <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500" />
        <span>{title || (isEnglishUi ? 'Limited Offer Ends In:' : 'অফার শেষ হতে বাকি:')}</span>
        <span className="font-mono font-extrabold text-rose-700 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200">
          {toBn(pad(timeLeft.days))}d : {toBn(pad(timeLeft.hours))}h : {toBn(pad(timeLeft.minutes))}m : {toBn(pad(timeLeft.seconds))}s
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-lg border border-amber-300/30">
      {/* Subtle decorative glow circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 text-xs font-extrabold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            <span>{isEnglishUi ? 'Limited Time Mega Deal' : 'সীমিত সময়ের মেগা অফার'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-xs">
            {title || (isEnglishUi ? 'Special Curriculum Discount Offer!' : 'স্পেশাল কারিকুলাম সাবস্ক্রিপশন অফার!')}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            {isEnglishUi
              ? 'Lock in your discounted rate before the countdown expires. Get full syllabus access for your stream!'
              : 'কাউন্টডাউন শেষ হওয়ার আগেই ডিসকাউন্ট মূল্যে সাবস্ক্রিপশন নিন। সকল বোর্ড প্রশ্ন ও অধ্যায়ভিত্তিক মডেল টেস্ট আনলক করুন!'}
          </p>
        </div>

        {/* Live Countdown Clock Blocks */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start md:self-center">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-black/35 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {toBn(pad(timeLeft.days))}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mt-1">
              {isEnglishUi ? 'Days' : 'দিন'}
            </span>
          </div>

          <span className="text-xl sm:text-2xl font-bold text-white/60 -mt-4">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-black/35 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {toBn(pad(timeLeft.hours))}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mt-1">
              {isEnglishUi ? 'Hours' : 'ঘন্টা'}
            </span>
          </div>

          <span className="text-xl sm:text-2xl font-bold text-white/60 -mt-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-black/35 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {toBn(pad(timeLeft.minutes))}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mt-1">
              {isEnglishUi ? 'Mins' : 'মিনিট'}
            </span>
          </div>

          <span className="text-xl sm:text-2xl font-bold text-white/60 -mt-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-rose-950/60 backdrop-blur-md border border-rose-400/40 flex items-center justify-center shadow-inner animate-pulse">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                {toBn(pad(timeLeft.seconds))}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 mt-1">
              {isEnglishUi ? 'Secs' : 'সেকেন্ড'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountCountdown;
