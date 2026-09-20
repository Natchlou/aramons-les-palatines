import { createTw } from "@react-pdf/tailwind"

// Thème partagé par tous les documents PDF du projet.
// "brand" = terracotta de la palette Aramons Les Palatines.
export const tw = createTw({
  fontFamily: {
    sans: ["Helvetica"],
    mono: ["Courier"], // police intégrée à react-pdf, pas besoin de Font.register
  },
  colors: {
    brand: "#a54a28",
  },
})