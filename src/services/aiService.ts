/**
 * Service d'Analyse Intelligente (AI)
 * Extrait des suggestions de noms de dossiers basées sur le texte OCR
 */

const KEYWORD_MAP: Record<string, string[]> = {
  'Facture': ['facture', 'invoice', 'tva', 'montant', 'total', 'ttc', 'prix'],
  'Identité': ['passeport', 'passport', 'identite', 'identity', 'carte', 'nom', 'prenom', 'naissance'],
  'Santé': ['ordonnance', 'medical', 'docteur', 'pharmacie', 'sante', 'soin', 'mutuelle'],
  'Banque': ['releve', 'banque', 'bank', 'compte', 'iban', 'virement', 'solde'],
  'Travail': ['contrat', 'travail', 'salaire', 'bulletin', 'paie', 'employeur'],
  'Logement': ['loyer', 'quittance', 'bail', 'edf', 'eau', 'gaz', 'assurance'],
  'Véhicule': ['carte grise', 'assurance', 'permis', 'voiture', 'garage', 'entretien'],
};

export async function getSuggestedFolderNames(text: string): Promise<string[]> {
  if (!text || text.trim().length < 5) return [];

  const lowerText = text.toLowerCase();
  const suggestions: Set<string> = new Set();

  // 1. Analyse par mots-clés prédéfinis (Logique Smart)
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      suggestions.add(category);
    }
  }

  // 2. Extraction de noms propres potentiels (ex: EDF, Orange, Ameli)
  // On pourrait ajouter une logique plus poussée ici

  // 3. Limitation et retour
  const result = Array.from(suggestions).slice(0, 4);
  
  // Si rien n'est trouvé, suggérer des noms génériques basés sur la date
  if (result.length === 0) {
    const month = new Date().toLocaleString('fr-FR', { month: 'long' });
    return [`Dossier ${month}`, 'Documents'];
  }

  return result;
}
