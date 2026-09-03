import ResidentDialog from "@/components/resident-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createClient } from "@/lib/client";

const supabase = createClient();

export default async function AdminResidentsPage() {
  const { data, error } = await supabase
    .from("residents")
    .select("*");

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-w-7xl flex-1 flex-col px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des résidents
        </h1>

        <ResidentDialog />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun résident trouvé.
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
            {data.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">
                  {resident.last_name}
                </TableCell>

                <TableCell>
                  {resident.first_name}
                </TableCell>

                <TableCell>
                  Apt. {resident.room}
                </TableCell>

                <TableCell>
                  Bât. {resident.building}
                </TableCell>

                <TableCell className="text-right">
                  <ResidentDialog
                    resident={resident}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}