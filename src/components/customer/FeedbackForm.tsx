import { useState } from 'react';
import { Star, Send, ArrowLeft, CheckCircle, HeartHandshake } from 'lucide-react';
import { useSubmitFeedback } from '@/hooks/useFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function FeedbackForm() {
  const submitFeedback = useSubmitFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;

    submitFeedback.mutate(
      {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        comment: comment.trim(),
        rating,
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDF8F7] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Soft Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD6C9]/40 rounded-full blur-[100px] pointer-events-none" />
        
        <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-[0_20px_60px_rgba(58,44,44,0.08)] bg-white relative z-10 animate-in zoom-in duration-500">
          <CardContent className="py-12 px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[#F7F1F2] mb-6 border-2 border-[#EBE1E3]">
              <HeartHandshake className="w-10 h-10 text-[#6F4E37]" />
            </div>
            <h2 className="font-serif text-3xl font-black italic tracking-tight text-[#3A2C2C] mb-2">Thank You!</h2>
            <p className="text-[#6F4E37] font-medium mb-8">
              Your feedback means the world to us. <br/> We're so glad you visited!
            </p>
            <Link to="/menu">
              <Button className="w-full h-14 rounded-2xl bg-[#6F4E37] text-white hover:bg-[#3A2C2C] font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
                Back to Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-20">
      
      {/* Premium Header */}
      <header className="bg-[#3A2C2C] text-white py-10 px-6 relative overflow-hidden shadow-xl rounded-b-[2.5rem]">
        <div className="max-w-md mx-auto relative z-10 text-center">
          <Link to="/menu" className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-[#FFD6C9]/20 transition-colors text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-3xl font-black italic tracking-tight text-[#FFD6C9]">Feedback</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70 mt-2">
            We'd love to hear from you
          </p>
        </div>
        {/* Soft Peach Glow */}
        <div className="absolute -bottom-10 right-0 w-48 h-48 bg-[#FFD6C9]/10 rounded-full blur-[60px]" />
      </header>

      <main className="max-w-md mx-auto p-4 -mt-6 relative z-10">
        <Card className="rounded-[2.5rem] border-none shadow-[0_20px_60px_rgba(58,44,44,0.08)] bg-white overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Star Rating Section */}
              <div className="space-y-3 text-center bg-[#FDF8F7] p-6 rounded-[2rem] border border-[#F9E0E3]">
                <Label className="text-[11px] font-black uppercase tracking-widest text-[#6F4E37]">
                  How was your experience? <span className="text-[#9D4E5C]">*</span>
                </Label>
                <div className="flex items-center gap-1 justify-center pt-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (hoveredRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 active:scale-90 p-1"
                      >
                        <Star
                          className={cn(
                            'w-10 h-10 transition-all duration-300 drop-shadow-sm',
                            isActive 
                              ? 'fill-[#FFB26B] text-[#FFB26B]' // Golden Peach
                              : 'fill-[#F7F1F2] text-[#EBE1E3]'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37] pl-1">
                  Your Name <span className="text-[#A89699] font-normal lowercase tracking-normal text-xs">(optional)</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="h-14 rounded-2xl border-[#EBE1E3] bg-[#F7F1F2] focus-visible:ring-[#FFD6C9] font-medium text-[#3A2C2C] px-5"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37] pl-1">
                  Email <span className="text-[#A89699] font-normal lowercase tracking-normal text-xs">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-14 rounded-2xl border-[#EBE1E3] bg-[#F7F1F2] focus-visible:ring-[#FFD6C9] font-medium text-[#3A2C2C] px-5"
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37] pl-1">
                  Your Thoughts <span className="text-[#9D4E5C]">*</span>
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you love? How can we improve?"
                  rows={4}
                  required
                  className="min-h-[120px] rounded-2xl border-[#EBE1E3] bg-[#F7F1F2] focus-visible:ring-[#FFD6C9] font-medium text-[#3A2C2C] p-5 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-[2rem] bg-[#3A2C2C] text-white hover:bg-[#6F4E37] font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(58,44,44,0.15)] active:scale-95 transition-all"
                disabled={!comment.trim() || rating === 0 || submitFeedback.isPending}
              >
                <Send className="w-5 h-5 mr-2" />
                {submitFeedback.isPending ? 'Sending...' : 'Send Feedback'}
              </Button>
              
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}