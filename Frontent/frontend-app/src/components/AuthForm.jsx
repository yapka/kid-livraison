import React, { useState } from "react";
import { User, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";

function AuthForm({ type, onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Only for register
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "login") {
      onSubmit(username, password);
    } else if (type === "register") {
      onSubmit(username, email, password);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl p-8 space-y-6 max-w-md mx-auto"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl mb-4">
          <img
            src="/logo-kid.jpg"
            alt="logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-card-foreground">
          {type === "login" ? "Se connecter" : "S'inscrire"}
        </h2>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>

      <div className="space-y-4">
        <Input
          label="Email ou nom d'utilisateur"
          icon={User}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {type === "register" && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pr-4 py-2 px-3 text-sm md:text-base md:py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-12 pl-4 py-2 px-3 text-sm md:text-base md:py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <Eye className="w-5 h-5" aria-hidden />
              ) : (
                <EyeOff className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <span className="ml-2">Se souvenir de moi</span>
          </label>
          <a href="#" className="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        variant="primary"
      >
        {loading
          ? "Chargement..."
          : type === "login"
          ? "Se connecter"
          : "S'inscrire"}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Button>
    </form>
  );
}

export default AuthForm;
