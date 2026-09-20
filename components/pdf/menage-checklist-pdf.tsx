import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { createTw } from "@react-pdf/tailwind";

const tw = createTw({});

type Resident = {
    id?: string;
    first_name: string;
    last_name: string;
    room: string;
    building: string;
};

type ChecklistSection = {
    title: string;
    items: string[];
};

type MenageChecklistProps = {
    residents: Resident[];
};

const columns: ChecklistSection[][] = [
    [
        {
            title: "Salle de bain",
            items: [
                "WC",
                "Evier",
                "Douche",
                "Miroir",
                "Poussières",
                "Plinthes",
                "Interrupteurs",
                "Sol",
                "Traces sur les murs",
                "VMC",
            ],
        },
        {
            title: "Chambre",
            items: [
                "Poussières",
                "Plinthes",
                "Interrupteurs",
                "Fenêtre + encadrement",
                "Sol",
            ],
        },
        {
            title: "Salon",
            items: [
                "Poussières",
                "Plinthes",
                "Interrupteurs",
                "Fenêtre + encadrement",
                "Sol",
                "Canapé ou fauteuil",
            ],
        },
    ],
    [
        {
            title: "Cuisine",
            items: [
                "Haut de placards",
                "Placard",
                "Plan de travail",
                "Frigo",
                "Sol sous frigo / évier",
                "Interrupteur",
                "Plinthes",
                "Sol",
                "VMC",
                "Micro-ondes",
            ],
        },
        {
            title: "Terrasse",
            items: [
                "Rambarde",
                "Sol",
                "Toiles d'araignées",
            ],
        },
    ],
    [
        {
            title: "Autre",
            items: [
                "Porte d'entrée",
                "Tapis",
            ],
        },
        {
            title: "Prestation supplémentaire",
            items: [
                "________________________",
                "________________________",
                "________________________",
                "________________________",
            ],
        },
    ],
];

function Checkbox() {
    return (
        <View
            style={tw(
                "mr-1.5 h-3 w-3 rounded-sm border border-gray-500",
            )}
        />
    );
}

function ChecklistItem({ label }: { label: string }) {
    return (
        <View style={tw("mb-1 flex flex-row items-center")}>
            <Checkbox />

            <Text
                style={tw(
                    "flex-1 text-[7.5px] leading-[9px] text-gray-800",
                )}
            >
                {label.toLocaleUpperCase('fr-FR')}
            </Text>
        </View>
    );
}

function ChecklistSection({
    title,
    items,
}: ChecklistSection) {
    return (
        <View
            style={tw(
                "mb-2 overflow-hidden rounded-md border border-gray-200",
            )}
        >
            <View
                style={tw(
                    "border-b border-gray-200 bg-gray-100 px-2 py-1.5",
                )}
            >
                <Text
                    style={tw(
                        "text-[7.5px] font-bold text-gray-900",
                    )}
                >
                    {title.toUpperCase()}
                </Text>
            </View>

            <View style={tw("px-2 py-1.5")}>
                {items.map((item, index) => (
                    <ChecklistItem
                        key={`${title}-${index}`}
                        label={item}
                    />
                ))}
            </View>
        </View>
    );
}

