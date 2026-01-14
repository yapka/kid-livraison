# UI Spec — Système de Livraison (basse fidélité)

## Objectif
Document court listant les écrans prioritaires, KPI, statuts et contraintes d'impression.

## KPI (Dashboard)
- Livraisons aujourd'hui
- Livraisons en retard
- En transit
- % de livraisons à l'heure
- Colis à imprimer

## Statuts possibles
- Créée
- Planifiée
- Prise en charge
- En transit
- Livrée
- Échouée
- Retournée

## Pages prioritaires
- Dashboard
- Liste des livraisons
- Détail livraison
- Créer/Éditer Livraison (multi-steps)
- Gestion entités (expéditeur, destinataire, livreur)
- Impression étiquette thermique
- Auth (login/register)

## Impression / Étiquette thermique
- Format conseillé: 4x6 in (102x152 mm) / orientation portrait
- Prévoir aperçu et bouton `Imprimer` + export PDF

## Composants réutilisables
- Header / Navbar
- Card KPI
- Table de livraisons (avec sélection multiple)
- Filtre / Search bar
- Timeline d’événements
- Modal actions

## Notes UX
- Mobile-first, puis responsive
- Actions primaires (imprimer, relancer, créer) visibles et en couleur
- Sauvegarde de brouillon pour création de livraison

---

> Fichiers wireframes basse fidélité: `docs/wireframes/*` (HTML simples pour prévisualisation locale)