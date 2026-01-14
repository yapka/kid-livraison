import React from "react";
import { Link } from "react-router-dom";
import { Package, Truck, Users, BarChart3, Shield, Clock } from "lucide-react";

function HomePage() {
  return (
    <div
      className="min-h-screen bg-white flex flex-col justify-between items-center px-2 py-8"
      role="main"
    >
      {/* Hero Section */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div
            className="bg-white p-4 rounded-xl border border-gray-200"
            role="img"
            aria-label="Logo KID Distribution"
          >
            <img
              src="/logo-kid.jpg"
              alt="Logo KID Distribution"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-black mb-3 tracking-tight"
          id="main-title"
        >
          KID Livraison
        </h1>
        <p className="text-base sm:text-lg text-gray-700 mb-8 text-center max-w-xl">
          Système de gestion de livraisons simple et efficace.
        </p>
        {/* CTA Button unique */}
        <div className="flex justify-center mb-12">
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-base transition"
            aria-label="Se connecter à l'application"
            role="button"
          >
            Connexion
          </Link>
        </div>
      </div>
      {/* Features Grid */}
      <div
        className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 px-2 mb-12"
        aria-label="Fonctionnalités principales"
      >
        <FeatureCard
          icon={
            <Package className="w-8 h-8 text-black" aria-label="Icône Colis" />
          }
          title="Colis"
          description="Gestion complète de vos colis, de l’envoi à la réception."
        />
        <FeatureCard
          icon={
            <Truck
              className="w-8 h-8 text-black"
              aria-label="Icône Livraisons"
            />
          }
          title="Livraisons"
          description="Suivi en temps réel et historique détaillé."
        />
        <FeatureCard
          icon={
            <Users className="w-8 h-8 text-black" aria-label="Icône Équipe" />
          }
          title="Équipe"
          description="Gestion des livreurs et opérateurs en toute simplicité."
        />
      </div>
      <footer
        className="w-full py-4 bg-white border-t border-gray-200 text-center text-gray-700 text-xs mt-8"
        role="contentinfo"
      >
        © {new Date().getFullYear()} KID Distribution
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col items-center h-full"
      tabIndex={0}
      aria-label={title}
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
      <p className="text-base text-gray-800 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

export default HomePage;
