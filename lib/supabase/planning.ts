// src/lib/supabase/planning.ts

import { createClient } from '@/lib/client';
import { PlanningResult, Resident } from '../types';

// Récupère les résidents avec leurs contraintes
export async function fetchResidentsWithConstraints(residentIds?: string[]): Promise<Resident[]> {
  const supabase = createClient();

  // 1. Récupérer les résidents
  let query = supabase.from('residents').select('*');
  if (residentIds && residentIds.length > 0) {
    query = query.in('id', residentIds);
  }

  const { data: residents, error: residentsError } = await query;
  if (residentsError) {
    console.error('Erreur lors de la récupération des résidents:', residentsError);
    return [];
  }

  // 2. Récupérer les contraintes pour ces résidents
  const residentIdsToFetch = residents.map(r => r.id);
  const { data: constraints, error: constraintsError } = await supabase
    .from('constraintes')
    .select('resident_id, data')
    .in('resident_id', residentIdsToFetch);

  if (constraintsError) {
    console.error('Erreur lors de la récupération des contraintes:', constraintsError);
    return [];
  }

  // 3. Fusionner les résidents avec leurs contraintes
  return residents.map(resident => {
    const constraint = constraints.find(c => c.resident_id === resident.id);
    return {
      id: resident.id,
      first_name: resident.first_name || undefined,
      last_name: resident.last_name || undefined,
      room: resident.room || undefined,
      building: resident.building || undefined,
      constraints: constraint ? constraint.data : undefined,
      // Champs par défaut pour le moteur de planning
      frequency: 'weekly', // Par défaut, on suppose un nettoyage hebdomadaire
      allowedDays: [],     // Jours autorisés (à remplir depuis les contraintes)
      forbiddenDays: [],   // Jours interdits (à remplir depuis les contraintes)
      priority: 1,         // Priorité par défaut
      isAbsent: false,     // Présent par défaut
    };
  });
}

// Sauvegarde le planning dans la table `planning`
export async function savePlanning(planning: PlanningResult, date: Date): Promise<number | null> {
  const supabase = createClient();

  // Formater la date au format YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];

  // Sauvegarder le planning
  const { data, error } = await supabase
    .from('planning')
    .insert({
      date: formattedDate,
      data: planning,
    })
    .select('id');

  if (error) {
    console.error('Erreur lors de la sauvegarde du planning:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error('Aucun ID retourné après sauvegarde.');
    return null;
  }

  return data[0].id;
}