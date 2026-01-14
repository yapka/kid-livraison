import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../contexts/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { handleError } = useErrorHandler();
  const toast = useToast();

  // Rediriger si déjà authentifié
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      toast.success("Connexion réussie !");
      navigate("/dashboard"); // Redirect to dashboard on successful login
    } catch (err) {
      // Utiliser le gestionnaire d'erreurs centralisé
      const enrichedError = handleError(err, {
        context: "Connexion",
        showToast: true,
      });

      // Afficher aussi l'erreur dans le formulaire
      setError(
        enrichedError.userDetails ||
          enrichedError.userMessage ||
          "Échec de la connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Connexion en cours..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md px-4 py-8 bg-white/80 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 tracking-tight">
            Bienvenue sur KID Livraison
          </h1>
          <p className="text-base text-black mb-4">
            Connectez-vous pour accéder à votre espace de gestion.
          </p>
        </div>
        <div className="mb-6">
          <AuthForm
            type="login"
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        </div>
        <div className="text-center text-xs text-black mt-6">
          © 2025 KNM. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
