import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Coffee, 
  Cookie, 
  UtensilsCrossed, 
  MessageSquare, 
  ChevronDown, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Loader2, 
  LayoutDashboard,
  ImageIcon,
  Search,
  X,
  BadgeCheck,
  Menu as MenuIcon 
} from 'lucide-react';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { useCreateOrder, OrderItem } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCafe } from '@/contexts/CafeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { InstallBanner } from '@/components/customer/InstallBanner';
import { OrderBillModal } from './OrderBillModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// FIX 1: Changed to Record<string, ...> to support dynamic custom categories
const categoryIcons: Record<string, React.ElementType> = {
  Drinks: Coffee,
  Snacks: Cookie,
  Meals: UtensilsCrossed,
};

const categoryEmojis: Record<string, string> = {
  Drinks: '☕',
  Snacks: '🍪',
  Meals: '🍛',
};

export function PublicMenu() {
  const navigate = useNavigate();
  const { data: menuItems = [], isLoading } = useMenuItems();
  const createOrder = useCreateOrder();
  const { isStaff } = useAuth();
  const { cafe, isLoading: cafeLoading } = useCafe();
  const { t } = useLanguage();
  
  const { 
    cart, 
    customerName, 
    specialInstructions,
    tableNumber,
    addToCart, 
    updateQuantity, 
    setCustomerName, 
    setSpecialInstructions,
    setTableNumber,
    clearCart, 
    getItemQuantity, 
    getCartTotal, 
    getCartItemCount,
    checkCafeMismatch
  } = useCart();

  // FIX 2: Generate Dynamic Categories straight from the database
  const dynamicCategories = useMemo(() => {
    const fetchedCategories = menuItems.map(item => item.category);
    // Keep the main 3 at the top, then append any custom ones
    const combined = Array.from(new Set(['Drinks', 'Snacks', 'Meals', ...fetchedCategories]));
    return combined.filter(Boolean); 
  }, [menuItems]);
  
  // Start with empty array, then expand all once categories load
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // States for the Bill Modal & Receipt Transition
  const [isOrderDone, setIsOrderDone] = useState(false);
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);
  const [placedOrderData, setPlacedOrderData] = useState<any>(null);

  useEffect(() => {
    if (!cafeLoading && !cafe) {
      navigate('/', { replace: true });
    }
  }, [cafe, cafeLoading, navigate]);

  useEffect(() => {
    if (cafe?.id) {
      checkCafeMismatch(cafe.id);
    }
  }, [cafe?.id, checkCafeMismatch]);

  // Auto-expand all dynamic categories when they load
  useEffect(() => {
    if (dynamicCategories.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories(dynamicCategories);
    }
  }, [dynamicCategories, expandedCategories.length]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const query = searchQuery.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query))
    );
  }, [menuItems, searchQuery]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const scrollToCategory = (cat: string) => {
    setIsCategoryMenuOpen(false);
    
    if (!expandedCategories.includes(cat)) {
      setExpandedCategories((prev) => [...prev, cat]);
    }

    setTimeout(() => {
      const element = document.getElementById(`category-${cat}`);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const cartTotal = getCartTotal();
  const cartItemCount = getCartItemCount();

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (!tableNumber.trim()) {
      toast.error("Table Number Required", {
        description: "Please enter your table number to place the order."
      });
      return;
    }

    const orderItems: OrderItem[] = cart.map((c) => ({
      id: c.menuItem.id,
      name: c.menuItem.name,
      price: Number(c.menuItem.price),
      quantity: c.quantity,
    }));

    createOrder.mutate(
      { 
        items: orderItems, 
        total_price: cartTotal,
        customer_name: customerName.trim() || undefined,
        table_number: tableNumber.trim(),
        special_instructions: specialInstructions?.trim() || undefined,
      },
      { 
        onSuccess: (data) => {
          const orderData = {
            id: data.id,
            customer_name: data.customer_name,
            table_number: tableNumber,
            items: orderItems,
            total_price: cartTotal,
            created_at: data.created_at,
            special_instructions: specialInstructions,
          };
          
          setPlacedOrderData(orderData);
          setPlacedOrderTotal(cartTotal);
          setIsOrderDone(true);
          
          setCartOpen(false);
          clearCart();
          
          toast.success(t('order.placed') || 'Order Placed!', {
            description: t('order.showAtCounter') || 'Show this at the counter',
            duration: 3000,
          });
        } 
      }
    );
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'Drinks': return t('menu.drinks') || 'Drinks';
      case 'Snacks': return t('menu.snacks') || 'Snacks';
      case 'Meals': return t('menu.meals') || 'Meals';
      default: return cat; // Returns custom category name directly
    }
  };

  if (isLoading || cafeLoading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#6F4E37]/50" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6F4E37]">Loading Menu</p>
      </div>
    );
  }

  if (!cafe) return null;
  const canOrder = !isStaff;

  return (
    <div className="min-h-screen bg-[#F4EDE4] pb-36 relative">
      
      {/* COCOA HEADER SECTION */}
      <header className="bg-[#3A2C2C] text-white py-12 px-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-4 left-4 z-20">
          <LanguageToggle />
        </div>
        
        {isStaff && (
          <Link 
            to="/staff" 
            className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-colors hover:bg-[#FFD6C9]/20 hover:text-[#FFD6C9] z-20 text-[#F4EDE4]"
          >
            <LayoutDashboard className="w-3.5 h-3.5 inline-block mr-1.5 mb-0.5" />
            Dashboard
          </Link>
        )}
        
        <div className="max-w-lg mx-auto text-center relative z-10 pt-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-[#F4EDE4]/10 backdrop-blur-2xl mb-5 border border-[#F4EDE4]/10 shadow-2xl overflow-hidden">
            {cafe.logo_url ? (
              <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover" />
            ) : (
              <Coffee className="w-10 h-10 text-[#FFD6C9]/90" />
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase italic font-serif text-[#F4EDE4]">{cafe.name}</h1>
          <p className="text-[#FFD6C9]/60 text-[9px] uppercase tracking-[0.4em] font-bold">
            {t('app.tagline')}
          </p>
        </div>
        
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#FFD6C9]/10 rounded-full blur-[80px]" />
      </header>

      {/* STICKY SEARCH BAR */}
      <div className="sticky top-0 z-30 bg-[#F4EDE4]/90 backdrop-blur-xl px-4 py-4 max-w-lg mx-auto">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/60 pointer-events-none" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our menu..."
            className="pl-12 pr-10 h-14 rounded-[1.5rem] bg-white border-none shadow-[0_10px_30px_rgba(111,78,55,0.06)] focus-visible:ring-2 focus-visible:ring-[#FFD6C9] text-sm font-semibold text-[#3A2C2C] placeholder:text-[#6F4E37]/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-[#F9E0E3] rounded-full hover:bg-[#FFD6C9] transition-colors"
            >
              <X className="w-3 h-3 text-[#6F4E37]" />
            </button>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-8">
        {dynamicCategories.map((cat) => {
          const items = filteredMenuItems.filter((item) => item.category === cat);
          const isExpanded = expandedCategories.includes(cat);

          if (items.length === 0) return null;

          return (
            <div key={cat} id={`category-${cat}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 pt-2">
              
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between py-2 group"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-[11px] font-black text-[#6F4E37] uppercase tracking-[0.3em]">{getCategoryLabel(cat)}</h2>
                  <div className="h-[1px] w-12 bg-[#F9E0E3] group-hover:bg-[#FFD6C9] group-hover:w-24 transition-all duration-300" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-[#6F4E37] font-bold uppercase tracking-widest">{items.length} {t('menu.available') || 'Available'}</span>
                  <ChevronDown className={cn('w-4 h-4 text-[#6F4E37] transition-transform duration-300', isExpanded && 'rotate-180')} />
                </div>
              </button>

              {isExpanded && (
                <div className="grid grid-cols-1 gap-4">
                  {items.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    const isSoldOut = !item.is_available;
                    // FIX: Safe fallback to Coffee icon if custom category doesn't have an icon
                    const ItemIcon = categoryIcons[item.category] || Coffee;
                    
                    return (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "overflow-hidden rounded-[2.2rem] border-none transition-all duration-300 active:scale-[0.97] bg-white shadow-[0_15px_40px_rgba(58,44,44,0.03)]",
                          isSoldOut && "opacity-50 grayscale"
                        )}
                      >
                        <CardContent className="p-0">
                          <div className="flex h-24">
                            
                            <div className="w-24 h-full bg-[#F9E0E3]/50 shrink-0 relative overflow-hidden">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#FFD6C9]">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                              
                              {isSoldOut && (
                                <div className="absolute inset-0 bg-[#3A2C2C]/50 flex items-center justify-center backdrop-blur-[2px]">
                                  <span className="text-[8px] font-black text-[#3A2C2C] uppercase tracking-widest bg-[#FFD6C9] px-2.5 py-1 rounded-md">Sold Out</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-bold text-sm truncate text-[#3A2C2C] leading-tight font-serif italic tracking-wide">{item.name}</h3>
                                  <ItemIcon className="w-3.5 h-3.5 text-[#F9E0E3] shrink-0" />
                                </div>
                                {item.description && (
                                  <p className="text-[10px] text-[#6F4E37] line-clamp-1 mt-1 font-medium italic">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-end justify-between mt-auto">
                                <p className="font-black text-[15px] text-[#6F4E37] tracking-tighter">₹{item.price}</p>
                                
                                {!isSoldOut && canOrder && (
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {quantity > 0 ? (
                                      <div className="flex items-center gap-2 bg-[#F9E0E3]/40 p-1 rounded-full border border-[#F9E0E3]">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white" onClick={() => updateQuantity(item.id, quantity - 1)}>
                                          <Minus className="w-3 h-3 text-[#3A2C2C]" />
                                        </Button>
                                        <span className="w-4 text-center font-black text-xs text-[#3A2C2C]">{quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-[#6F4E37] text-white hover:bg-[#3A2C2C]" onClick={() => addToCart(item)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button variant="outline" size="sm" className="h-8 px-5 rounded-full text-[10px] font-black uppercase tracking-widest border-[#F9E0E3] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition-all shadow-sm" onClick={() => addToCart(item)}>
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredMenuItems.length === 0 && searchQuery && (
          <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-[#F9E0E3]">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#6F4E37]" />
            <p className="font-bold text-[#6F4E37] uppercase tracking-wider text-xs">Nothing found for "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* --- ZOMATO STYLE FAB (FLOATING MENU BUTTON) --- */}
      <div className="fixed bottom-28 right-4 z-40 pointer-events-none w-full max-w-lg mx-auto flex justify-end px-4">
        <Button
          onClick={() => setIsCategoryMenuOpen(true)}
          className="rounded-full shadow-[0_10px_30px_rgba(58,44,44,0.3)] bg-[#3A2C2C] text-[#F4EDE4] hover:bg-[#6F4E37] px-5 h-12 font-black tracking-widest uppercase text-[10px] pointer-events-auto border border-[#FFD6C9]/20 transition-transform active:scale-95"
        >
          <MenuIcon className="w-4 h-4 mr-2 text-[#FFD6C9]" />
          Menu
        </Button>
      </div>

      {/* --- ZOMATO STYLE MENU POPUP --- */}
      <Dialog open={isCategoryMenuOpen} onOpenChange={setIsCategoryMenuOpen}>
        <DialogContent className="w-[260px] rounded-2xl bg-[#3A2C2C]/95 backdrop-blur-xl border border-white/10 p-2 mb-28 fixed bottom-0 top-auto right-4 left-auto shadow-2xl">
          <div className="flex flex-col">
            {dynamicCategories.map((cat) => {
              const count = menuItems.filter(i => i.category === cat).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className="flex justify-between items-center py-3 px-4 hover:bg-white/10 rounded-xl transition-colors text-left"
                >
                  <span className="font-bold text-sm tracking-wide text-[#F4EDE4]">{cat}</span>
                  <span className="font-black text-xs text-[#FFD6C9] bg-[#FFD6C9]/10 px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* FIXED BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#F4EDE4] via-[#F4EDE4]/95 to-transparent z-40 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link to="/feedback" className="flex-[0.8]">
            <Button variant="outline" className="w-full h-14 rounded-[1.5rem] bg-white border-none shadow-[0_8px_30px_rgba(111,78,55,0.08)] text-[11px] font-black uppercase tracking-widest text-[#6F4E37] hover:text-[#3A2C2C]">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Link>
          
          {canOrder && (
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="flex-[2] relative rounded-[1.5rem] h-14 bg-[#6F4E37] text-white font-black text-sm shadow-[0_10px_40px_rgba(111,78,55,0.25)] hover:bg-[#3A2C2C] transition-all active:scale-95">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Review Bag
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-[#FFD6C9] text-[#3A2C2C] text-[10px] font-black border-2 border-[#6F4E37] rounded-full">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] p-0 shadow-2xl overflow-hidden border-none bg-white">
                
                <div className="max-w-2xl mx-auto w-full h-full flex flex-col bg-white">
                  <SheetHeader className="p-8 pb-4 text-center bg-white z-10">
                    <div className="w-12 h-1.5 bg-[#F9E0E3] rounded-full mx-auto mb-6" />
                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic font-serif text-[#3A2C2C]">Your Selection</SheetTitle>
                  </SheetHeader>
                  
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4">
                      <ShoppingCart className="w-14 h-14 text-[#6F4E37]" />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#6F4E37]">Bag is empty</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
                        {cart.map((item) => (
                          <div key={item.menuItem.id} className="flex items-center justify-between p-5 bg-[#F9E0E3]/30 rounded-[2rem] border-none">
                             <div className="flex-1 min-w-0 pr-4">
                                <h4 className="font-bold text-sm truncate uppercase tracking-tight text-[#3A2C2C]">{item.menuItem.name}</h4>
                                <p className="text-[#6F4E37] font-bold text-xs mt-1">₹{item.menuItem.price} × {item.quantity}</p>
                             </div>
                             <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-[#F9E0E3]">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}>
                                  <Minus className="w-3 h-3 text-[#3A2C2C]" />
                                </Button>
                                <span className="font-black text-sm w-4 text-center text-[#3A2C2C]">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[#6F4E37] text-white hover:bg-[#3A2C2C]" onClick={() => addToCart(item.menuItem)}>
                                  <Plus className="w-3 h-3" />
                                </Button>
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-white border-t border-[#F9E0E3] shadow-[0_-20px_40px_rgba(58,44,44,0.03)] z-10 pb-10">
                         <div className="grid grid-cols-4 gap-4 mb-5">
                            <div className="col-span-1 space-y-2">
                              <Label className="text-[9px] font-black uppercase tracking-widest text-[#6F4E37] pl-2">Table</Label>
                              <Input 
                                value={tableNumber} 
                                onChange={(e) => setTableNumber(e.target.value)} 
                                placeholder="0" 
                                className="h-14 rounded-2xl text-center font-black text-xl border-none bg-[#F4EDE4] focus-visible:ring-2 focus-visible:ring-[#FFD6C9] text-[#3A2C2C]" 
                              />
                            </div>
                            <div className="col-span-3 space-y-2">
                              <Label className="text-[9px] font-black uppercase tracking-widest text-[#6F4E37] pl-2">Guest Name</Label>
                              <Input 
                                value={customerName} 
                                onChange={(e) => setCustomerName(e.target.value)} 
                                placeholder="Full Name" 
                                className="h-14 rounded-2xl font-bold text-sm px-5 border-none bg-[#F4EDE4] focus-visible:ring-2 focus-visible:ring-[#FFD6C9] text-[#3A2C2C]" 
                              />
                            </div>
                         </div>
                         
                         <div className="space-y-2 mb-6">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-[#6F4E37] pl-2">Special Notes</Label>
                            <textarea 
                              value={specialInstructions} 
                              onChange={(e) => setSpecialInstructions(e.target.value)} 
                              placeholder="Example: Less sugar, extra spicy..." 
                              className="w-full min-h-[80px] p-4 text-xs rounded-2xl border-none bg-[#F4EDE4] outline-none focus:ring-2 focus:ring-[#FFD6C9] font-semibold leading-relaxed resize-none text-[#3A2C2C]" 
                            />
                         </div>

                         <div className="flex justify-between items-center py-5 border-y border-[#F9E0E3] mb-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37]">Total</span>
                           <span className="text-4xl font-black text-[#3A2C2C] tracking-tighter">₹{cartTotal}</span>
                         </div>

                         <Button 
                           onClick={handlePlaceOrder} 
                           className="w-full h-16 rounded-[2rem] bg-[#3A2C2C] text-white text-lg font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:bg-[#6F4E37]" 
                           disabled={createOrder.isPending}
                         >
                           {createOrder.isPending ? 'Processing...' : 'Confirm Order'}
                         </Button>
                         <p className="text-[9px] text-center text-[#6F4E37] font-bold uppercase tracking-[0.3em] pt-4 flex items-center justify-center">
                           <BadgeCheck className="w-3 h-3 mr-1.5" />
                           {t('cart.payAtCounter') || 'Pay at Counter'}
                         </p>
                      </div>
                    </div>
                  )}
                </div>

              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <InstallBanner />

      {/* The Payment Modal -> Proceeds to Receipt when closed */}
      <OrderBillModal 
        isOpen={isOrderDone} 
        onClose={() => {
          setIsOrderDone(false);
          if (placedOrderData) {
            navigate('/receipt', { state: { order: placedOrderData } });
          }
        }} 
        total={placedOrderTotal}
        cafeData={{
          name: cafe.name,
          upi_id: (cafe as any).upi_id,
          upi_qr_url: (cafe as any).upi_qr_url
        }}
      />

      {isStaff && (
        <footer className="fixed bottom-24 left-0 right-0 text-center z-30">
          <Link 
            to="/staff" 
            className="text-[9px] text-[#6F4E37] hover:text-[#3A2C2C] transition-colors font-black uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm"
          >
            Admin Access
          </Link>
        </footer>
      )}
    </div>
  );
}