"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export type TransferItem = {
  id: string;
  label: string;
  description?: string;
};

type TransferListProps = {
  available: TransferItem[];
  selected: TransferItem[];
  onChange: (next: {
    available: TransferItem[];
    selected: TransferItem[];
  }) => void;
};

function pick(items: TransferItem[], ids: Set<string>) {
  return items.filter((item) => ids.has(item.id));
}

function omit(items: TransferItem[], ids: Set<string>) {
  return items.filter((item) => !ids.has(item.id));
}

type PanelProps = {
  title: string;
  items: TransferItem[];
  active: Set<string>;
  toggle: (id: string) => void;
};

function Panel({
  title,
  items,
  active,
  toggle,
}: PanelProps) {
  return (
    <div className="flex-1 overflow-hidden rounded-md border">
      <div className="border-b px-3 py-2 text-sm font-medium">
        {title}
      </div>

      <div className="max-h-60 space-y-1 overflow-y-auto p-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={active.has(item.id)}
              onChange={() => toggle(item.id)}
              className="mt-1"
            />

            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.label}
              </p>

              {item.description && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </label>
        ))}

        {items.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucun élément
          </p>
        )}
      </div>
    </div>
  );
}

export function TransferList({
  available,
  selected,
  onChange,
}: TransferListProps) {
  const [activeAvailable, setActiveAvailable] =
    React.useState<Set<string>>(new Set());

  const [activeSelected, setActiveSelected] =
    React.useState<Set<string>>(new Set());

  const toggle = (
    id: string,
    setActive: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    setActive((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const moveRight = () => {
    const items = pick(available, activeAvailable);

    if (items.length === 0) return;

    onChange({
      available: omit(available, activeAvailable),
      selected: [...selected, ...items],
    });

    setActiveAvailable(new Set());
  };

  const moveLeft = () => {
    const items = pick(selected, activeSelected);

    if (items.length === 0) return;

    onChange({
      available: [...available, ...items],
      selected: omit(selected, activeSelected),
    });

    setActiveSelected(new Set());
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Panel
        title="Available"
        items={available}
        active={activeAvailable}
        toggle={(id) => toggle(id, setActiveAvailable)}
      />

      <div className="flex shrink-0 flex-row gap-2 self-center md:flex-col">
        <Button
          type="button"
          onClick={moveRight}
          disabled={activeAvailable.size === 0}
        >
          Add →
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={moveLeft}
          disabled={activeSelected.size === 0}
        >
          ← Remove
        </Button>
      </div>

      <Panel
        title="Selected"
        items={selected}
        active={activeSelected}
        toggle={(id) => toggle(id, setActiveSelected)}
      />
    </div>
  );
}