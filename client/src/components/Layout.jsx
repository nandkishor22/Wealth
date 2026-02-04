import FloatingBackground from "./FloatingBackground";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt, FaPlus } from "react-icons/fa";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-emerald-500/30">
      <FloatingBackground />

      <div className="relative z-10 px-4 py-6 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 glass-panel p-4 rounded-2xl sticky top-4 z-50">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20"
            >
              W
            </motion.div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-emerald-200 transition-all">
              Wealth
            </span>
          </Link>

          <div>
            {!user ? (
              <div className="flex gap-4">
                <Link to="/login">
                  <button className="bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md px-5 py-2 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/10 text-sm md:text-base">
                    Log In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 text-sm md:text-base">
                    Sign Up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/goals">
                  <button className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 active:scale-95 text-sm">
                    🎯 Goals
                  </button>
                </Link>
                <Link to="/add">
                  {/* Desktop Button */}
                  <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2 rounded-full font-medium shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95">
                    <FaPlus size={14} /> Add
                  </button>
                  {/* Mobile Button */}
                  <button className="flex sm:hidden items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 w-9 h-9 rounded-full font-medium shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95">
                    <FaPlus size={14} />
                  </button>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 bg-white/5 p-1 pr-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{(user.name || 'User').split(' ')[0]}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="p-2 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <FaSignOutAlt size={16} />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="min-h-[80vh]">
          {children}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm py-6 border-t border-white/5">
          <p>© 2026 Wealth App. Powered by Advanced Agentic AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
