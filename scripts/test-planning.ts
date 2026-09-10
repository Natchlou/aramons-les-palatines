import { generateAndSaveMonthlyPlanning } from "@/lib/planningService";

async function run() {
  const annee = 2026;
  const mois = 10; // 10 pour Octobre

  try {
    console.log(`Lancement de la génération du planning pour ${mois}/${annee}...`);
    
    // Récupère les données Supabase, calcule le planning et l'enregistre en base
    const planning = await generateAndSaveMonthlyPlanning(annee, mois);

    console.log(`Succès ! ${planning.weeks.length} jours planifiés et enregistrés dans la table 'planning'.`);
    
    // Affichage des 3 premiers jours dans la console pour vérifier
    console.table(planning.weeks.slice(0, 3));
    
  } catch (error) {
    console.error("Une erreur est survenue lors du processus :", error);
  }
}

run();