function ImportantNotice() {
    return (
        <View
            style={tw(
                "mt-2 rounded-md border border-gray-300 bg-gray-50 px-2.5 py-2",
            )}
        >
            <Text
                style={tw(
                    "mb-1 text-[8px] font-bold text-gray-900",
                )}
            >
                Important
            </Text>

            <View
                style={tw(
                    "mb-0.5 flex flex-row items-start",
                )}
            >
                <Text
                    style={tw(
                        "mr-1 text-[8px] text-gray-700",
                    )}
                >
                    •
                </Text>

                <Text
                    style={tw(
                        "flex-1 text-[7.5px] leading-[9px] text-gray-700",
                    )}
                >
                    Penser à déplacer les &quot;meubles&quot;
                </Text>
            </View>

            <View
                style={tw(
                    "mb-0.5 flex flex-row items-start",
                )}
            >
                <Text
                    style={tw(
                        "mr-1 text-[8px] text-gray-700",
                    )}
                >
                    •
                </Text>

                <Text
                    style={tw(
                        "flex-1 text-[7.5px] leading-[9px] text-gray-700",
                    )}
                >
                    Penser à tout remettre à leur place
                </Text>
            </View>

            <View
                style={tw(
                    "mb-0.5 flex flex-row items-start",
                )}
            >
                <Text
                    style={tw(
                        "mr-1 text-[8px] text-gray-700",
                    )}
                >
                    •
                </Text>

                <Text
                    style={tw(
                        "flex-1 text-[7.5px] leading-[9px] text-gray-700",
                    )}
                >
                    Bien respecter le code couleur des lavettes/produits
                </Text>
            </View>

            <View
                style={tw(
                    "flex flex-row items-start",
                )}
            >
                <Text
                    style={tw(
                        "mr-1 text-[8px] text-gray-700",
                    )}
                >
                    •
                </Text>

                <Text
                    style={tw(
                        "flex-1 text-[7.5px] leading-[9px] text-gray-700",
                    )}
                >
                    Penser à mettre de l&apos;acide dans les toilettes / et
                    d&apos;utiliser la javel pour la cuisine
                </Text>
            </View>
        </View>
    );
}

