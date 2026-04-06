import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/hooks/useMenuItems';
import { toast } from 'sonner'; // Added for feedback

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  customerName: string;
  tableNumber: string;
  specialInstructions: string;
  
  // Actions
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setCustomerName: (name: string) => void;
  setTableNumber: (table: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  clearCart: () => void;
  
  // NEW: The Cafe Guard Action
  checkCafeMismatch: (currentCafeId: string) => void;
  
  // Getters
  getItemQuantity: (itemId: string) => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial State
      cart: [],
      customerName: '',
      tableNumber: '',
      specialInstructions: '',

      // ---------------- ACTIONS ----------------

      // Updated: Prevent adding items from a different cafe manually
      addToCart: (item) =>
        set((state) => {
          // Safety Check: If cart has items from a different cafe, clear it first
          if (state.cart.length > 0 && state.cart[0].menuItem.cafe_id !== item.cafe_id) {
            return { cart: [{ menuItem: item, quantity: 1 }] };
          }

          const existing = state.cart.find((c) => c.menuItem.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.menuItem.id === item.id 
                  ? { ...c, quantity: c.quantity + 1 } 
                  : c
              ),
            };
          }
          return { cart: [...state.cart, { menuItem: item, quantity: 1 }] };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.menuItem.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => c.menuItem.id !== itemId)
              : state.cart.map((c) =>
                  c.menuItem.id === itemId ? { ...c, quantity } : c
                ),
        })),

      setCustomerName: (name) => set({ customerName: name }),

      setTableNumber: (table) => set({ tableNumber: table }),

      setSpecialInstructions: (instructions) => set({ specialInstructions: instructions }),

      clearCart: () => set({ 
        cart: [], 
        customerName: '', 
        tableNumber: '', 
        specialInstructions: '' 
      }),

      // --- NEW: LOGIC TO DETECT CAFE SWITCH ---
      checkCafeMismatch: (currentCafeId) => {
        const { cart, clearCart } = get();
        if (cart.length > 0) {
          const cartCafeId = cart[0].menuItem.cafe_id;
          if (cartCafeId !== currentCafeId) {
            console.warn("Cafe mismatch detected. Wiping cart.");
            clearCart();
            toast.info("Cart Reset", { 
              description: "You've switched cafes, so your cart has been cleared." 
            });
          }
        }
      },

      // ---------------- GETTERS ----------------

      getItemQuantity: (itemId) => {
        const cartItem = get().cart.find((c) => c.menuItem.id === itemId);
        return cartItem?.quantity || 0;
      },

      getCartTotal: () => {
        const total = get().cart.reduce(
          (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
          0
        );
        return total;
      },

      getCartItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'menio-cart',
    }
  )
);