import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage, enrichError } from '../utils/errorHandler';

/**
 * Hook personnalisé pour gérer les erreurs avec affichage automatique
 */
export const useErrorHandler = () => {
    const toast = useToast();

    /**
     * Gère une erreur et affiche un toast approprié
     * @param {Error} error - L'erreur à gérer
     * @param {Object} options - Options de configuration
     * @returns {Object} - Informations sur l'erreur
     */
    const handleError = useCallback((error, options = {}) => {
        const {
            showToast = true,
            defaultMessage = 'Une erreur est survenue',
            context = '',
        } = options;

        // Enrichir l'erreur avec plus de contexte
        const enrichedError = enrichError(error);
        const { userMessage, userDetails } = extractErrorMessage(error);

        // Log pour debug (en développement)
        if (import.meta.env.DEV) {
            try {
                console.group(`🔴 Erreur${context ? ` - ${context}` : ''}`);
                console.error('Erreur originale:', error);
                console.error('Message utilisateur:', userMessage);
                console.error('Détails:', userDetails);
                console.error('Erreur enrichie:', enrichedError);
                console.groupEnd();
            } catch (e) {
                // Fallback si console.group échoue (problème avec certaines extensions)
                console.error(`🔴 Erreur${context ? ` - ${context}` : ''}:`, error);
            }
        }

        // Afficher le toast si demandé
        if (showToast) {
            const toastMessage = userDetails || userMessage || defaultMessage;

            // Choisir le type de toast selon le type d'erreur
            if (enrichedError.isNetworkError) {
                toast.error(toastMessage, 'Problème de connexion');
            } else if (enrichedError.isAuthError) {
                toast.warning(toastMessage, 'Authentification requise');
            } else if (enrichedError.isValidationError) {
                toast.warning(toastMessage, 'Données invalides');
            } else {
                toast.error(toastMessage, userMessage);
            }
        }

        return enrichedError;
    }, [toast]);

    /**
     * Wrapper pour les appels API avec gestion d'erreur automatique
     * @param {Function} apiCall - La fonction API à appeler
     * @param {Object} options - Options
     * @returns {Promise}
     */
    const withErrorHandling = useCallback(async (apiCall, options = {}) => {
        try {
            const result = await apiCall();

            // Si l'option showSuccessToast est activée
            if (options.showSuccessToast && options.successMessage) {
                toast.success(options.successMessage);
            }

            return { data: result, error: null };
        } catch (error) {
            const enrichedError = handleError(error, options);
            return { data: null, error: enrichedError };
        }
    }, [handleError, toast]);

    /**
     * Gère les erreurs de validation de formulaire
     * @param {Error} error - L'erreur de validation
     * @returns {Object} - Map des erreurs par champ
     */
    const handleValidationError = useCallback((error) => {
        if (!error.response || error.response.status !== 400) {
            return {};
        }

        const errorData = error.response.data;
        const fieldErrors = {};

        // Convertir les erreurs Django en format pour les formulaires
        if (typeof errorData === 'object') {
            for (const [field, messages] of Object.entries(errorData)) {
                if (Array.isArray(messages)) {
                    fieldErrors[field] = messages[0]; // Prendre le premier message
                } else if (typeof messages === 'string') {
                    fieldErrors[field] = messages;
                }
            }
        }

        return fieldErrors;
    }, []);

    return {
        handleError,
        withErrorHandling,
        handleValidationError,
    };
};

export default useErrorHandler;
