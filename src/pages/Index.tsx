import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Index = () => {
  const [cafeCode, setCafeCode] = useState("");
  const navigate = useNavigate();

  const handleJoinCafe = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Log to see if the button is even working
    console.log("Button clicked! Input value:", cafeCode);

    const cleanCode = cafeCode.trim().toLowerCase();

    if (!cleanCode) {
      toast.error("Please enter a cafe code");
      return;
    }

    // 2. Clear anything old and set the new one
    localStorage.removeItem("cafe_code"); 
    localStorage.setItem("cafe_code", cleanCode);
    
    // 3. Verify it was saved
    const savedCode = localStorage.getItem("cafe_code");
    console.log("Verified Save in Storage:", savedCode);

    if (savedCode === cleanCode) {
      toast.success(`Entering ${cleanCode}...`);
      navigate("/menu");
    } else {
      toast.error("Storage Error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md w-full animate-in fade-in duration-500">
        
        {/* LOGO BOX */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-orange-600 mb-6 shadow-xl shadow-orange-100">
          <Coffee className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-1">Menio</h1>
        <p className="text-muted-foreground mb-10 text-[10px] font-bold uppercase tracking-[0.25em]">Your Digital Cafe Hub</p>

        {/* INPUT FORM */}
        <form onSubmit={handleJoinCafe} className="bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-sm mb-8 space-y-4">
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 ml-1">Enter Cafe Code</p>
            <Input 
              type="text"
              value={cafeCode}
              onChange={(e) => setCafeCode(e.target.value)}
              placeholder="e.g. jodhpur-cafe" 
              className="h-12 rounded-xl text-center font-bold text-lg border-2 border-orange-50 focus-visible:ring-orange-500 bg-orange-50/20"
            />
          </div>
          <Button type="submit" variant="cafe" className="w-full h-12 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
            Open Menu
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* STAFF SHORTCUT */}
        <div className="flex flex-col gap-4">
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed opacity-20" /></div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em]"><span className="bg-background px-4 text-muted-foreground/50">Staff Only</span></div>
          </div>

          <Link to="/staff" className="w-full">
            <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
              <Store className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <p className="mt-16 text-[9px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">Made in Jodhpur</p>
      </div>
    </div>
  );
};

export default Index;