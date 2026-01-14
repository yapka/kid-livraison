/**
 * Utilitaire centralisé pour la gestion des erreurs API
 */

/**
 * Extrait un message d'erreur lisible depuis une réponse d'erreur Axios
 * @param {Error} error - L'objet erreur d'Axios
 * @returns {Object} - { message, details, status, isNetworkError }
 */
export const extractErrorMessage = (error) => {
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
        if (error.isNetworkError) {
            return {
                message: error.message || 'Impossible de se connecter à l\'API. Vérifiez votre connexion.',
                details: null,
                status: null,
                isNetworkError: true,
            };
        }
        return {
            message: 'Erreur de connexion au serveur',
            details: error.message,
            status: null,
            isNetworkError: true,
        };
    }

    const { status, data } = error.response;
    let message = 'Une erreur est survenue';
    let details = null;

    // Gestion selon le code de statut HTTP
    switch (status) {
        case 400: // Bad Request
            message = 'Données invalides';
            details = formatValidationErrors(data);
            break;

        case 401: // Unauthorized
            message = 'Non authentifié';
            details = 'Veuillez vous connecter pour continuer.';
            break;

        case 403: // Forbidden
            message = 'Accès refusé';
            details = 'Vous n\'avez pas les permissions nécessaires.';
            break;

        case 404: // Not Found
            message = 'Ressource introuvable';
            details = data?.detail || 'La ressource demandée n\'existe pas.';
            break;

        case 409: // Conflict
            message = 'Conflit de données';
            details = data?.detail || formatValidationErrors(data);
            break;

        case 422: // Unprocessable Entity
            message = 'Données non valides';
            details = formatValidationErrors(data);
            break;

        case 500: // Internal Server Error
            message = 'Erreur serveur';
            details = 'Une erreur interne est survenue. Réessayez plus tard.';
            break;

        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
            message = 'Service temporairement indisponible';
            details = 'Le serveur ne répond pas. Réessayez dans quelques instants.';
            break;

        default:
            message = `Erreur ${status}`;
            details = data?.detail || data?.message || 'Une erreur inattendue est survenue.';
    }

    return {
        message,
        details,
        status,
        isNetworkError: false,
    };
};

/**
 * Formate les erreurs de validation Django REST Framework
 * @param {Object|String} data - Les données d'erreur
 * @returns {String} - Message formaté
 */
export const formatValidationErrors = (data) => {
    if (!data) return null;

    // Si c'est déjà une chaîne
    if (typeof data === 'string') return data;

    // Si c'est un objet avec un message de détail
    if (data.detail) return data.detail;

    // Si c'est un objet avec des champs d'erreur
    if (typeof data === 'object') {
        const errors = [];

        for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
                // Plusieurs messages pour un champ
                const fieldErrors = messages.map((msg) => {
                    // Traduire les noms de champs techniques
                    const fieldLabel = translateFieldName(field);
                    return `${fieldLabel}: ${msg}`;
                });
                errors.push(...fieldErrors);
            } else if (typeof messages === 'string') {
                const fieldLabel = translateFieldName(field);
                errors.push(`${fieldLabel}: ${messages}`);
            } else if (typeof messages === 'object') {
                // Erreurs imbriquées
                errors.push(`${translateFieldName(field)}: ${JSON.stringify(messages)}`);
            }
        }

        return errors.length > 0 ? errors.join('\n') : null;
    }

    return null;
};

/**
 * Traduit les noms de champs techniques en français
 * @param {String} fieldName - Nom du champ
 * @returns {String} - Nom traduit
 */
export const translateFieldName = (fieldName) => {
    const translations = {
        // Champs génériques
        non_field_errors: 'Erreur générale',
        detail: 'Détail',

        // Champs de colis
        numero_suivi: 'Numéro de suivi',
        expediteur: 'Expéditeur',
        expediteur_id: 'Expéditeur',
        destinataire: 'Destinataire',
        destinataire_id: 'Destinataire',
        poids: 'Poids',
        longueur: 'Longueur',
        largeur: 'Largeur',
        hauteur: 'Hauteur',
        description: 'Description',
        valeur_declaree: 'Valeur déclarée',
        type_colis: 'Type de colis',
        statut: 'Statut',
        priorite: 'Priorité',
        assurance: 'Assurance',
        montant_assurance: 'Montant d\'assurance',
        instructions_speciales: 'Instructions spéciales',
        date_livraison_prevue: 'Date de livraison prévue',
        frais_envoi: 'Frais d\'envoi',

        // Champs utilisateur
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        email: 'Email',
        telephone: 'Téléphone',
        role: 'Rôle',
        first_name: 'Prénom',
        last_name: 'Nom',

        // Champs expéditeur/destinataire
        nom_complet: 'Nom complet',
        ville: 'Ville',
        quartier: 'Quartier',
        adresse_complete: 'Adresse complète',

        // Champs livreur
        matricule: 'Matricule',
        disponible: 'Disponibilité',

        // Champs véhicule
        immatriculation: 'Immatriculation',
        type_vehicule: 'Type de véhicule',
        modele: 'Modèle',
        marque: 'Marque',

        // Champs livraison
        date_assignation: 'Date d\'assignation',
        date_depart: 'Date de départ',
        date_livraison: 'Date de livraison',
        commentaires: 'Commentaires',
    };

    return translations[fieldName] || fieldName;
};

/**
 * Vérifie si une erreur est liée à l'authentification
 * @param {Error} error - L'objet erreur
 * @returns {Boolean}
 */
export const isAuthError = (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Vérifie si une erreur est liée à la validation
 * @param {Error} error - L'objet erreur
 * @returns {Boolean}
 */
export const isValidationError = (error) => {
    return error.response?.status === 400 || error.response?.status === 422;
};

/**
 * Crée un objet d'erreur enrichi
 * @param {Error} error - L'erreur originale
 * @returns {Object} - Erreur enrichie
 */
export const enrichError = (error) => {
    const extracted = extractErrorMessage(error);

    return {
        ...error,
        userMessage: extracted.message,
        userDetails: extracted.details,
        statusCode: extracted.status,
        isNetworkError: extracted.isNetworkError,
        isAuthError: isAuthError(error),
        isValidationError: isValidationError(error),
        timestamp: new Date().toISOString(),
    };
};
