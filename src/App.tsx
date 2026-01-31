import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./app/pages/auth/Login";
import Dashboard from "./app/pages/dashboard/Dashboard";
import NotFound from "./app/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Future CRM modules */}
          <Route path="/clients" element={<Dashboard />} />
          <Route path="/opportunities" element={<Dashboard />} />
          <Route path="/quotes" element={<Dashboard />} />
          <Route path="/orders" element={<Dashboard />} />
          <Route path="/invoices" element={<Dashboard />} />
          <Route path="/campaigns" element={<Dashboard />} />
          <Route path="/leads" element={<Dashboard />} />
          <Route path="/products" element={<Dashboard />} />
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/calendar" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
