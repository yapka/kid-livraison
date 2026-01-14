import { extractErrorMessage } from './errorHandler';

/**
 * Améliore un service existant avec gestion d'erreurs
 * @param {Function} serviceFunction - La fonction de service à wrapper
 * @param {String} operationName - Nom de l'opération pour le logging
 * @returns {Function} - Fonction wrappée
 */
export const withErrorHandling = (serviceFunction, operationName) => {
    return async (...args) => {
        try {
            const result = await serviceFunction(...args);
            return result;
        } catch (error) {
            const errorInfo = extractErrorMessage(error);

            // Log en développement
            if (import.meta.env.DEV) {
                console.error(`[${operationName}] Error:`, errorInfo);
            }

            // Enrichir l'erreur et la relancer
            error.userMessage = errorInfo.message;
            error.userDetails = errorInfo.details;
            throw error;
        }
    };
};

/**
 * Exemple d'utilisation avec un service
 * 
 * import { withErrorHandling } from '../utils/serviceWrapper';
 * 
 * export const getAllColis = withErrorHandling(
 *   async () => {
 *     const response = await apiClient.get('/colis/');
 *     return response.data;
 *   },
 *   'getAllColis'
 * );
 */
