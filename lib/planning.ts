// src/lib/planning.ts
import { generatePlanning } from './planningEngine/planningEngine';
import { fetchResidentsWithConstraints, savePlanning } from './supabase/planning';
import { Agent } from './planningEngine/types';

// Génère et sauvegarde un planning mensuel
export async function generateAndSaveMonthlyPlanning(
  agentName: string,
  residentIds: string[],
  startDate: Date
): Promise<{ planningId: number | null; planning: PlanningResult }> {
  // 1. Récupérer les résidents avec leurs contraintes
  const residents = await fetchResidentsWithConstraints(residentIds);
  if (residents.length === 0) {
    throw new Error('Aucun résident trouvé.');
  }

  // 2. Récupérer les agents (exemple : depuis une table ou une liste statique)
  const agents: Agent[] = [
    { id: 1, name: 'Manon', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 5 },
    { id: 2, name: 'Christelle', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 5 },
    { id: 3, name: 'Lana', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 5 },
  ];

  // Filtrer l'agent sélectionné
  const selectedAgent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase());
  if (!selectedAgent) {
    throw new Error(`Agent "${agentName}" non trouvé.`);
  }

  // 3. Générer le planning
  const planning = await generatePlanning(residents, [selectedAgent], startDate);

  // 4. Sauvegarder le planning
  const planningId = await savePlanning(planning, startDate);

  return { planningId, planning };
}