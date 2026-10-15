import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Direction = "vertical" | "horizontal";

type Props = {
    data: {
        title: string;
        value: string | React.ReactNode | null;
    }[];
    /**
     * Orientation d'affichage :
     * - "vertical"   : label au-dessus de la valeur (par défaut)
     * - "horizontal" : label à gauche, valeur à droite
     */
    direction?: Direction;
    /** Espacement entre les items. */
    className?: string;
};

export default function DataList({
    data,
    direction = "vertical",
    className,
}: Props) {
    return (
        <div className={cn("space-y-3", className)}>
            {data.map((d, index) => (
                <React.Fragment key={index}>
                    <div
                        className={cn(
                            direction === "horizontal" &&
                                "flex items-baseline justify-between gap-4",
                        )}
                    >
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {d.title}
                        </p>

                        <p
                            className={cn(
                                direction === "horizontal" && "text-right",
                            )}
                        >
                            {d.value}
                        </p>
                    </div>

                    {index < data.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
}