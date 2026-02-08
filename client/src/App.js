import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./components/Loader";
import SplashScreen from "./components/SplashScreen";
import FinanceChatBot from "./components/FinanceChatBot";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddTransaction = lazy(() => import("./pages/AddTransaction"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AddAccount = lazy(() => import("./pages/AddAccount"));
const AccountDetails = lazy(() => import("./pages/AccountDetails"));
const SetBudget = lazy(() => import("./pages/SetBudget"));
const Profile = lazy(() => import("./pages/Profile"));
const Goals = lazy(() => import("./pages/Goals"));
const AddGoal = lazy(() => import("./pages/AddGoal"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const EditGoal = lazy(() => import("./pages/EditGoal"));
const RecurringTransactions = lazy(() => import("./pages/RecurringTransactions"));
const AddRecurringTransaction = lazy(() => import("./pages/AddRecurringTransaction"));
const ReceiptScanner = lazy(() => import("./pages/ReceiptScanner"));
const ReceiptGallery = lazy(() => import("./pages/ReceiptGallery"));
const ReceiptDetail = lazy(() => import("./pages/ReceiptDetail"));

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

// Loading fallback component
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-black">
    <Loader />
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <Suspense fallback={<PageLoader />}>
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

              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add-goal"
                element={
                  <ProtectedRoute>
                    <AddGoal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/goal/:id"
                element={
                  <ProtectedRoute>
                    <GoalDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-goal/:id"
                element={
                  <ProtectedRoute>
                    <EditGoal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recurring"
                element={
                  <ProtectedRoute>
                    <RecurringTransactions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add-recurring"
                element={
                  <ProtectedRoute>
                    <AddRecurringTransaction />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/scan-receipt"
                element={
                  <ProtectedRoute>
                    <ReceiptScanner />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/receipts"
                element={
                  <ProtectedRoute>
                    <ReceiptGallery />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/receipts/:id"
                element={
                  <ProtectedRoute>
                    <ReceiptDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;
