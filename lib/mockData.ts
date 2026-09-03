// mockData.ts
import { Resident, Agent } from './types';

export const agents: Agent[] = [
  { id: 1, name: "Sophie Martin", workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 5 },
  { id: 2, name: "Thomas Dubois", workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 5 },
  { id: 3, name: "Julie Bernard", workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 4 },
];

export const residents: Resident[] = [
  { id: 1, name: "M. Dupont", apartment: "101", building: 1, frequency: "daily", priority: 5 },
  { id: 2, name: "Mme Martin", apartment: "102", building: 2, frequency: "daily", priority: 5 },
  { id: 3, name: "M. Bernard", apartment: "201", building: 2, frequency: "daily", priority: 5 },
  { id: 4, name: "Mme Leroy", apartment: "103", building: 1, frequency: "daily", priority: 5 },
  { id: 5, name: "M. Moreau", apartment: "202", building: 2, frequency: "daily", priority: 5 },
  { id: 6, name: "Mme Simon", apartment: "104", building: 1, frequency: "daily", priority: 5 },
  { id: 7, name: "M. Laurent", apartment: "203", building: 2, frequency: "daily", priority: 5 },
  { id: 8, name: "Mme Michel", apartment: "105", building: 1, frequency: "daily", priority: 5 },
  { id: 9, name: "M. Garcia", apartment: "204", building: 2, frequency: "daily", priority: 5 },
  { id: 10, name: "Mme David", apartment: "106", building: 1, frequency: "daily", priority: 5 },
  { id: 11, name: "M. Bertrand", apartment: "107", building: 1, frequency: "weekly", dayOfWeek: 1, priority: 3 },
  { id: 12, name: "Mme Rousseau", apartment: "205", building: 2, frequency: "weekly", dayOfWeek: 2, priority: 3 },
  { id: 13, name: "M. Lefebvre", apartment: "108", building: 1, frequency: "weekly", dayOfWeek: 3, priority: 3 },
  { id: 14, name: "Mme Roux", apartment: "206", building: 2, frequency: "weekly", dayOfWeek: 4, priority: 3 },
  { id: 15, name: "M. Fournier", apartment: "109", building: 1, frequency: "weekly", dayOfWeek: 5, priority: 3 },
  { id: 16, name: "Mme Garnier", apartment: "207", building: 2, frequency: "monthly", dayOfMonth: 1, priority: 2 },
  { id: 17, name: "M. Faure", apartment: "110", building: 1, frequency: "monthly", dayOfMonth: 15, priority: 2 },
  { id: 18, name: "Mme Andre", apartment: "208", building: 2, frequency: "monthly", dayOfMonth: 30, priority: 2 },
  { id: 19, name: "M. Mercier", apartment: "111", building: 1, frequency: "monthly", dayOfMonth: 31, priority: 2 },
  { id: 20, name: "Mme Blanc", apartment: "209", building: 2, frequency: "daily", preferredStart: "13:00", preferredEnd: "16:30", priority: 4 },
  { id: 21, name: "M. Guillot", apartment: "112", building: 1, frequency: "daily", preferredStart: "08:00", preferredEnd: "10:00", priority: 4 },
  { id: 22, name: "Mme Henry", apartment: "210", building: 2, frequency: "daily", allowedDays: [2, 4], priority: 4 },
  { id: 23, name: "M. Durand", apartment: "113", building: 1, frequency: "daily", forbiddenDays: [3], priority: 4 },
  { id: 24, name: "M. Petit", apartment: "211", building: 2, frequency: "daily", priority: 10 },
  { id: 25, name: "Mme Robert", apartment: "114", building: 1, frequency: "daily", priority: 10 },
  { id: 26, name: "M. Richard", apartment: "212", building: 2, frequency: "daily", preferredStart: "16:00", preferredEnd: "16:30", priority: 1 },
  { id: 27, name: "Mme Durand", apartment: "115", building: 1, frequency: "monthly", dayOfMonth: 31, priority: 1 },
  { id: 28, name: "M. Bernard", apartment: "213", building: 2, frequency: "daily", allowedDays: [2], priority: 1 },
  { id: 29, name: "Mme Simon", apartment: "116", building: 1, frequency: "daily", isAbsent: true, priority: 1 },
  { id: 30, name: "M. Laurent", apartment: "214", building: 2, frequency: "weekly", dayOfWeek: 1, priority: 1 },
];