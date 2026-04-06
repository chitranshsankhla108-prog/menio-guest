import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Coffee, CheckCircle, LayoutDashboard, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { OrderItem } from '@/hooks/useOrders';

interface OrderData {
  id: string;
  customer_name: string | null;
  items: OrderItem[];
  total_price: number;
  created_at: string;
  order_number: string | null;
  table_number: string;
  special_instructions: string | null;
}

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isStaff } = useAuth();
  const { clearCart } = useCart();
  const order = location.state?.order as OrderData | undefined;

  useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [order, clearCart]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F6EFE8] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm rounded-[2rem] border-none shadow-[0_20px_60px_rgba(58,44,44,0.08)] bg-white">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-[#F6EFE8]/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F6EFE8]">
               <Coffee className="w-8 h-8 text-[#6F4E37]" />
            </div>
            <p className="text-[#6F4E37] font-bold mb-6">No order found</p>
            <Button className="rounded-xl px-8 bg-[#6F4E37] text-white hover:bg-[#3A2C2C]" onClick={() => navigate('/menu')}>
              Go to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayId = order.order_number || order.id.slice(0, 6).toUpperCase();
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#F6EFE8]">
      {/* Header */}
      <header className="bg-[#3A2C2C] text-white py-8 px-4 relative shadow-[0_15px_40px_rgba(58,44,44,0.15)] overflow-hidden">
        {isStaff && (
          <Link 
            to="/staff" 
            className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-[#F6EFE8]/20 hover:text-[#F6EFE8] px-3 py-2 rounded-xl text-sm font-bold backdrop-blur-md transition-all text-[#F6EFE8] z-20"
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('nav.dashboard')}
          </Link>
        )}
        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md mb-3 border border-white/10">
            <Coffee className="w-7 h-7 text-[#F6EFE8]" />
          </div>
          <h1 className="font-serif text-2xl font-black tracking-tighter italic text-[#F6EFE8]">{t('app.name')}</h1>
          <p className="text-[#F6EFE8]/60 text-[9px] uppercase tracking-[0.4em] font-bold mt-1">{t('app.tagline')}</p>
        </div>
        
        {/* Soft Peach Glow in Header */}
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#F6EFE8]/10 rounded-full blur-[60px]" />
      </header>

      <main className="max-w-lg mx-auto p-4 -mt-6">
        <Card className="shadow-[0_30px_60px_rgba(58,44,44,0.12)] rounded-[2.5rem] overflow-hidden border-none bg-white animate-in fade-in zoom-in duration-700">
          <CardContent className="p-0">
            
            {/* Success Header (Peach Cream) */}
            <div className="bg-[#F6EFE8] text-[#3A2C2C] p-8 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/40 backdrop-blur-md mb-4 border border-white/50 shadow-sm">
                  {/* Mint Accent Checkmark */}
                  <CheckCircle className="w-10 h-10 text-[#8ED1B2]" />
                </div>
                <h2 className="font-serif text-3xl font-black mb-1 italic tracking-tight text-[#3A2C2C]">{t('order.placed')}</h2>
                <p className="text-[#6F4E37] text-xs font-bold uppercase tracking-widest mt-2">{t('order.thankYou')}</p>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/30 rounded-full blur-2xl" />
            </div>

            {/* Table & Special Instructions Section */}
            <div className="p-6 border-b border-dashed border-[#F6EFE8] bg-[#F6EFE8]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37]">Table Number</p>
                  <p className="text-4xl font-black text-[#3A2C2C]">#{order.table_number}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37]">Order Ref</p>
                  <p className="text-lg font-bold text-[#3A2C2C]">#{displayId}</p>
                </div>
              </div>

              {order.special_instructions && (
                <div className="bg-white p-4 rounded-2xl border border-[#F6EFE8] shadow-sm mt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8ED1B2] mb-1.5 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" /> Note for Kitchen
                  </p>
                  <p className="text-sm font-bold italic text-[#3A2C2C] leading-relaxed">
                    "{order.special_instructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Order Items Summary */}
            <div className="p-6 border-b border-[#F6EFE8]">
              <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-[#6F4E37] mb-5">
                Order Summary
              </h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F6EFE8]/50 flex items-center justify-center text-xs font-black text-[#6F4E37] border border-[#F6EFE8]">
                         {item.quantity}x
                      </div>
                      <span className="font-bold text-sm text-[#3A2C2C]">{item.name}</span>
                    </div>
                    <span className="font-black text-sm text-[#6F4E37]">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-dashed border-[#F6EFE8] flex justify-between items-center">
                <span className="font-black text-[10px] uppercase tracking-widest text-[#6F4E37]">Total Amount</span>
                <span className="font-serif text-4xl font-black text-[#3A2C2C] tracking-tighter italic">
                  ₹{order.total_price}
                </span>
              </div>
            </div>

            {/* Footer Instructions */}
            <div className="p-8 text-center space-y-5 bg-white">
              <div className="space-y-2">
                <p className="font-black text-[#3A2C2C] text-lg leading-tight">
                  Order is being prepared!
                </p>
                <p className="text-xs text-[#6F4E37] font-bold px-4">
                  Please show this digital bill at the counter for payment.
                </p>
              </div>
              
              <Button
                className="w-full rounded-[1.5rem] h-16 font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(111,78,55,0.2)] bg-[#6F4E37] text-white hover:bg-[#3A2C2C] active:scale-95 transition-all"
                onClick={() => navigate('/menu')}
              >
                {t('order.orderMore')}
              </Button>
              
              <p className="text-[9px] font-black text-[#6F4E37]/40 uppercase tracking-[0.3em]">
                Ordered at {orderTime}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}