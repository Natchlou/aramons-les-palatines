"use client";

import { useMemo, useState } from "react";

import ResidentTableRow from "@/components/resident-table-row";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/database.types";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

export default function ResidentsTable({
  residents,
}: {
  residents: ResidentRow[];
}) {
  const [search, setSearch] = useState("");

  const filteredResidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return residents;

    return residents.filter((resident) => {
      const haystack = [
        resident.last_name,
        resident.first_name,
        resident.room,
        resident.building,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [residents, search]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Rechercher un résident (nom, appartement, bâtiment...)"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      {filteredResidents.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-muted-foreground">
            Aucun résident ne correspond à la recherche.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Appartement</TableHead>
              <TableHead>Bâtiment</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredResidents.map((resident) => (
              <ResidentTableRow key={resident.id} resident={resident} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}