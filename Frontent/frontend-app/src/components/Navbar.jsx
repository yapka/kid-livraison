import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  Search,
  Bell,
  ChevronDown,
  Box,
  Users,
  UserCircle,
  MapPin,
  PlusCircle,
  Send,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (!isAuthenticated) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <nav className="px-4 lg:px-6 py-3">
          <div className="flex justify-between items-center mx-auto max-w-7xl">
            <NavLink to="/" className="flex items-center gap-3 group">
              <img
                src="/logo-kid.jpg"
                alt="KID Distribution Logo"
                className="w-12 h-12 object-contain rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                KID Distribution
              </span>
            </NavLink>
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </NavLink>
              <NavLink
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                S'inscrire
              </NavLink>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="px-4 lg:px-6 py-2.5">
        <div className="flex items-center justify-between mx-auto max-w-7xl gap-4">
          {/* Logo et Marque */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <img
              src="/logo-kid.jpg"
              alt="KID Distribution Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden lg:block">
              KID Distribution
            </span>
          </NavLink>

          {/* Navigation Desktop - Centrée */}

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-3xl">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </NavLink>

            {/* Dropdown Colis */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                type="button"
              >
                <Box className="w-4 h-4" />
                <span>Colis</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-50">
                <NavLink
                  to="/colis"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 w-full text-left rounded-t-lg font-medium transition-all ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <Box className="w-4 h-4" />
                  <span>Liste des colis</span>
                </NavLink>
                <NavLink
                  to="/colis/new"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 w-full text-left font-medium transition-all ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nouveau colis</span>
                </NavLink>
                <NavLink
                  to="/verifier-colis"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 w-full text-left rounded-b-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-primary hover:bg-primary/10 hover:text-primary-800"
                    }`
                  }
                >
                  <Search className="w-4 h-4" />
                  <span>Vérifier colis</span>
                </NavLink>
              </div>
            </div>

            <NavLink
              to="/expediteurs"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Send className="w-4 h-4" />
              <span>Expéditeurs</span>
            </NavLink>

            <NavLink
              to="/destinataires"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <MapPin className="w-4 h-4" />
              <span>Destinataires</span>
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Users className="w-4 h-4" />
                <span>Utilisateurs</span>
              </NavLink>
            )}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Recherche (Desktop uniquement) */}
            <div className="hidden 2xl:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-48 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
              title="Notifications (à venir)"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Menu Utilisateur */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.username?.slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.username || "Utilisateur"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role || "Opérateur"}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform hidden xl:block ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.username || "Utilisateur"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {user?.email || user?.role}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Mon profil</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-gray-200 pt-3 animate-in slide-in-from-top duration-200">
            {/* Recherche Mobile */}
            <div className="px-2 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="space-y-1 px-2">
              <NavLink
                to="/dashboard"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span>Accueil</span>
              </NavLink>

              <NavLink
                to="/colis/new"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <PlusCircle className="w-5 h-5" />
                <span>Nouveau colis</span>
              </NavLink>

              <NavLink
                to="/colis"
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Box className="w-5 h-5" />
                <span>Liste des colis</span>
              </NavLink>

              <NavLink
                to="/expediteurs"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Send className="w-5 h-5" />
                <span>Expéditeurs</span>
              </NavLink>

              <NavLink
                to="/destinataires"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <MapPin className="w-5 h-5" />
                <span>Destinataires</span>
              </NavLink>

              {user?.role === "ADMIN" && (
                <NavLink
                  to="/users"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Users className="w-5 h-5" />
                  <span>Utilisateurs</span>
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
