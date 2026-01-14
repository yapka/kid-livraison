#!/bin/bash

# Script pour corriger les problèmes DNS de Docker

echo "🔧 Configuration des DNS pour Docker..."

# Vérifier si on a les droits sudo
if ! sudo -n true 2>/dev/null; then
    echo "⚠️  Ce script nécessite les droits sudo"
    echo "Veuillez entrer votre mot de passe:"
fi

# Créer la configuration Docker avec DNS
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

echo "✅ Configuration DNS ajoutée"

# Redémarrer Docker
echo "🔄 Redémarrage de Docker..."
sudo systemctl restart docker

# Attendre que Docker soit prêt
sleep 3

# Tester la connexion
echo "🧪 Test de la connexion DNS..."
if docker run --rm busybox nslookup registry.npmjs.org > /dev/null 2>&1; then
    echo "✅ DNS fonctionne correctement!"
else
    echo "❌ Le DNS ne fonctionne toujours pas"
    exit 1
fi

echo ""
echo "✨ Configuration terminée avec succès!"
echo "Vous pouvez maintenant construire vos images Docker."