function ResidentChecklist({
    resident,
}: {
    resident: Resident;
}) {
    return (
        <View
            style={tw(
                "relative h-full w-1/2 px-4 py-4",
            )}
        >
            {/* Bordure de découpe */}
            <View
                fixed
                style={tw(
                    "absolute bottom-2 left-2 right-2 top-2 border border-dashed border-gray-400",
                )}
            />

            {/* Contenu de la fiche */}
            <View style={tw("h-full")}>
                {/* En-tête */}
                <View
                    style={tw(
                        "mb-2 flex flex-row items-center justify-between",
                    )}
                >
                    <View
                        style={tw(
                            "flex flex-1 flex-row items-center",
                        )}
                    >
                        <Image
                            src="/logo.png"
                            style={tw(
                                "mr-2 h-7 w-20 object-contain",
                            )}
                        />

                        <View>
                            <Text
                                style={tw(
                                    "text-[8px] font-bold text-gray-900",
                                )}
                            >
                                ARAMONS LES PALATINES
                            </Text>

                            <Text
                                style={tw(
                                    "mt-0.5 text-[7px] text-gray-500",
                                )}
                            >
                                Checklist Ménage
                            </Text>
                        </View>
                    </View>

                    <View
                        style={tw(
                            "ml-2 rounded-md border border-gray-200 px-2 py-1.5",
                        )}
                    >
                        <Text
                            style={tw(
                                "text-[6px] text-gray-500",
                            )}
                        >
                            DATE
                        </Text>

                        <Text
                            style={tw(
                                "mt-0.5 text-[7px] text-gray-800",
                            )}
                        >
                            ________ / ________ / ____________
                        </Text>
                    </View>
                </View>

                {/* Informations résident */}
                <View
                    style={tw(
                        "mb-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2",
                    )}
                >
                    <View style={tw("flex flex-row")}>
                        <View style={tw("flex-1")}>
                            <Text
                                style={tw(
                                    "text-[6px] font-bold text-gray-500",
                                )}
                            >
                                RÉSIDENT
                            </Text>

                            <Text
                                style={tw(
                                    "mt-0.5 text-[8px] font-bold text-gray-900",
                                )}
                            >
                                {resident.last_name}
                            </Text>
                        </View>

                        <View style={tw("w-14")}>
                            <Text
                                style={tw(
                                    "text-[6px] font-bold text-gray-500",
                                )}
                            >
                                CHAMBRE
                            </Text>

                            <Text
                                style={tw(
                                    "mt-0.5 text-[8px] font-bold text-gray-900",
                                )}
                            >
                                {resident.room}
                            </Text>
                        </View>

                        <View style={tw("w-10")}>
                            <Text
                                style={tw(
                                    "text-[6px] font-bold text-gray-500",
                                )}
                            >
                                BÂT.
                            </Text>

                            <Text
                                style={tw(
                                    "mt-0.5 text-[8px] font-bold text-gray-900",
                                )}
                            >
                                {resident.building}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Checklists en 3 colonnes */}
                <View style={tw("flex flex-1 flex-row")}>
                    {columns.map((column, columnIndex) => (
                        <View
                            key={columnIndex}
                            style={tw(
                                columnIndex === 0
                                    ? "mr-1 flex-1"
                                    : columnIndex === 1
                                        ? "mx-0.5 flex-1"
                                        : "ml-1 flex-1",
                            )}
                        >
                            {column.map((section) => (
                                <ChecklistSection
                                    key={section.title}
                                    title={section.title}
                                    items={section.items}
                                />
                            ))}
                        </View>
                    ))}
                </View>

                {/* Observations */}
                <View
                    style={tw(
                        "mt-1 rounded-md border border-gray-200 px-2.5 py-2",
                    )}
                >
                    <Text
                        style={tw(
                            "mb-4 text-[7.5px] font-bold text-gray-900",
                        )}
                    >
                        OBSERVATIONS / ANOMALIES
                    </Text>

                    <View
                        style={tw(
                            "mb-4 border-b border-gray-300",
                        )}
                    />

                    <View
                        style={tw(
                            "mb-4 border-b border-gray-300",
                        )}
                    />

                    <View
                        style={tw(
                            "border-b border-gray-300",
                        )}
                    />
                </View>

                {/* Informations importantes */}
                <ImportantNotice />

                {/* Validation */}
                <View
                    style={tw(
                        "mt-2 flex flex-row items-end",
                    )}
                >
                    <View style={tw("flex-1")}>
                        <View
                            style={tw(
                                "mb-1 flex flex-row items-center",
                            )}
                        >
                            <Checkbox />

                            <Text
                                style={tw(
                                    "text-[7.5px] text-gray-800",
                                )}
                            >
                                Ménage terminé
                            </Text>
                        </View>

                        <View
                            style={tw(
                                "flex flex-row items-center",
                            )}
                        >
                            <Checkbox />

                            <Text
                                style={tw(
                                    "text-[7.5px] text-gray-800",
                                )}
                            >
                                Anomalie signalée
                            </Text>
                        </View>
                    </View>

                    <View style={tw("ml-2 w-20")}>
                        <Text
                            style={tw(
                                "mb-1 text-[6px] text-gray-500",
                            )}
                        >
                            SIGNATURE
                        </Text>

                        <View
                            style={tw(
                                "border-b border-gray-500",
                            )}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

function A4Page({
    residents,
}: {
    residents: Resident[];
}) {
    return (
        <Page
            size="A4"
            orientation="landscape"
            style={tw("bg-white")}
        >
            <View style={tw("flex h-full w-full flex-row")}>
                {residents.map((resident, index) => (
                    <ResidentChecklist
                        key={
                            resident.id ??
                            `${resident.building}-${resident.room}-${index}`
                        }
                        resident={resident}
                    />
                ))}
            </View>
        </Page>
    );
}

export default function MenageChecklist({
    residents,
}: MenageChecklistProps) {
    const pages: Resident[][] = [];

    for (let i = 0; i < residents.length; i += 2) {
        pages.push(residents.slice(i, i + 2));
    }

    return (
        <Document
            title="Checklists Ménage"
            author="Aramons Les Palatines"
            subject="Checklists de ménage des résidents"
        >
            {pages.map((pageResidents, index) => (
                <A4Page
                    key={`page-${index}`}
                    residents={pageResidents}
                />
            ))}
        </Document>
    );
}