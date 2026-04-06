import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Wallet, Store, QrCode, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderBillModal({ isOpen, onClose, total, cafeData }: any) {
  const [paymentView, setPaymentView] = useState<"options" | "upi">("options");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#FDF8F7] border-none rounded-[3rem] max-w-sm p-0 overflow-hidden shadow-2xl">
        <div className="bg-[#3A2C2C] p-8 flex flex-col items-center text-center">
          <div className="bg-[#8ED1B2] p-3 rounded-full mb-4 shadow-lg">
            <CheckCircle2 className="text-[#3A2C2C] w-8 h-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="font-serif italic text-3xl text-[#FDF8F7]">
              Order Placed!
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#FFD6C9] text-xs uppercase tracking-[0.2em] mt-2 font-bold">
            Kitchen is preparing your meal
          </p>
        </div>

        <div className="p-8 space-y-6">
          {paymentView === "options" ? (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-widest text-center mb-4">
                How would you like to pay?
              </p>
              
              {/* Click Counter -> Immediately goes to Receipt */}
              <button 
                onClick={onClose} 
                className="w-full p-5 rounded-[2rem] bg-white border-2 border-[#FFD6C9] flex items-center justify-between group hover:border-[#3A2C2C] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#FDF8F7] p-2 rounded-xl text-[#3A2C2C]">
                    <Store size={20} />
                  </div>
                  <span className="font-bold text-[#3A2C2C]">Pay at Counter</span>
                </div>
              </button>

              <button 
                onClick={() => setPaymentView("upi")}
                className="w-full p-5 rounded-[2rem] bg-[#3A2C2C] text-white flex items-center justify-between shadow-xl shadow-orange-100 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <QrCode size={20} />
                  </div>
                  <span className="font-bold">Instant UPI Scan</span>
                </div>
                <Wallet size={18} className="text-[#8ED1B2]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#FFD6C9] shadow-inner mb-4">
                {cafeData?.upi_qr_url ? (
                  <img src={cafeData.upi_qr_url} alt="UPI QR" className="w-44 h-44 object-contain" />
                ) : (
                  <div className="w-44 h-44 flex flex-col items-center justify-center text-[#6F4E37] opacity-50">
                    <QrCode size={48} />
                    <p className="text-[10px] mt-2">QR Loading...</p>
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <p className="text-[10px] font-mono text-[#6F4E37] uppercase mb-1">UPI ID</p>
                <p className="font-mono text-sm font-bold text-[#3A2C2C]">{cafeData?.upi_id || 'Not Set'}</p>
              </div>

              <button 
                onClick={() => setPaymentView("options")}
                className="flex items-center gap-2 text-[#6F4E37] text-xs font-bold hover:underline"
              >
                <X size={14} /> Back to options
              </button>
            </div>
          )}

          {/* Bottom Bar: Forces user to click "View Receipt" to trigger onClose */}
          <div className="pt-6 border-t border-dashed border-[#FFD6C9] flex justify-between items-center px-2">
            <div>
              <p className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-tighter opacity-70">Total Payable</p>
              <p className="text-3xl font-black text-[#3A2C2C]">₹{total}</p>
            </div>
            
            <Button 
              onClick={onClose}
              className="bg-[#8ED1B2] text-[#3A2C2C] hover:bg-[#FFD6C9] rounded-full px-6 h-12 font-black transition-colors flex items-center gap-2 shadow-lg"
            >
              Receipt <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}