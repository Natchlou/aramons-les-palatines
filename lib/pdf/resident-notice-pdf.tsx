// lib/pdf/resident-notice-pdf.tsx
import fs from "node:fs";
import path from "node:path";

import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { createTw } from "@react-pdf/tailwind";

export type ResidentNotice = {
  name: string;
  apartment: string;
  building: string;
  day: string;
  time: string;
};

type ResidentNoticePdfProps = {
  notices: ResidentNotice[];
};

const tw = createTw({
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
});

const logoBuffer = fs.readFileSync(
  path.join(process.cwd(), "public/logo.png"),
);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

function NoticePage({ notice }: { notice: ResidentNotice }) {
  return (
    <Page size="A4" style={tw("bg-white p-8")}>
      <View style={tw("flex-1 border-4 p-8 flex flex-col items-center")}>
        <View style={tw("w-full flex justify-center items-center mb-10")}>
          <Image src={logoBase64} style={tw("w-full h-40")} />
        </View>

        <Text style={tw("text-7xl font-bold underline text-center uppercase mb-12")}>
          Votre ménage
        </Text>

        <View style={tw("flex-1 flex flex-col items-center justify-center gap-8 w-full")}>
          <Text style={tw("text-6xl text-center")}>
            Nom : <Text style={tw("font-bold")}>{notice.name}</Text>
          </Text>

          <Text style={tw("text-6xl text-center")}>
            Appartement :{" "}
            <Text style={tw("font-bold")}>{notice.apartment}</Text>
          </Text>

          <Text style={tw("text-6xl text-center")}>
            Bâtiment : <Text style={tw("font-bold")}>{notice.building}</Text>
          </Text>

          <View style={tw("font-bold border-2 p-6 flex flex-col items-center justify-center mt-6 w-4/5")}>
            <Text style={tw("text-4xl")}>{notice.day}</Text>
            <Text style={tw("text-4xl")}>à {notice.time}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

export default function ResidentNoticePdf({
  notices,
}: ResidentNoticePdfProps) {
  return (
    <Document
      title="Avis de ménage"
      author="Résidence Aramons / Les Palatines"
      subject="Avis de ménage"
    >
      {notices.map((notice, index) => (
        <NoticePage
          key={`${notice.apartment}-${index}`}
          notice={notice}
        />
      ))}
    </Document>
  );
}