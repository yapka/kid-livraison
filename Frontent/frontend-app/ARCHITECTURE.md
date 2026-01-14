# Architecture d'Enregistrement de Colis - Frontend

## Vue d'ensemble - Version 1.0 (Simplifiée)

L'application frontend est actuellement en **Version 1.0 Simplifiée** pour un démarrage rapide et opérationnel. Elle supporte l'enregistrement complet de colis avec génération automatique de numéro de suivi, gestion des informations expéditeur/destinataire, et impression de tickets/reçus.

### 📱 Fonctionnalités V1 (Actives)

✅ **Authentification** (Login/Logout avec JWT)
✅ **Enregistrement de colis** (Formulaire complet)
✅ **Impression de tickets** (Reçu + Étiquette thermique)
✅ **Liste des colis** (Consultation et filtres)
✅ **Recherche** (Par numéro de suivi ou client)
✅ **Changement de statut** (EN_ATTENTE, EN_TRANSIT, LIVRE, etc.)
✅ **Détails d'un colis** (Affichage complet)
✅ **Gestion Expéditeurs/Destinataires** (CRUD complet)

### ⏱️ Reporté en V2

❌ Gestion des livreurs (création, planning, affectation)
❌ Gestion des véhicules (parc automobile)
❌ Assignation de livraisons (missions)
❌ Suivi GPS temps réel (tracking live)
❌ Notifications automatiques (SMS/Email)
❌ Zones de livraison et tarifs
❌ Factures détaillées et rapports financiers
❌ Statistiques avancées avec graphiques
❌ Application mobile
❌ Photos et signatures électroniques

---

## 1. Workflow Traditionnel (Contexte Africain) 🌍

### Scénario Réel : Arrivée d'un Client à l'Agence

#### **ÉTAPE 1 : ARRIVÉE DU CLIENT** (0 sec)
```
┌─────────────────────────────────────┐
│  Client arrive avec un colis        │
│  Agent : "Bonjour, je m'occupe      │
│           de vous"                  │
└─────────────────────────────────────┘
Émotion : 😊 Neutre/Positif
```

#### **ÉTAPE 2 : OUVERTURE DE L'APP** (2 sec)
```
┌─────────────────────────────────────┐
│  Action : Clic sur [+ NOUVEAU]      │
│  Attente : Page se charge           │
│  Affichage : Formulaire simple      │
└─────────────────────────────────────┘
Émotion : 😊 Confiant
💡 Point critique : Chargement rapide
```

#### **ÉTAPE 3 : COLLECTE INFOS EXPÉDITEUR** (30 sec)
```
┌─────────────────────────────────────┐
│  Agent : "Votre nom ?"              │
│  Client : "KOUAKOU Xavier"          │
│  Agent saisit : Nom + Téléphone     │
└─────────────────────────────────────┘
Émotion : 😊 Fluide
💡 Point d'attention : Validation temps réel
```

#### **ÉTAPE 4 : COLLECTE INFOS DESTINATAIRE** (30 sec)
```
┌─────────────────────────────────────┐
│  Agent : "Qui reçoit ?"             │
│  Client donne les infos             │
│  Agent saisit : Nom, Tél, Ville     │
└─────────────────────────────────────┘
Émotion : 😊 OK
💡 Les deux (expéditeur + destinataire) sont saisis ENSEMBLE
```

#### **ÉTAPE 5 : INFOS DU COLIS** (30 sec)
```
┌─────────────────────────────────────┐
│  Agent : "C'est quoi ?"             │
│  Client : "Des vêtements"           │
│  Agent saisit : Contenu, Valeur     │
│                 Frais calculés       │
└─────────────────────────────────────┘
Émotion : 😊 Satisfait
💡 Point d'attention : Calcul automatique
```

#### **ÉTAPE 6 : VALIDATION ET PAIEMENT** (20 sec)
```
┌─────────────────────────────────────┐
│  Agent : "Ça fait 2000 FCFA"        │
│  Client paie                        │
│  Agent : Clic [ENREGISTRER]         │
└─────────────────────────────────────┘
Émotion : 😊 Content
```

