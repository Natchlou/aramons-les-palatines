import GeneratePlanningPdf from "@/components/pdf/generate-planning-pdf";
import GenerateResidentNoticePdf from "@/components/pdf/generate-resident-notice-pdf";
import { ResidentNotice } from "@/lib/pdf/resident-notice-pdf";
import type { CleaningPlanningMonth } from "@/lib/pdf/cleaning-planning-pdf";

export default function Test1Page() {

    const mockCleaningPlanning: CleaningPlanningMonth = {
        title: "Planning ménage — Septembre 2026",
        subtitle: "Résidence Séniors Aramons / Les Palatines",
        agent: "Sophie MARTIN",
        weeks: [
            {
                label: "Semaine du 1 au 5 septembre",
                days: [
                    {
                        date: "Lundi 1 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME CARDELL", room: "117", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. DURAND", room: "204", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "MME FABRE", room: "312", building: "2", type: "menage" },
                            { time: "13H30", resident: "Hall d'entrée", building: "1", type: "hall" },
                        ],
                    },
                    {
                        date: "Mardi 2 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. ET MME ROUX", room: "88", building: "2", type: "menage" },
                            { time: "09H30", resident: "MME PETIT", room: "45", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Plonge cuisine", building: "1", type: "plonge" },
                        ],
                    },
                    {
                        date: "Mercredi 3 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. BERNARD", room: "203", building: "2", type: "menage" },
                            { time: "09H30", resident: "MME LEROY", room: "12", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "MME MOREAU", room: "156", building: "2", type: "menage" },
                            { time: "13H30", resident: "Lavettes", type: "lavettes" },
                        ],
                    },
                    {
                        date: "Jeudi 4 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. SIMON", room: "301", building: "1", type: "menage" },
                            { time: "09H30", resident: "MME LAURENT", room: "77", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                        absence: { type: "conges", replacedBy: "Julie PETIT" },
                    },
                    {
                        date: "Vendredi 5 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME MICHEL", room: "218", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. GARCIA", room: "99", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Hall d'entrée", building: "2", type: "hall" },
                        ],
                    },
                ],
            },
            {
                label: "Semaine du 8 au 12 septembre",
                days: [
                    {
                        date: "Lundi 8 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME CARDELL", room: "117", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. DURAND", room: "204", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                    },
                    {
                        date: "Mardi 9 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME FABRE", room: "312", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Plonge cuisine", building: "1", type: "plonge" },
                        ],
                    },
                    {
                        date: "Mercredi 10 septembre",
                        tasks: [],
                    },
                    {
                        date: "Jeudi 11 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. BERNARD", room: "203", building: "2", type: "menage" },
                            { time: "09H30", resident: "MME LEROY", room: "12", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "MME MOREAU", room: "156", building: "2", type: "menage" },
                        ],
                    },
                    {
                        date: "Vendredi 12 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. SIMON", room: "301", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Lavettes", type: "lavettes" },
                        ],
                    },
                ],
            },
            {
                label: "Semaine du 15 au 19 septembre",
                days: [
                    {
                        date: "Lundi 15 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME LAURENT", room: "77", building: "2", type: "menage" },
                            { time: "09H30", resident: "MME MICHEL", room: "218", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                    },
                    {
                        date: "Mardi 16 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. GARCIA", room: "99", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Hall d'entrée", building: "1", type: "hall" },
                        ],
                    },
                    {
                        date: "Mercredi 17 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME CARDELL", room: "117", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. DURAND", room: "204", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "MME FABRE", room: "312", building: "2", type: "menage" },
                        ],
                    },
                    {
                        date: "Jeudi 18 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. ET MME ROUX", room: "88", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                    },
                    {
                        date: "Vendredi 19 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME PETIT", room: "45", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. BERNARD", room: "203", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Plonge cuisine", building: "2", type: "plonge" },
                        ],
                    },
                ],
            },
            {
                label: "Semaine du 22 au 26 septembre",
                days: [
                    {
                        date: "Lundi 22 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME LEROY", room: "12", building: "1", type: "menage" },
                            { time: "09H30", resident: "MME MOREAU", room: "156", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                    },
                    {
                        date: "Mardi 23 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. SIMON", room: "301", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Lavettes", type: "lavettes" },
                        ],
                    },
                    {
                        date: "Mercredi 24 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME LAURENT", room: "77", building: "2", type: "menage" },
                            { time: "09H30", resident: "MME MICHEL", room: "218", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                        ],
                    },
                    {
                        date: "Jeudi 25 septembre",
                        tasks: [
                            { time: "08H00", resident: "M. GARCIA", room: "99", building: "2", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "Hall d'entrée", building: "2", type: "hall" },
                        ],
                    },
                    {
                        date: "Vendredi 26 septembre",
                        tasks: [
                            { time: "08H00", resident: "MME CARDELL", room: "117", building: "1", type: "menage" },
                            { time: "09H30", resident: "M. DURAND", room: "204", building: "1", type: "menage" },
                            { time: "11H30", resident: "—", type: "pause" },
                            { time: "12H00", resident: "MME FABRE", room: "312", building: "2", type: "menage" },
                            { time: "13H30", resident: "Plonge cuisine", building: "1", type: "plonge" },
                        ],
                    },
                ],
            },
        ],
    };
    const mockResidentNotices: ResidentNotice[] = [
        {
            name: "MME CARDELL",
            apartment: "117",
            building: "1",
            day: "MARDI 1 SEPTEMBRE",
            time: "10H00",
        },
        {
            name: "M. DURAND",
            apartment: "204",
            building: "1",
            day: "MARDI 1 SEPTEMBRE",
            time: "11H30",
        },
        {
            name: "MME FABRE",
            apartment: "312",
            building: "2",
            day: "MERCREDI 2 SEPTEMBRE",
            time: "09H00",
        },
        {
            name: "M. ET MME ROUX",
            apartment: "88",
            building: "2",
            day: "JEUDI 3 SEPTEMBRE",
            time: "14H00",
        },
    ];

    return <div className="mx-auto pt-8 flex flex-col space-y-8">
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Planning mensuelle</p>
            <GeneratePlanningPdf mode="monthly" planning={mockCleaningPlanning} />
        </div>
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Planning hebdomadaire</p>
            <GeneratePlanningPdf mode="weekly" planning={mockCleaningPlanning} />
        </div>
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Fiche ménage</p>
            <GenerateResidentNoticePdf notices={mockResidentNotices} />
        </div>
    </div>
}