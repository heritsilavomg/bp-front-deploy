// Test-only responses. Never imported by application code.
export function adminDesignFixtures(email) {
  const users = Array.from({ length: 6 }, (_, index) => ({
    id: index === 2 ? 'browser-admin' : `browser-user-${index}`,
    prenom: index === 2 ? 'Admin' : 'Utilisateur', nom: index === 2 ? 'Test' : `Test ${index + 1}`,
    email: index === 2 ? email : `ui-${index + 1}@example.test`, role: index === 2 ? 'ROLE_ADMIN' : 'ROLE_USER', status: 'ACTIVE',
  }));
  const page = content => ({ content, page: 0, size: 20, totalElements: content.length, totalPages: 1 });
  const settings = [
    ['JOURS_PAR_ANNEE', '365', 'Jours par an'], ['COEFF_TEC_SERVICES', '0.30', 'Coefficient TEC services'],
    ['DELAI_SALAIRE_JOURS', '15', 'Délai salaire en jours'], ['DELAI_COTISATIONS_JOURS', '30', 'Délai cotisations en jours'],
    ['RATIO_SALAIRES_BRUTS', '0.70', 'Ratio salaires bruts'], ['RATIO_COTISATIONS', '0.30', 'Ratio cotisations'],
  ].map(([key, value, description]) => ({ key, value, description, valueType: 'number', group: 'BFR' }));
  settings.push({ key: 'DEFAULT_TVA_RATIO', value: '0.20', description: 'Default TVA ratio', valueType: 'number', group: 'Tax' });
  settings.push({ key: 'TYPES_IMMOB_INCORPORELLES', value: 'NATURE_FOND_DE_COMMERCE,NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE,NATURE_BREVET_MARQUE,NATURE_CREATION_SITE_WEB_APPLICATION,NATURE_LOGICIEL_DEVELOPPE,NATURE_FRAIS_CREATION_SOCIETE', description: 'Types immobilisations incorporelles', valueType: 'arrays', group: 'Investissement' });
  settings.push({ key: 'TYPES_IMMOB_CORPORELLES', value: 'NATURE_ACHAT_IMMOBILIERE,NATURE_FRAIS_ACQUISITION_IMMOBILIERE,NATURE_TERRAIN,NATURE_VEHICULE_UTILITAIRE,NATURE_VEHICULE_TOURISME,NATURE_MACHINE,NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE,NATURE_MAT_INFORMATIQUE,NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS,NATURE_TRAVAUX_AGENCEMENT', description: 'Types immobilisations corporelles', valueType: 'arrays', group: 'Investissement' });
  settings.push({ key: 'INVESTISSEMENTS_NON_AMORTISSABLES', value: 'PERSONEL,COMPTE_COURANT,NATURE_TERRAIN,STOCK_DE_DEPART,GARANTIE_LOYER,TRESORERIE_DEPART,FRAIS_GENERAUX', description: 'Investissements non amortissables', valueType: 'arrays', group: 'Investissement' });
  settings.push({ key: 'TAUX_IRSA', value: '0.20', description: 'Taux IRSA', valueType: 'number', group: 'Impôts' });
  return {
    '/api/admin/users': page(users),
    '/api/admin/business-plans': page(Array.from({ length: 8 }, (_, index) => ({ id: `browser-plan-${index}`, title: index % 3 === 0 ? `Projet de test ${index + 1}` : null, owner: { id: users[index % 6].id, name: `${users[index % 6].prenom} ${users[index % 6].nom}`, email: users[index % 6].email }, status: 'BROUILLON', createdAt: '2026-08-04T00:00:00Z', updatedAt: '2026-10-18T00:00:00Z' }))),
    '/api/bp/config': settings,
    '/api/bp/amortissement': [{ typeKey: 'NATURE_MACHINE', tauxAnnuel: .2, dureeAnnees: 5 }],
    '/api/admin/scoring': { totalWeight: 100, dimensions: ['FINANCIAL_VIABILITY', 'FINANCING_STRUCTURE', 'PROFITABILITY', 'MARKET_COMMERCIAL', 'RISK_PREPAREDNESS'].map((dimensionCode, index) => ({ dimensionCode, weight: [30, 25, 20, 15, 10][index] })) },
  };
}
