import DataList from "@/components/data-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Database } from "@/database.types"
import { createClient } from "@/lib/client"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Types
type ResidentRow = Database['public']['Tables']['residents']['Row'];
type ConstraintRow = Database['public']['Tables']['constraintes']['Row'];

export default async function AdminResidentShow({
    params,
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params

    const supabase = createClient()

    const { data: resident, error: errorResident } = await supabase
        .from("residents")
        .select("*")
        .eq('id', uuid)
        .single();

    const { data: constraintes, error: errorConstraintes } = await supabase
        .from('constraintes')
        .select('*')
        .eq('resident_id', uuid)
        .single<ConstraintRow>();

    const { data: recents_menages, error: errorRecentsMenage } = await supabase
        .from('recents_menages')
        .select('*')
        .eq('resident_id', uuid)
        .select();

    if (errorResident || errorConstraintes || errorRecentsMenage) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-destructive">
                    Une erreur est survenue : {errorResident?.message}
                </p>
            </div>
        );
    }

    function splitCamelCaseArray(daysArray: string[]): string[] {
  return daysArray.flatMap(dayString =>
    dayString.split(/(?=[A-Z])/).map(day =>
      day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
    )
  );
}

    return (
        <div className="mx-auto flex min-w-7xl flex-1 flex-col px-4 py-8 font-sans gap-6">
            {/* ===== En-tête : identité ===== */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image src={'/default.png'} alt="" width={256} height={256} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {resident.last_name} {resident.first_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">Fiche du résident</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant={'link'}>
                        <Link href={'/admin/residents'} className="flex items-center gap-1"><ArrowLeftIcon /> Retour</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_350px]">

                {/* ===== Colonne principale ===== */}
                <div className="flex flex-col gap-4">

                    {constraintes.disallow_days || constraintes.schedule_hours ? <Alert variant={'destructive'}>
                        <AlertTitle>Attention ce résident à des contraintes de ménages</AlertTitle>
                        <AlertDescription>
                            {constraintes.disallow_days ? <p>Jour de ménage : {splitCamelCaseArray(constraintes.disallow_days)}</p> : ''}
                            {constraintes.schedule_hours ? <p>Heure du ménage : {constraintes.schedule_hours}</p> : ''}
                        </AlertDescription>
                    </Alert> : ''}


                    <Card>
                        <CardHeader>
                            <CardTitle>Ménages récents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Heure</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Payé ?</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {recents_menages.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {Intl.DateTimeFormat('fr', { dateStyle: 'full' }).format(new Date(item.date))}
                                            </TableCell>
                                            <TableCell>
                                                {Intl.DateTimeFormat('fr', { hour: 'numeric', minute: 'numeric', hour12: false }).format(new Date(`1970-01-01T${item.heure}`))}
                                            </TableCell>
                                            <TableCell>
                                                {item.status}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.is_paid ? 'default' : 'destructive'}>{item.is_paid ? 'Oui' : 'Non'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* ===== Colonne latérale ===== */}
                <div className="flex flex-col gap-4">

                    {/* Propriétés / contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <DataList data={[
                                { title: 'Appartement', value: resident.room },
                                { title: 'Bâtiment', value: resident.building },
                                { title: 'Facture', value: <Badge>{constraintes.bill ?? 'À définir'}</Badge> },
                                { title: 'Prélèvement', value: `Tous les ${constraintes.debiting} du mois` },
                                { title: 'Nombre de ménage', value: constraintes.per_week },
                            ]} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>)
}