// planningEngine.ts
import { Resident, Agent, TimeSlot, PlanningResult, PlanningDay, UnscheduledItem, ScheduledTask } from './types';

const DURATION_MINUTES = 90;
const BREAK_START = 11.5;
const BREAK_END = 12.0;
const WORK_START = 8.0;
const WORK_END = 17.0;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day; 
}

function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 5;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

function formatTime(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function generateAgentSlots(agent: Agent): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let current = WORK_START;
  
  while (current + DURATION_MINUTES / 60 <= WORK_END) {
    const end = current + DURATION_MINUTES / 60;
    
    if (current < BREAK_START && end > BREAK_START) {
      current = BREAK_END;
      continue;
    }
    
    if (current >= BREAK_START && current < BREAK_END) {
      current = BREAK_END;
      continue;
    }

    if (end > BREAK_END && current < BREAK_END) {
      current = BREAK_END;
      continue;
    }

    slots.push({
      start: formatTime(current),
      end: formatTime(end)
    });
    
    current = end;
  }
  
  return slots;
}

function shouldCleanOnDate(resident: Resident, date: Date): boolean {
  if (resident.isAbsent) return false;
  
  const dayOfWeek = getDayOfWeek(date);
  const dayOfMonth = date.getDate();

  switch (resident.frequency) {
    case 'daily':
      return isWeekday(date);
    
    case 'weekly':
      if (!resident.dayOfWeek) return false;
      return dayOfWeek === resident.dayOfWeek && isWeekday(date);
    
    case 'monthly':
      if (!resident.dayOfMonth) return false;
      if (dayOfMonth === resident.dayOfMonth) return true;
      
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      if (resident.dayOfMonth > lastDayOfMonth) {
        return dayOfMonth === lastDayOfMonth;
      }
      
      return false;
    
    default:
      return false;
  }
}

function isDayAllowed(resident: Resident, dayOfWeek: number): boolean {
  if (resident.forbiddenDays?.includes(dayOfWeek)) return false;
  if (resident.allowedDays && resident.allowedDays.length > 0) {
    return resident.allowedDays.includes(dayOfWeek);
  }
  return true;
}

export function generatePlanning(
  residents: Resident[],
  agents: Agent[],
  startDate: Date
): PlanningResult {
  const result: PlanningResult = {
    days: [],
    unscheduled: [],
    summary: {
      totalResidents: 0,
      scheduled: 0,
      unscheduled: 0,
      agentWorkload: {}
    }
  };

  if (residents.length === 0 || agents.length === 0) {
    return result;
  }

  const weekDates: Date[] = [];
  let current = new Date(startDate);
  const dayOfWeek = getDayOfWeek(current);
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    current = addDays(current, 7 - dayOfWeek + 1);
  }
  
  for (let i = 0; i < 5; i++) {
    weekDates.push(new Date(current));
    current = addDays(current, 1);
  }

  const agentSlots: Record<number, Record<string, TimeSlot[]>> = {};
  agents.forEach(agent => {
    agentSlots[agent.id] = {};
    weekDates.forEach(date => {
      const dateStr = formatDateISO(date);
      if (!agent.workingDays || agent.workingDays.includes(getDayOfWeek(date))) {
        agentSlots[agent.id][dateStr] = generateAgentSlots(agent);
      } else {
        agentSlots[agent.id][dateStr] = [];
      }
    });
  });

  const needs: Array<{ resident: Resident; date: Date }> = [];
  
  residents.forEach(resident => {
    weekDates.forEach(date => {
      if (shouldCleanOnDate(resident, date) && isDayAllowed(resident, getDayOfWeek(date))) {
        needs.push({ resident, date });
      }
    });
  });

  needs.sort((a, b) => calculateDifficultyScore(b.resident) - calculateDifficultyScore(a.resident));

  const scheduledTasks: ScheduledTask[] = [];
  
  needs.forEach(({ resident, date }) => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);
    
    const alreadyScheduled = scheduledTasks.some(t => 
      t.residentId === resident.id && t.date === dateStr
    );
    if (alreadyScheduled) return;

    let bestSlot: { agentId: number; slot: TimeSlot; score: number } | null = null;

    const availableAgents = agents
      .filter(a => !a.isAbsent && (a.workingDays ? a.workingDays.includes(dayOfWeek) : true))
      .map(a => {
        const currentLoad = result.summary.agentWorkload[a.id] || 0;
        const maxLoad = a.maxSlotsPerDay || 5;
        return { ...a, currentLoad, maxLoad };
      })
      .sort((a, b) => a.currentLoad - b.currentLoad);

    for (const agent of availableAgents) {
      const slots = agentSlots[agent.id][dateStr];
      if (!slots || slots.length === 0) continue;

      const validSlots = slots.filter(slot => {
        const start = parseTime(slot.start);
        const end = parseTime(slot.end);
        
        if (resident.preferredStart) {
          const prefStart = parseTime(resident.preferredStart);
          if (start < prefStart) return false;
        }

        if (resident.preferredEnd) {
          const prefEnd = parseTime(resident.preferredEnd);
          if (end > prefEnd) return false;
        }

        return true;
      });

      if (validSlots.length === 0) continue;

      const currentAgentLoad = result.summary.agentWorkload[agent.id] || 0;
      const maxLoad = agent.maxSlotsPerDay || 5;
      const loadPenalty = currentAgentLoad >= maxLoad ? 1000 : 0;
      const slotScore = validSlots[0].start === resident.preferredStart ? 10 : 0;
      const totalScore = slotScore - loadPenalty;

      if (!bestSlot || totalScore > bestSlot.score) {
        bestSlot = {
          agentId: agent.id,
          slot: validSlots[0],
          score: totalScore
        };
      }
    }

    if (bestSlot) {
      const { agentId, slot } = bestSlot;
      
      const task: ScheduledTask = {
        id: `${resident.id}-${dateStr}-${agentId}-${slot.start}`,
        residentId: resident.id,
        agentId: agentId,
        date: dateStr,
        startTime: slot.start,
        endTime: slot.end
      };

      scheduledTasks.push(task);
      result.summary.agentWorkload[agentId] = (result.summary.agentWorkload[agentId] || 0) + 1;
      
      const agentSlotList = agentSlots[agentId][dateStr];
      const index = agentSlotList.findIndex(s => s.start === slot.start);
      if (index !== -1) {
        agentSlotList.splice(index, 1);
      }
    } else {
      result.unscheduled.push({
        resident,
        date: dateStr,
        reason: `Aucun créneau disponible ou compatible`
      });
    }
  });

  weekDates.forEach(date => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);
    
    const dayTasks = scheduledTasks
      .filter(t => t.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    result.days.push({
      date: dateStr,
      dayOfWeek,
      tasks: dayTasks
    });
  });

  result.summary.totalResidents = residents.length;
  result.summary.scheduled = scheduledTasks.length;
  result.summary.unscheduled = result.unscheduled.length;

  return result;
}

function calculateDifficultyScore(resident: Resident): number {
  let score = resident.priority || 1;
  if (resident.preferredStart && resident.preferredEnd) {
    const start = parseTime(resident.preferredStart);
    const end = parseTime(resident.preferredEnd);
    const duration = end - start;
    if (duration < 1.5) score += 50;
  }
  if (resident.allowedDays && resident.allowedDays.length < 5) {
    score += 20;
  }
  if (resident.forbiddenDays && resident.forbiddenDays.length > 0) {
    score += 10;
  }
  if (resident.frequency === 'weekly' || resident.frequency === 'monthly') {
    score += 10;
  }
  return score;
}