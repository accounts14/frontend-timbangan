import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRealtimeWeight } from "@/hooks/useRealtimeWeight";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import HistoryPage from "@/pages/dashboard/History";
import AlertsPage from "@/pages/dashboard/Alerts";
import SettingsPage from "@/pages/dashboard/Settings";

function Shell() {
  // Single shared WS connection status for layout indicator
  const realtime = useRealtimeWeight();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AppLayout wsConnected={realtime.connected}>
            <Dashboard
              wsConnected={realtime.connected}
              latest={realtime.latest}
              settings={realtime.settings}
              lastAlert={realtime.lastAlert}
            />
          </AppLayout>
        }
      />
      <Route
        path="/history"
        element={
          <AppLayout wsConnected={realtime.connected}>
            <HistoryPage />
          </AppLayout>
        }
      />
      <Route
        path="/alerts"
        element={
          <AppLayout wsConnected={realtime.connected}>
            <AlertsPage />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <AppLayout wsConnected={realtime.connected}>
              <SettingsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
