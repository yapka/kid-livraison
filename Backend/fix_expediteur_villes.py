#!/usr/bin/env python
"""Script pour mettre à jour les villes des expéditeurs manquantes"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import ExpediteurModel

# Mettre à jour tous les expéditeurs sans ville
updated = ExpediteurModel.objects.filter(ville__isnull=True).update(ville='Abidjan')
print(f"✅ {updated} expéditeur(s) mis à jour avec ville='Abidjan'")

updated2 = ExpediteurModel.objects.filter(ville='').update(ville='Abidjan')
print(f"✅ {updated2} expéditeur(s) avec ville vide mis à jour")

print(f"\n✅ Total: {updated + updated2} expéditeur(s) mis à jour")
