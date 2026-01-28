import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import AddAccount from "./pages/AddAccount";
import AccountDetails from "./pages/AccountDetails";
import SetBudget from "./pages/SetBudget";
import SplashScreen from "./components/SplashScreen";
import Loader from "./components/Loader";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Profile from "./pages/Profile";

import FinanceChatBot from "./components/FinanceChatBot";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader /></div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <FinanceChatBot />
    </>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader /></div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/account/:id"
              element={
                <ProtectedRoute>
                  <AccountDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-account"
              element={
                <ProtectedRoute>
                  <AddAccount />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddTransaction />
                </ProtectedRoute>
              }
            />

            <Route
              path="/budget"
              element={
                <ProtectedRoute>
                  <SetBudget />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
