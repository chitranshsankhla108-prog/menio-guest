import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, ArrowRight, Loader2, Sparkles, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCafe } from '@/contexts/CafeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cafe, isLoading: cafeLoading, error, setCafeByCode } = useCafe();
  const { t } = useLanguage();
  
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle URL parameter code (For QR Scans)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && !cafe) {
      handleCodeSubmit(urlCode);
    }
  }, [searchParams]);

  // Redirect if cafe is already active
  useEffect(() => {
    if (cafe && !cafeLoading) {
      navigate('/menu', { replace: true });
    }
  }, [cafe, cafeLoading, navigate]);

  const handleCodeSubmit = async (codeToSubmit?: string) => {
    const submittedCode = codeToSubmit || code;
    if (!submittedCode.trim()) {
      toast.error('Please enter a cafe code');
      return;
    }

    setIsSubmitting(true);
    const success = await setCafeByCode(submittedCode);
    setIsSubmitting(false);

    if (success) {
      toast.success('Welcome!');
      navigate('/menu', { replace: true });
    } else if (error) {
      toast.error(error);
    }
  };

  if (cafeLoading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#6F4E37]/50" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6F4E37]">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EDE4] flex flex-col relative overflow-hidden selection:bg-[#FFD6C9] selection:text-[#3A2C2C]">
      
      {/* Luxury Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#F9E0E3] rounded-full blur-[100px] opacity-80 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-[#FFD6C9] rounded-full blur-[100px] opacity-60 pointer-events-none" />

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          
          {/* Logo & Branding */}
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(111,78,55,0.06)] mb-6 border border-[#F9E0E3]">
              <Coffee className="w-10 h-10 text-[#6F4E37]" />
            </div>
            <h1 className="text-5xl font-black text-[#3A2C2C] mb-3 font-serif italic tracking-tighter">
              {t('app.name') || 'Menio'}
            </h1>
            <p className="text-[#6F4E37] text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-[#FFD6C9]" />
              {t('app.tagline')}
              <Sparkles className="w-3 h-3 text-[#FFD6C9]" />
            </p>
          </div>

          {/* Premium Code Entry Card */}
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(58,44,44,0.04)] border border-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="space-y-6">
              
              <div className="space-y-3">
                <label htmlFor="cafeCode" className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37] pl-2 flex items-center gap-2">
                  <Store className="w-3.5 h-3.5" />
                  Enter Cafe Code
                </label>
                <Input
                  id="cafeCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DEL08"
                  maxLength={10}
                  className={cn(
                    "h-16 rounded-[1.5rem] text-center text-xl font-black tracking-widest uppercase",
                    "bg-[#F4EDE4]/50 border-none focus-visible:ring-2 focus-visible:ring-[#FFD6C9]",
                    "text-[#3A2C2C] placeholder:text-[#6F4E37]/30 transition-all",
                    error && "ring-2 ring-red-400/50 focus-visible:ring-red-400"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCodeSubmit();
                    }
                  }}
                />
              </div>
              
              <Button
                className="w-full h-16 rounded-[1.5rem] bg-[#3A2C2C] text-[#F4EDE4] text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(58,44,44,0.2)] hover:bg-[#6F4E37] transition-all active:scale-95 group"
                onClick={() => handleCodeSubmit()}
                disabled={isSubmitting || !code.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#FFD6C9]" />
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Cafe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FFD6C9]" />
                  </span>
                )}
              </Button>

            </div>
          </div>

          <p className="text-[10px] text-center font-bold text-[#6F4E37]/50 mt-8 uppercase tracking-widest leading-relaxed">
            Scan the QR code at your table <br/> or ask staff for the code
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#6F4E37]/40">
          Powered by Menio
        </p>
      </footer>
    </div>
  );
}