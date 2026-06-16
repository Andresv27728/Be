import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import Connect from "@/pages/connect";
import Sidebar from "@/components/sidebar";
import AnimatedBackground from "@/components/animated-background";
import { motion, AnimatePresence } from "framer-motion";

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="flex-1 flex flex-col min-h-screen relative z-10"
  >
    {children}
  </motion.div>
);

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden relative">
      <AnimatedBackground />
      <Sidebar />
      
      <main className="flex-1 overflow-auto pt-16 md:pt-0 relative z-10">
        <AnimatePresence mode="wait">
          <Switch key={location} location={location}>
            <Route path="/">
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            </Route>
            <Route path="/dashboard">
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            </Route>
            <Route path="/chat">
              <PageWrapper>
                <Chat />
              </PageWrapper>
            </Route>
            <Route path="/admin">
              <PageWrapper>
                <Admin />
              </PageWrapper>
            </Route>
            <Route path="/connect">
              <PageWrapper>
                <Connect />
              </PageWrapper>
            </Route>
            <Route>
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
