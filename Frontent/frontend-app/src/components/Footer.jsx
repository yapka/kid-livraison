import React from "react";
import { Package, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 text-white border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Logo et description */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">KID distribution</h3>
            </div>
            <p className="text-sm text-gray-300 max-w-xs">
              Votre partenaire de confiance pour tous vos besoins de livraison
              rapide et sécurisée.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4" />
                <span>+225 621 00 00 00</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@kidlivraison.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" />
                <span>Abidjan, CI</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-white">Liens rapides</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <a
                href="/dashboard"
                className="block hover:text-blue-400 transition-colors"
              >
                Tableau de bord
              </a>
              <a
                href="/colis"
                className="block hover:text-blue-400 transition-colors"
              >
                Gestion des colis
              </a>
              <a
                href="/livreurs"
                className="block hover:text-blue-400 transition-colors"
              >
                Livreurs
              </a>
              <a
                href="/utilisateurs"
                className="block hover:text-blue-400 transition-colors"
              >
                Utilisateurs
              </a>
            </div>
          </div>
        </div>

        {/* Séparateur minimaliste et copyright */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center">
          <div className="w-16 h-1 rounded-full bg-gray-600 opacity-30 mb-4"></div>
          <div className="pt-2 border-t border-gray-700 w-full text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} KID Livraison. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
