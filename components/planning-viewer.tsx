// PlanningViewer.tsx
'use client';

import React from 'react';
import { PlanningResult, Resident, Agent } from '@/lib/types';

interface PlanningViewerProps {
  result: PlanningResult;
  residents: Resident[];
  agents: Agent[];
}

const dayNames: Record<number, string> = {
  1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi'
};

const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const PlanningViewer: React.FC<PlanningViewerProps> = ({ result, residents, agents }) => {
  const getResident = (id: number) => residents.find(r => r.id === id);
  const getAgent = (id: number) => agents.find(a => a.id === id);

  const getTasksByAgent = (dayTasks: any[]) => {
    const byAgent: Record<number, any[]> = {};
    agents.forEach(a => byAgent[a.id] = []);
    dayTasks.forEach(t => {
      if (!byAgent[t.agentId]) byAgent[t.agentId] = [];
      byAgent[t.agentId].push(t);
    });
    return byAgent;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Planning de Ménage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Résidents</h3>
          <p className="text-2xl font-bold text-gray-800">{result.summary.totalResidents}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="text-sm font-semibold text-green-600 uppercase">Planifiés</h3>
          <p className="text-2xl font-bold text-green-700">{result.summary.scheduled}</p>
        </div>
        <div className="bg-red-50 p-4 rounded shadow">
          <h3 className="text-sm font-semibold text-red-600 uppercase">Non planifiés</h3>
          <p className="text-2xl font-bold text-red-700">{result.summary.unscheduled}</p>
        </div>
      </div>

      <div className="space-y-8">
        {result.days.map((day) => {
          const tasksByAgent = getTasksByAgent(day.tasks);
          return (
            <div key={day.date} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-bold capitalize">{formatFullDate(day.date)}</h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="border-b-2 border-gray-200 pb-2">
                      <h3 className="font-bold text-gray-700">{agent.name}</h3>
                      <p className="text-sm text-gray-500">
                        {tasksByAgent[agent.id]?.length || 0} ménage(s)
                      </p>
                    </div>
                  ))}
                </div>

                {agents.map(agent => {
                  const tasks = tasksByAgent[agent.id] || [];
                  if (tasks.length === 0 && day.tasks.length === 0) return null;

                  return (
                    <div key={agent.id} className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                        {agent.name}
                      </h4>
                      {tasks.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">Aucun ménage prévu.</p>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map(task => {
                            const resident = getResident(task.residentId);
                            if (!resident) return null;
                            return (
                              <div key={task.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
                                <div className="mb-1 sm:mb-0">
                                  <div className="font-medium text-gray-800">{resident.name}</div>
                                  <div className="text-sm text-gray-600">
                                    App. {resident.apartment} • Bât. {resident.building}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 font-mono">
                                  {task.startTime} → {task.endTime}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {result.unscheduled.length > 0 && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-700 mb-4">Résidents non planifiés</h3>
          <ul className="space-y-2">
            {result.unscheduled.map((item, idx) => (
              <li key={idx} className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-red-800">{item.resident.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({item.resident.apartment})</span>
                </div>
                <span className="text-sm text-red-600 italic">{item.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlanningViewer;