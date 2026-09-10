import React from "react";
import { Database } from "@/database.types";
import { Badge } from "./ui/badge";

type PlanningRow = Database['public']['Tables']['planning']['Row']

export type Task = {
    building?: string;
    resident: string;
    room?: string;
    time: string;
    type: string;
}

export type Planning = {
    id: number;
    date: string;
    created_at: Date;
    data: Details
}

export type Details = {
    title: string;
    subtitle?: string;
    agent: string;
    weeks: {
        label: string;
        days: {
            date: string;
            tasks: Task[];
            absence?: {
                type: string;
                replacedBy: string;
            }
        }[]
    }[]
}

const TIME_SLOTS = [
    { label: "8h00-8h30", times: ["08H00"] },
    { label: "8h30-10h00", times: ["08H30", "09H00"] },
    { label: "10h00-11h30", times: ["09H30", "10H00", "10H30"] },
    { label: "11h30-12h00", times: ["11H30"] },
    { label: "12h00-13h30", times: ["12H00", "12H30"] },
    { label: "13h30-15h00", times: ["13H00", "13H30", "14H00"] },
];

/**
 * Convertit un libellé de semaine (ex: "Semaine 40") ou extrait proprement 
 * les dates pour afficher "Semaine du X au Y mois" en français.
 */
function formatWeekLabel(originalLabel: string, days: { date: string }[]): string {
    if (!days || days.length === 0) return originalLabel;

    const firstDay = days[0].date; // Ex: "Lundi 1 octobre"
    const lastDay = days[days.length - 1].date; // Ex: "Vendredi 5 octobre"

    try {
        const partsFirst = firstDay.split(" ");
        const partsLast = lastDay.split(" ");

        const startDayNum = partsFirst[1];
        const endDayNum = partsLast[1];
        const startMonth = partsFirst[2];
        const endMonth = partsLast[2];

        // Si le mois est le même (ex: du 1 au 5 octobre)
        if (startMonth === endMonth) {
            return `Semaine du ${startDayNum} au ${endDayNum} ${startMonth}`;
        }

        // Si cheval sur deux mois (ex: du 29 septembre au 3 octobre)
        return `Semaine du ${startDayNum} ${startMonth} au ${endDayNum} ${endMonth}`;
    } catch {
        return originalLabel;
    }
}

export default function PlanningMonthly({ data }: { data: PlanningRow }) {
    const details = data.data as Details;

    return (
        <div className="bg-white p-6 border shadow-sm rounded-lg flex flex-col gap-6 overflow-x-auto">
            {/* En-tête du document */}
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">{details.title}</h1>
                    <h2 className="text-lg text-gray-500 font-medium">{details.subtitle}</h2>
                </div>
                <Badge className="text-sm px-3 py-1 bg-primary text-primary-foreground">
                    Agent : {details.agent}
                </Badge>
            </div>

            {/* Tableau principal */}
            <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="p-3 border-r border-gray-200 font-semibold w-45">Date</th>
                            {TIME_SLOTS.map((slot) => (
                                <th key={slot.label} className="p-3 border-r border-gray-200 text-center font-semibold last:border-0">
                                    {slot.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {details.weeks.map((week) => {
                            const frenchWeekLabel = formatWeekLabel(week.label, week.days);

                            return (
                                <React.Fragment key={week.label}>
                                    {/* Ligne de séparation pour la semaine en français */}
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <td colSpan={7} className="p-2 font-bold text-gray-700 text-center uppercase text-xs tracking-wider">
                                            {frenchWeekLabel}
                                        </td>
                                    </tr>
                                    
                                    {/* Lignes pour chaque jour */}
                                    {week.days.map((day) => (
                                        <tr key={day.date} className="border-b border-gray-200 last:border-0 hover:bg-slate-50 transition-colors">
                                            
                                            {/* Colonne 1 : Date */}
                                            <td className="p-3 border-r border-gray-200 font-medium text-gray-900 whitespace-nowrap align-middle">
                                                {day.date}
                                                {day.absence && (
                                                    <div className="text-xs text-red-600 mt-1 font-semibold">
                                                        Absent(e) - Remplacé(e) par {day.absence.replacedBy}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Colonnes des créneaux */}
                                            {TIME_SLOTS.map((slot, index) => {
                                                const task = day.tasks?.find(t => slot.times.includes(t.time));
                                                
                                                if (!task) {
                                                    return <td key={index} className="p-3 text-center align-middle border-r border-gray-200 last:border-0 text-gray-300">-</td>;
                                                }

                                                if (task.type === "pause") {
                                                    return (
                                                        <td key={index} className="p-3 text-center align-middle border-r border-gray-200 last:border-0 bg-orange-50/50">
                                                            <span className="text-orange-600 italic font-medium text-xs">☕ Pause</span>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={index} className="p-3 text-center align-middle border-r border-gray-200 last:border-0">
                                                        <div className="flex flex-col items-center justify-center gap-0.5 leading-tight">
                                                            <span className="font-semibold text-gray-800">{task.resident}</span>
                                                            {(task.room || task.building) && (
                                                                <span className="text-[11px] text-gray-500">
                                                                    {task.room && `Appt ${task.room}`} 
                                                                    {task.room && task.building && " • "} 
                                                                    {task.building && `Bât ${task.building}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}