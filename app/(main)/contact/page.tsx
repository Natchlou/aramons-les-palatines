import { Card, CardContent } from "@/components/ui/card"
import { MailIcon, ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Contact() {
    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                    <span className="mb-3 inline-block text-sm font-medium text-primary">
                        Contact
                    </span>

                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                        Parlons de votre projet
                    </h2>

                    <p className="mt-4 text-muted-foreground sm:text-lg">
                        Une question, une idée ou un projet à développer ?
                        N&apos;hésitez pas à me contacter.
                    </p>
                </div>

                {/* Content */}
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-2xl border bg-muted shadow-sm">
                        <Image
                            src="/image-1.webp"
                            alt="Illustration représentant le contact"
                            width={768}
                            height={768}
                            className="aspect-square w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Contact */}
                    <div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Une idée en tête ?
                            </h3>

                            <p className="mt-3 leading-7 text-muted-foreground">
                                Je suis disponible pour échanger autour de vos
                                besoins en développement web, d&apos;une
                                application ou simplement pour discuter d&apos;un
                                projet.
                            </p>
                        </div>

                        <Card className="overflow-hidden border-border/60 shadow-sm">
                            <CardContent className="p-0">
                                <Link
                                    href="mailto:n.jullien57@gmail.com"
                                    className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/50 sm:p-6"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <MailIcon className="size-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm text-muted-foreground">
                                                Adresse e-mail
                                            </p>

                                            <p className="truncate font-medium">
                                                n.jullien57@gmail.com
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowUpRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                                </Link>
                            </CardContent>
                        </Card>

                        <p className="mt-4 text-sm text-muted-foreground">
                            Je réponds généralement dans les meilleurs délais.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}