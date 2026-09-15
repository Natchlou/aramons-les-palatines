import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans">
        <h1 className="text-4xl font-bold mb-2">Bienvenue chez Aramons Les Palatines</h1>
        <h2 className="text-2xl">Vous trouvez ici la génération de planning de ménage</h2>
      </div>
    </>
  );
}
