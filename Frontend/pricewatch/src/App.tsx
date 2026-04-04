import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/context/DataContext";
import AppSidebar from "@/components/AppSidebar";
import { DemoControls } from "@/components/DemoControls";
import AIRecommender from "@/pages/AIRecommender";
import Dashboard from "@/pages/Dashboard";
import LivePrices from "@/pages/LivePrices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DataProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />

              <div className="ml-60 flex-1 flex flex-col p-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/live-prices" element={<LivePrices />} />
                  <Route path="/ai-recommender" element={<AIRecommender />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>

            <DemoControls />
          </DataProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;