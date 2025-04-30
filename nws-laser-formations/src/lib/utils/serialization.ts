/**
 * Utilitaire pour sérialiser les objets MongoDB et autres données complexes
 * pour les rendre compatibles avec le transfert SSR/Client dans Next.js
 */

/**
 * Sérialise un objet MongoDB ou tout objet contenant des types non-sérialisables
 * comme les ObjectId, les dates, etc.
 * 
 * @param data - Données à sérialiser
 * @returns - Version sérialisée des données
 */
export function serializeData<T>(data: any): T {
  if (data == null) return null as any;
  
  // Gestion des tableaux
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item)) as any;
  }
  
  // Gestion des dates
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  
  // Gestion des ObjectId de MongoDB
  if (data._id && typeof data._id === 'object' && data._id.toString) {
    return {
      ...serializeData({ ...data }),
      _id: data._id.toString()
    } as any;
  }
  
  // Gestion des objets complexes
  if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
    const serializedObj: any = {};
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Cas spécial pour les buffers
        if (key === 'buffer' && data.buffer && data.toString) {
          return data.toString() as any;
        }
        
        // Traitement récursif pour les autres propriétés
        serializedObj[key] = serializeData(data[key]);
      }
    }
    return serializedObj;
  }
  
  // Valeurs primitives (string, number, boolean)
  return data as any;
}

/**
 * Sérialise un modèle de document MongoDB
 * @param doc - Document MongoDB à sérialiser
 * @returns Document sérialisé
 */
export function serializeMongoDocument<T>(doc: any): T {
  if (!doc) return null as any;
  
  // Si le document a une méthode toJSON (comme les documents Mongoose)
  if (doc.toJSON) {
    const jsonDoc = doc.toJSON();
    return serializeData<T>(jsonDoc);
  }
  
  // Si le document est déjà converti en objet simple (ex: avec lean())
  return serializeData<T>(doc);
}

/**
 * Sérialise un tableau de documents MongoDB
 * @param docs - Tableau de documents à sérialiser
 * @returns Tableau sérialisé
 */
export function serializeMongoDocuments<T>(docs: any[]): T[] {
  if (!docs) return [] as T[];
  return docs.map(doc => serializeMongoDocument<T>(doc));
}
