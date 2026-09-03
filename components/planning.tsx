import { HouseIcon } from "lucide-react";

const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
];

const timeSlots = [
    "8h / 9h30",
    "9h30 / 11h",
    "11h / 12h30",
    "13h / 14h30",
    "14h30 / 16h",
    "16h / 17h30",
];

type Resident = {
    name: string;
    room: string;
};

type Planning = {
    [day: string]: {
        [time: string]: Resident | null;
    };
};

const planning: Planning = {
    Lundi: {
        "8h / 9h30": {
            name: "Mme DOE",
            room: "Apt. 202 - Bât. 1",
        },
        "9h30 / 11h": {
            name: "M. DUPONT",
            room: "Apt. 104 - Bât. 2",
        },
        "11h / 12h30": null,
        "13h / 14h30": {
            name: "Mme MARTIN",
            room: "Apt. 301 - Bât. 1",
        },
        "14h30 / 16h": null,
        "16h / 17h30": null,
    },

    Mardi: {
        "8h / 9h30": null,
        "9h30 / 11h": {
            name: "Mme DURAND",
            room: "Apt. 105 - Bât. 2",
        },
        "11h / 12h30": null,
        "13h / 14h30": null,
        "14h30 / 16h": {
            name: "M. ROBERT",
            room: "Apt. 201 - Bât. 1",
        },
        "16h / 17h30": null,
    },

    Mercredi: {
        "8h / 9h30": {
            name: "Mme DOE",
            room: "Apt. 202 - Bât. 1",
        },
        "9h30 / 11h": null,
        "11h / 12h30": null,
        "13h / 14h30": {
            name: "Mme MARTIN",
            room: "Apt. 301 - Bât. 1",
        },
        "14h30 / 16h": null,
        "16h / 17h30": null,
    },

    Jeudi: {
        "8h / 9h30": null,
        "9h30 / 11h": null,
        "11h / 12h30": {
            name: "M. DUPONT",
            room: "Apt. 104 - Bât. 2",
        },
        "13h / 14h30": null,
        "14h30 / 16h": null,
        "16h / 17h30": null,
    },

    Vendredi: {
        "8h / 9h30": {
            name: "Mme DURAND",
            room: "Apt. 105 - Bât. 2",
        },
        "9h30 / 11h": null,
        "11h / 12h30": null,
        "13h / 14h30": null,
        "14h30 / 16h": {
            name: "M. ROBERT",
            room: "Apt. 201 - Bât. 1",
        },
        "16h / 17h30": null,
    },
};

export default function PlanningMenage() {
    const today = new Date();

    return (
        <div>
            <h1 className="text-xl font-semibold uppercase">
                {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "full",
                }).format(today)}
            </h1>

            <hr className="my-4" />

            <div className="overflow-x-auto">
                <table className="w-full min-w-275 border-separate border-spacing-1">
                    <thead>
                        <tr className="uppercase">
                            <th className="h-20 w-45 rounded bg-accent text-center font-bold">
                                Horaire
                            </th>

                            {days.map((day) => (
                                <th
                                    key={day}
                                    className="h-20 w-45 rounded bg-accent text-center font-bold"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {timeSlots.map((time) => (
                            <tr key={time}>
                                <th className="h-20 text-center font-medium">
                                    {time}
                                </th>

                                {days.map((day) => {
                                    const resident =
                                        planning[day]?.[time] ?? null;

                                    return (
                                        <td key={`${day}-${time}`}>
                                            {resident ? (
                                                <Cell {...resident} />
                                            ) : (
                                                <CellEmpty />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

type CellProps = Resident;

function Cell({ name, room }: CellProps) {
    return (
        <div className="flex h-20 w-full items-center justify-center gap-2 rounded border border-yellow-500 bg-yellow-500/55 px-2 font-medium">
            <HouseIcon className="size-5 shrink-0" />

            <div>
                <p>{name}</p>
                <p className="text-xs text-muted-foreground">
                    {room}
                </p>
            </div>
        </div>
    );
}

function CellEmpty() {
    return (
        <div className="rayure h-20 w-full rounded border border-dashed border-muted-foreground/30" />
    );
}