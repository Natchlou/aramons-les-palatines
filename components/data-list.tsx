import React from "react";
import { Separator } from "@/components/ui/separator";

type Props = {
    data: {
        title: string;
        value: string | React.ReactNode | null;
    }[];
};

export default function DataList({ data }: Props) {
    return (
        <div className="space-y-3">
            {data.map((d, index) => (
                <React.Fragment key={index}>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {d.title}
                        </p>

                        <p>{d.value}</p>
                    </div>

                    {index < data.length - 1 && <Separator />}
                </React.Fragment>
            ))}
        </div>
    );
}
