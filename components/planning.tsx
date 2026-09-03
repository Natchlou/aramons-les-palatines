import {
    HouseIcon,
    Pause,
    Utensils,
    WashingMachine,
} from "lucide-react";

const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
] as const;

type Day = (typeof days)[number];

type Resident = {
    name: string;
    room: string;
};

type Agent = {
    id: number;
    name: string;
    doesDishes: boolean;
};

type Task =
    | {
        type: "hall";
        start: string;
        end: string;
        building: string;
    }
    | {
        type: "menage";
        start: string;
        end: string;
        resident: Resident;
    }
    | {
        type: "pause";
        start: string;
        end: string;
    }
    | {
        type: "plonge";
        start: string;
        end: string;
    }
    | {
        type: "lavettes";
        start: string;
        end: string;
    };

type DayPlanning = Record<string, Task>;
type Planning = Record<number, Record<Day, DayPlanning>>;

const agents: Agent[] = [
    { id: 1, name: "Agent 1", doesDishes: true },
    { id: 2, name: "Agent 2", doesDishes: false },
];

const planning: Planning = {
    1: {
        Lundi: {
            "08:00": { type: "hall", start: "08:00", end: "08:30", building: "Bât. 1" },
            "08:30": { type: "menage", start: "08:30", end: "10:00", resident: { name: "Mme DUPONT", room: "Apt. 202 — Bât. 1" } },
            "10:00": { type: "menage", start: "10:00", end: "11:30", resident: { name: "M. MARTIN", room: "Apt. 104 — Bât. 2" } },
            "11:30": { type: "pause", start: "11:30", end: "12:00" },
            "12:00": { type: "plonge", start: "12:00", end: "14:00" },
            "14:00": { type: "menage", start: "14:00", end: "15:30", resident: { name: "Mme DOE", room: "Apt. 301 — Bât. 2" } },
        },
        Mardi: {},
        Mercredi: {},
        Jeudi: {},
        Vendredi: {},
    },
    2: {
        Lundi: {
            "08:00": { type: "hall", start: "08:00", end: "08:30", building: "Bât. 2" },
            "08:30": { type: "menage", start: "08:30", end: "10:00", resident: { name: "Mme DURAND", room: "Apt. 105 — Bât. 2" } },
            "10:00": { type: "menage", start: "10:00", end: "11:30", resident: { name: "M. ROBERT", room: "Apt. 201 — Bât. 1" } },
            "11:30": { type: "pause", start: "11:30", end: "12:00" },
            "12:00": { type: "menage", start: "12:00", end: "13:30", resident: { name: "Mme PETIT", room: "Apt. 302 — Bât. 1" } },
            "13:30": { type: "menage", start: "13:30", end: "15:00", resident: { name: "M. LEROY", room: "Apt. 108 — Bât. 2" } },
            "15:00": { type: "lavettes", start: "15:00", end: "15:30" },
        },
        Mardi: {},
        Mercredi: {},
        Jeudi: {},
        Vendredi: {},
    },
};

const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
];

function formatTime(time: string) {
    return time.replace(":", "h");
}

function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function getRowSpan(start: string, end: string) {
    const duration = timeToMinutes(end) - timeToMinutes(start);
    return duration / 30;
}

function isTimeInsideTask(task: Task, time: string) {
    const current = timeToMinutes(time);
    const start = timeToMinutes(task.start);
    const end = timeToMinutes(task.end);
    return current > start && current < end;
}

function getTaskAtTime(dayPlanning: DayPlanning, time: string) {
    return Object.values(dayPlanning).find(
        (task) => task.start === time || isTimeInsideTask(task, time),
    );
}

export default function PlanningMenage() {
    const today = new Date();

    return (
        <div>
            <h1 className="text-xl font-semibold uppercase">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(today)}
            </h1>
            <hr className="my-4" />
            <div className="space-y-10">
                {agents.map((agent) => (
                    <section key={agent.id}>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold">{agent.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {agent.doesDishes ? "Effectue la plonge" : "N'effectue pas la plonge"}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-7xl table-fixed border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-32 bg-accent p-2 rounded text-center uppercase">Horaire</th>
                                        {days.map((day) => (
                                            <th key={day} className="bg-accent p-2 rounded text-center uppercase">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((time) => (
                                        <tr key={time} className="h-10">
                                            <th className="w-32 text-center text-sm font-medium p-2">
                                                {formatTime(time)}
                                            </th>
                                            {days.map((day) => {
                                                const dayPlanning = planning[agent.id]?.[day] ?? {};
                                                const task = getTaskAtTime(dayPlanning, time);

                                                if (task && task.start !== time) {
                                                    return null;
                                                }

                                                if (!task) {
                                                    return (
                                                        <td key={`${day}-${time}`} className="p-0">
                                                            <CellEmpty />
                                                        </td>
                                                    );
                                                }

                                                const rowSpan = getRowSpan(task.start, task.end);
                                                return (
                                                    <td
                                                        key={`${day}-${time}`}
                                                        rowSpan={rowSpan}
                                                        className="p-0 align-top"
                                                    >
                                                        <TaskCell task={task} rowSpan={rowSpan} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

function TaskCell({ task, rowSpan }: { task: Task; rowSpan: number }) {
    return (
        <div
            className={`w-full h-full flex items-center justify-center gap-2 rounded px-2 font-medium
                ${task.type === "hall" ? "border border-blue-500 bg-blue-500/20" :
                    task.type === "menage" ? "border border-yellow-500 bg-yellow-500/55" :
                        task.type === "pause" ? "border border-orange-500 bg-orange-500/20" :
                            task.type === "plonge" ? "border border-cyan-500 bg-cyan-500/20" :
                                "border border-green-500 bg-green-500/20"
                }
            `}
            style={{ height: `${rowSpan * 40}px` }} // 40px = h-10 (2.5rem)
        >
            {task.type === "hall" && (
                <>
                    <HouseIcon className="size-5 shrink-0" />
                    <div>
                        <p>Hall</p>
                        <p className="text-xs text-muted-foreground">{task.building}</p>
                    </div>
                </>
            )}
            {task.type === "menage" && (
                <>
                    <HouseIcon className="size-5 shrink-0" />
                    <div>
                        <p>{task.resident.name}</p>
                        <p className="text-xs text-muted-foreground">{task.resident.room}</p>
                    </div>
                </>
            )}
            {task.type === "pause" && (
                <>
                    <Pause className="size-5" />
                    <span>Pause</span>
                </>
            )}
            {task.type === "plonge" && (
                <>
                    <Utensils className="size-5" />
                    <div>
                        <p>Plonge</p>
                        <p className="text-xs text-muted-foreground">Cuisine</p>
                    </div>
                </>
            )}
            {task.type === "lavettes" && (
                <>
                    <WashingMachine className="size-5" />
                    <span>Nettoyage lavettes</span>
                </>
            )}
        </div>
    );
}

function CellEmpty() {
    return <div className="rayure h-10 w-full rounded border border-dashed border-muted-foreground/30" />;
}