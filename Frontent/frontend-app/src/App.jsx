import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateLivraison from "./pages/CreateLivraison.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Admin/CRUD Pages
import UsersList from "./pages/UsersList.jsx";
import UserForm from "./pages/UserForm.jsx";
import ParcelsList from "./pages/ParcelsList.jsx";
import ParcelForm from "./pages/ParcelForm.jsx";
import ColisDetail from "./pages/ColisDetail.jsx";
import ColisSuivi from "./pages/ColisSuivi.jsx";
import SendersList from "./pages/SendersList.jsx";
import SenderForm from "./pages/SenderForm.jsx";
import LivraisonDetail from "./pages/LivraisonDetail.jsx";
import LivraisonsList from "./pages/LivraisonsList.jsx";
import DestinatairesList from "./pages/DestinatairesList.jsx";
import DestinataireForm from "./pages/DestinataireForm.jsx";
import LivreursList from "./pages/LivreursList.jsx";
import LivreurForm from "./pages/LivreurForm.jsx";
import VehiculesList from "./pages/VehiculesList.jsx";
import VehiculeForm from "./pages/VehiculeForm.jsx";
import ProgressBarsDemo from "./pages/ProgressBarsDemo.jsx";
import VerifierColisPage from "./pages/VerifierColisPage.jsx";

function AppContent() {
  const location = useLocation();
  const hide =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen">
      {!hide && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Vérifier Colis - Public */}
          <Route path="/verifier-colis" element={<VerifierColisPage />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Users Management (Admin Only) */}
          <Route
            path="/users"
            element={
              <PrivateRoute requiredRoles={["ADMIN"]}>
                <UsersList />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <PrivateRoute requiredRoles={["ADMIN"]}>
                <UserForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN"]}>
                <UserForm />
              </PrivateRoute>
            }
          />

          {/* Parcels Management (Admin, Operateur) */}
          <Route
            path="/colis"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <ParcelsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/colis/new"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <ParcelForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/colis/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <ParcelForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/colis/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <ColisDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/colis/:id/suivi"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <ColisSuivi />
              </PrivateRoute>
            }
          />

          {/* Senders Management (Admin, Operateur) */}
          <Route
            path="/expediteurs"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <SendersList />
              </PrivateRoute>
            }
          />
          <Route
            path="/expediteurs/new"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <SenderForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/expediteurs/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <SenderForm />
              </PrivateRoute>
            }
          />

          {/* Recipients Management (Admin, Operateur) */}
          <Route
            path="/destinataires"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <DestinatairesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/destinataires/new"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <DestinataireForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/destinataires/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <DestinataireForm />
              </PrivateRoute>
            }
          />

          {/* Delivery Persons Management (Admin, Gestionnaire) */}
          <Route
            path="/livreurs"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <LivreursList />
              </PrivateRoute>
            }
          />
          <Route
            path="/livreurs/create"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <LivreurForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/livreurs/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <LivreurForm />
              </PrivateRoute>
            }
          />

          {/* Vehicles Management (Admin, Gestionnaire) */}
          <Route
            path="/vehicules"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <VehiculesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicules/create"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <VehiculeForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicules/edit/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "GESTIONNAIRE"]}>
                <VehiculeForm />
              </PrivateRoute>
            }
          />

          {/* Deliveries Management (Admin, Operateur, Livreur) */}
          <Route
            path="/livraisons"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <LivraisonsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/livraisons/new"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <CreateLivraison />
              </PrivateRoute>
            }
          />
          <Route
            path="/livraisons/:id"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR", "LIVREUR"]}>
                <LivraisonDetail />
              </PrivateRoute>
            }
          />

          {/* Progress Bars Demo */}
          <Route
            path="/progress-bars"
            element={
              <PrivateRoute requiredRoles={["ADMIN", "OPERATEUR"]}>
                <ProgressBarsDemo />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      {!hide && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
