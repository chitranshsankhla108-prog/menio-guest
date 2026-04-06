import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CafeProvider } from "./contexts/CafeContext";

// 1. IMMEDIATE LOAD: The landing page stays as a standard import
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";

// 2. LAZY LOAD: These heavy components load in the background only when needed
const PublicMenu = lazy(() => import("./components/customer/PublicMenu").then(module => ({ default: module.PublicMenu })));
const FeedbackForm = lazy(() => import("./components/customer/FeedbackForm").then(module => ({ default: module.FeedbackForm })));
const Receipt = lazy(() => import("./pages/Receipt"));

const queryClient = new QueryClient();

// 3. LOADING STATE: A simple, clean placeholder while the page "wakes up"
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDF8F7] animate-pulse">
    <div className="w-12 h-12 border-4 border-[#3A2C2C]/20 border-t-[#3A2C2C] rounded-full animate-spin mb-4" />
    <p className="text-[#3A2C2C] font-serif italic text-lg">Brewing your menu...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CafeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* 4. SUSPENSE: Wraps the lazy routes to handle the transition smoothly */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing page loads instantly */}
                <Route path="/" element={<Welcome />} />

                {/* These load on-demand */}
                <Route path="/menu" element={<PublicMenu />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/receipt" element={<Receipt />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CafeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;