#### **ÉTAPE 7 : IMPRESSION** (10 sec)
```
┌─────────────────────────────────────┐
│  💚 Succès : "Colis enregistré"     │
│  🖨️ Ticket s'imprime               │
│  Agent colle ticket sur colis       │
└─────────────────────────────────────┘
Émotion : 😄 Très satisfait
💡 Point CRITIQUE : L'impression doit marcher à 100%
```

#### **ÉTAPE 8 : REMISE DU TICKET** (10 sec)
```
┌─────────────────────────────────────┐
│  Agent donne ticket au client       │
│  "Voici votre numéro : SLM178484"   │
│  "Gardez-le pour le suivi"          │
└─────────────────────────────────────┘
Émotion : 😊 Confiant
```

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**
**TOTAL : ~2 min 30 sec**
**SUCCESS RATE ATTENDU : 95%**
**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

### Points Critiques Identifiés

1. **Chargement rapide** (< 2 sec) - Frustration si lent
2. **Validation temps réel** - Éviter erreurs en fin de saisie
3. **Calcul automatique** - Pas de calculette externe
4. **Impression fiable** - CRITIQUE : doit marcher à 100%
5. **Workflow linéaire** - Pas de va-et-vient entre pages

---

## 2. Objectifs de Performance V1 ⚡

### Critères de Succès (Mesurables)

✅ **Enregistrer un colis en < 3 minutes**
- Formulaire simplifié avec création inline d'expéditeur/destinataire
- **Workflow traditionnel respecté** : Expéditeur → Destinataire → Colis → Paiement
- Champs pré-remplis avec valeurs par défaut intelligentes
- Validation en temps réel sans rechargement de page
- Sections collapsibles pour masquer les options avancées
- Auto-focus sur le premier champ
- Impression automatique après validation

**Retrouver un colis en < 10 secondes**
- Barre de recherche en temps réel (numero_suivi, nom expéditeur, destinataire)
- Filtres par statut (EN_ATTENTE, EN_TRANSIT, LIVRE)
- Affichage paginé avec 20 résultats par page
- Mise en évidence des résultats
- Liste triée par date décroissante

 **Imprimer un ticket en 1 clic**
- Bouton "Imprimer" directement dans la confirmation
- Impression automatique après création du colis
- Aucune configuration requise
- Support imprimantes thermiques (102x152mm)
- Génération instantanée du PDF

 **Utiliser l'app sans formation**
- Interface intuitive avec icônes explicites
- Labels clairs et en français
- Messages d'erreur compréhensibles
- Aide contextuelle (tooltips)
- Navigation logique (max 2 clics pour toute action)
- Feedback visuel immédiat

---

## 3. Flux d'Enregistrement de Colis

### Entrée principale
**Route:** `/colis/new` → `ParcelForm.jsx`

### Étapes du flux
1. **Saisie des données** (ParcelForm.jsx) - **⏱️ Temps estimé: 2 min**
   - **Expéditeur** (obligatoire - sélection dropdown ou création inline via modal)
   - **Destinataire** (obligatoire - sélection dropdown ou création inline via modal)
   - Poids (obligatoire, > 0 kg)
   - Description/Contenu (obligatoire, ≥ 5 caractères)
   - Valeur déclarée (pour calcul des frais)
   - Dimensions optionnelles (longueur, largeur, hauteur)
   - Type de colis par défaut: STANDARD
   - Priorité par défaut: NORMALE
   - Assurance optionnelle
   - Instructions spéciales optionnelles

