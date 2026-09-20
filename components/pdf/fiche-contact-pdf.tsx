import { Image, Text, View } from "@react-pdf/renderer"

import PdfLayout from "./PDFLayout"
import { tw } from "./theme"

type Contact = {
  name: string
  role?: string
  phone?: string
  email?: string
  photoSrc?: string
}

type FicheContactProps = {
  title: string
  contacts: Contact[]
  date?: string
  category?: string
}

// Même coquille que FicheInformation, mais le contenu est une grille
// de cartes contact plutôt qu'un bloc de texte markdown.
export default function FicheContact({
  title,
  contacts,
  date,
  category = "FICHE CONTACTS",
}: FicheContactProps) {
  return (
    <PdfLayout title={title} category={category} date={date}>
      <View style={tw("flex-row flex-wrap")} wrap>
        {contacts.map((contact, i) => (
          <View key={i} style={tw("w-1/2 pr-3 pb-3")} wrap={false}>
            <View
              style={tw(
                "flex-row items-center border border-gray-200 rounded-lg p-3",
              )}
            >
              {contact.photoSrc ? (
                <Image
                  src={contact.photoSrc}
                  style={tw("w-10 h-10 rounded-full mr-3")}
                />
              ) : (
                <View
                  style={tw(
                    "w-10 h-10 rounded-full bg-gray-100 mr-3 items-center justify-center",
                  )}
                >
                  <Text style={tw("text-[11px] font-bold text-gray-400")}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={tw("flex-1")}>
                <Text style={tw("text-[10px] font-bold text-gray-900")}>
                  {contact.name}
                </Text>

                {contact.role ? (
                  <Text style={tw("text-[8px] text-brand mt-0.5")}>
                    {contact.role}
                  </Text>
                ) : null}

                {contact.phone ? (
                  <Text style={tw("text-[8px] text-gray-500 mt-0.5")}>
                    {contact.phone}
                  </Text>
                ) : null}

                {contact.email ? (
                  <Text style={tw("text-[8px] text-gray-500")}>
                    {contact.email}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    </PdfLayout>
  )
}