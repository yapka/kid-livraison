// Utilitaire pour extraire les départements depuis le fichier GeoJSON
import departementsData from '../../Departement.geojson?url';

let cachedDepartements = null;

/**
 * Charge et parse le fichier GeoJSON de manière asynchrone
 * @returns {Promise<Array<{value: string, label: string}>>} Liste des villes
 */
export const loadDepartementsData = async () => {
    if (cachedDepartements) {
        return cachedDepartements;
    }

    try {
        const response = await fetch(departementsData);
        const data = await response.json();

        const villesSet = new Set();

        data.features.forEach(feature => {
            const props = feature.properties;
            const nomDep = props?.NomDep;
            const spNomSp = props?.["SP — NomSp"] || props?.SP_NomSp;

            // Ajouter le département
            if (nomDep) {
                villesSet.add(nomDep);
            }

            // Ajouter la sous-préfecture
            if (spNomSp) {
                villesSet.add(spNomSp);
            }
        });

        // Convertit en tableau d'objets et trie alphabétiquement
        cachedDepartements = Array.from(villesSet)
            .sort((a, b) => a.localeCompare(b))
            .map(ville => ({
                value: ville,
                label: ville
            }));

        return cachedDepartements;
    } catch (error) {
        console.error('Erreur lors de l\'extraction des départements:', error);
        return [];
    }
};

/**
 * Version synchrone pour compatibilité - retourne une liste vide initialement
 * @deprecated Utilisez loadDepartementsData() à la place
 * @returns {Array<{value: string, label: string}>} Liste des villes (peut être vide)
 */
export const getDepartementsList = () => {
    return cachedDepartements || [];
};