2. **Validation instantanée** (ParcelForm.jsx) - **⏱️ Temps: < 1 sec**
   - Poids obligatoire et > 0
   - Description ≥ 5 caractères
   - **Expéditeur obligatoire** (requis à l'enregistrement)
   - **Destinataire obligatoire** (requis à l'enregistrement)
   - Dimensions optionnelles (si fournies, ≥ 0)
   - Valeur déclarée optionnelle (si fournie, ≥ 0)
   - Feedback visuel immédiat (bordure rouge si invalide)

3. **Soumission** (ParcelForm.jsx → colisService.js) - **⏱️ Temps: < 2 sec**
   - Appel API: `POST /colis/`
   - Backend génère automatiquement:
     - `numero_suivi` (numéro de suivi unique)
     - `facture` (numéro de facture associé)
     - `date_creation` (timestamp)
   - Affichage agent/agence enregistreur (depuis JWT token)

4. **Confirmation & Impression** - **⏱️ Temps: 1 clic**
   - Modal de confirmation avec numéro de suivi affiché
   - Bouton "Imprimer le ticket" (1 clic)
   - Option: impression automatique activable
   - Redirection vers liste des colis

5. **Réponse API**
   ```json
   {
     "id": 123,
     "numero_suivi": "KD-2024-001234",
     "description": "Colis...",
     "poids": 2.5,
     "expediteur": { "id": 1, "nom_complet": "..." },
     "destinataire": { "id": 2, "nom_complet": "..." },
     "facture": { "numero_facture": "INV-2024-001" },
     "...autres champs"
   }
   ```

---

## 2. Génération du Numéro de Suivi

### Responsabilité
- **Backend** (Django/API REST)
- Génération automatique lors de la création
- Format suggéré: `KD-[YYYY]-[6 chiffres]` (ex: KD-2024-001234)

### Frontend
- Reçoit le numéro de suivi de la réponse API
- Affiche dans la confirmation: `"Numéro de suivi: KD-2024-001234"`
- Redirection vers `/colis/edit/{parcelId}` pour aperçu/impression

### Option: Saisie manuelle (future)
- Ajouter checkbox "Générer automatiquement vs saisir manuellement"
- Si manuel: champ input supplémentaire avec validation (unicité via API)

---

## 3. Informations Complètes Expéditeur/Destinataire

### Sources
- **Formulaire ParcelForm:**
  - Sélectionnables via dropdown (données existantes)
  - Liens "Créer nouvel expéditeur" / "Créer nouveau destinataire"

- **Pages créations (si besoin):**
  - `/expediteurs/new` → SenderForm.jsx
  - `/destinataires/new` → DestinataireForm.jsx

### Données stockées dans le colis
```jsx
expediteur: {
  id, nom_complet, telephone, email,
  adresse, ville, code_postal, pays
}
destinataire: {
  id, nom_complet, telephone, email,
  adresse, ville, code_postal, pays
}
```

---

## 4. Affichage du Reçu et Impression

### Composant d'affichage
**Fichier:** `src/components/DeliveryReceipt.jsx`

### Contenu du reçu
- En-tête: "Reçu de Livraison"
- Détails livraison: ID, statut, dates, distance, signature
- Détails colis: numéro de suivi, description, poids, dimensions
- Infos expéditeur/destinataire: nom, coordonnées
- Infos livreur/véhicule (si assignées)

### Étiquette thermique
**Fichier:** `src/components/ThermalLabel.jsx`
- Affiche le numéro de suivi
- Code-barres généré (react-barcode)
- Dimensions: 102mm x 152mm (standard label thermique)

### Flux d'impression
1. **Accès:** Page détail livraison (`/livraisons/{id}`)
2. **Boutons d'action:**
   - "Imprimer Reçu" → useReactToPrint (DeliveryReceipt)
   - "Imprimer Ticket Colis" → useReactToPrint (ThermalLabel)
   - "Aperçu Étiquette" → modal preview
   - "Télécharger PDF" (future)

---

## 5. Architecture des fichiers (Frontend)

```
src/
├── pages/
│   ├── ParcelForm.jsx          [Formulaire création/édition colis]
│   ├── ParcelsList.jsx         [Liste colis avec actions]
│   ├── LivraisonDetail.jsx     [Détail + impression]
│   ├── LivraisonsList.jsx      [Gestion batch print]
│   └── ...
├── components/
│   ├── DeliveryReceipt.jsx     [Template reçu]
│   ├── ThermalLabel.jsx        [Étiquette avec code-barres]
│   ├── PreviewModal.jsx        [Aperçu avant impression]
│   ├── LoadingSpinner.jsx
│   └── ui/
│       ├── Input.jsx           [Primitif input]
│       ├── Button.jsx          [Primitif button]
│       └── Card.jsx            [Primitif card]
├── services/
│   ├── colisService.js         [API: CRUD colis]
│   ├── expediteurService.js    [API: expéditeurs]
│   ├── destinataireService.js  [API: destinataires]
│   └── ...
├── contexts/
│   └── AuthContext.jsx         [Auth + user info]
├── index.css                   [Tokens couleur + base]
└── App.jsx                     [Router + layout]
```

---

## 6. Services Backend attendus (API)

### Créer colis
```
POST /colis/
Body: {
  expediteur_id, destinataire_id, poids, longueur, largeur,
  hauteur, description, valeur_declaree, type_colis, statut,
  priorite, assurance, montant_assurance, instructions_speciales,
  date_livraison_prevue
}
Response: { id, numero_suivi, facture: { numero_facture }, ... }
```

### Lister/détail colis
```
GET /colis/
GET /colis/{id}/
```

### Actualiser colis
```
PUT /colis/{id}/
PATCH /colis/{id}/
```

### Supprimer colis
```
DELETE /colis/{id}/
```

---

## 7. Fonctionnalités V1 (Actives) ✅

### Core Features

✅ **Authentification sécurisée**
- Login/Logout avec JWT tokens
- Gestion des rôles (ADMIN, OPERATEUR)
- Session persistante

✅ **Enregistrement complet de colis**
- Formulaire avec validation côté client
- Création via API avec auto-génération numéro
- Affichage agent/agence enregistreur

✅ **Sélection Expéditeur/Destinataire**
- Dropdown (données existantes)
- Liens création rapide inline
- CRUD complet pour les deux

✅ **Poids, Dimensions & Description**
- Champs dédiés avec validation
- Optionnels: dimensions, priorité, assurance
- Valeur déclarée

✅ **Impression Reçu & Ticket**
- DeliveryReceipt component
- ThermalLabel component
- useReactToPrint hook
- Aperçu modal
- Impression automatique après création

✅ **Code-barres automatique**
- Génération via react-barcode
- Format standard 102×152mm
- Scannable pour tracking futur

✅ **Liste et Recherche**
- Liste paginée des colis
- Recherche par numéro de suivi
- Filtres par statut
- Actions rapides (détails, imprimer)

✅ **Changement de statut**
- EN_ATTENTE → EN_TRANSIT → LIVRE
- Historique des changements
- Permissions par rôle

---

## 8. Roadmap V2 (Version Complète) 🔄

### Phase 1: Gestion Opérationnelle
- [ ] **Gestion des livreurs**
  - CRUD livreurs
  - Planning et affectation
  - Historique de performances
- [ ] **Gestion des véhicules**
  - CRUD véhicules
  - Maintenance et suivi kilométrage
  - Affectation véhicule-livreur
- [ ] **Assignation de livraisons**
  - Création de missions
  - Optimisation des tournées
  - Suivi des livraisons

### Phase 2: Tracking & Communication
- [ ] **Suivi GPS temps réel**
  - Carte interactive
  - Géolocalisation des livreurs
  - ETA dynamique
- [ ] **Notifications automatiques**
  - SMS/Email confirmation
  - Alertes client/livreur
  - Notifications push

### Phase 3: Finance & Analytics
- [ ] **Zones et Tarifs**
  - Zones de livraison
  - Grille tarifaire personnalisée
  - Calcul automatique des frais
- [ ] **Factures détaillées**
  - Génération PDF
  - Historique facturation
  - Rapports financiers
- [ ] **Statistiques avancées**
  - Tableaux de bord interactifs
  - Graphiques de performance
  - Export de données

### Phase 4: Preuves & Validation
- [ ] **Photos de colis**
  - Upload avant/après livraison
  - Galerie d'images
- [ ] **Signature électronique**
  - Canvas de signature
  - Stockage sécurisé
  - Validation légale

### Phase 5: Mobile & API
- [ ] **Application mobile**
  - React Native
  - Mode offline
  - Synchronisation automatique
- [ ] **API publique**
  - Documentation OpenAPI
  - Webhooks
  - Intégrations tierces

---

## 9. Notes de déploiement

1. **Dépendances NPM**
   ```bash
   npm install react-to-print react-barcode
   ```

2. **Variables d'environnement**
   - `.env.local` → `VITE_API_URL` (URL API backend)

3. **CSS d'impression**
   - `src/styles/print.css` → règles `@media print`
   - Classes `.print-area`, `.thermal-label`

4. **Tests manuels**
   - Créer colis depuis `/colis/new`
   - Confirmer numéro reçu
   - Imprimer reçu + étiquette
   - Vérifier code-barres lisible

---

## 10. Contacts & Questions

- **Backend API:** Vérifier `{API}/colis/` endpoints
- **Impression:** Tester avec imprimante thermique réelle
- **Validation:** Ajuster règles métier dans ParcelForm.jsx

---

## 11. Version Simplifiée (V1) - Décisions d'Architecture

### Pourquoi une version simplifiée ?

**Objectif principal:** Permettre au client de démarrer rapidement avec l'essentiel : enregistrer des colis et imprimer des tickets.

**Avantages:**
- ✅ Déploiement rapide (2-3 jours)
- ✅ Formation utilisateur simplifiée
- ✅ Moins de bugs potentiels
- ✅ Feedback client sur les besoins réels
- ✅ Architecture évolutive (V2 déjà préparée)

**Fonctionnalités masquées mais pas supprimées:**
- Le code reste dans le dépôt
- Les routes backend sont fonctionnelles
- Réactivation possible en décommentant
- Voir `/frontend-app/VERSION_SIMPLIFIEE.md`

### Workflow Utilisateur V1

```
1. Connexion → Dashboard (< 5 sec)
2. Clic "Enregistrer un colis" (1 clic)
3. Remplir formulaire (< 2 min):
   - Collecte infos EXPÉDITEUR (nom, tél) - création inline possible
   - Collecte infos DESTINATAIRE (nom, tél, ville) - création inline possible
   - Saisir contenu du colis + valeur
   - Calcul automatique des frais (affichage immédiat)
4. Paiement client (hors app)
5. Valider → Numéro de suivi généré automatiquement (< 2 sec)
6. Impression automatique du ticket (1 clic ou auto)
7. Remise du ticket au client
```

**⏱️ Temps total: < 2 min 30 sec (objectif workflow traditionnel)**

### Performance Recherche (<10 secondes)

```
Scénario 1: Recherche par numéro de suivi
1. Clic "Liste des colis" (navigation)
2. Saisie numéro dans barre de recherche
3. Résultats filtrés en temps réel (< 1 sec)
4. Clic sur résultat → Détails du colis
Total: ~ 5-8 secondes

Scénario 2: Recherche par nom client
1. Clic "Liste des colis"
2. Saisie nom expéditeur/destinataire
3. Filtrage instantané (< 1 sec)
4. Identification visuelle (colis trié par date)
Total: ~ 5-10 secondes
```

### Données sur le Ticket Imprimé

- ✅ Numéro de suivi unique (ex: SLM123456)
- ✅ Date et heure d'enregistrement
- ✅ Expéditeur (nom complet, téléphone, email)
- ✅ Destinataire (nom complet, téléphone, destination/ville)
- ✅ Description/Contenu du colis
- ✅ Valeur déclarée
- ✅ Frais d'envoi
- ✅ Agent enregistreur
- ✅ Agence d'origine
- ✅ Code-barres (pour scan futur)

---

## 👥 Équipe

- **Backend (Django/DRF):** [Nom développeur Django]
- **Frontend (React/Vite):** [Nom développeur React]
- **Design UI/UX:** [Nom designer]
- **Product Owner:** KID Distribution
- **Support Technique:** [Contact support]

---

## 📄 Licence

**Propriétaire** - KID Distribution © 2025

Tous droits réservés. Ce logiciel est la propriété exclusive de KID Distribution.
Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.

**Contact:** contact@kid-distribution.ci
