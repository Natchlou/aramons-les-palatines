import PlanningMenage from "@/components/planning";
import DialogPlanning from "@/components/dialog-planning";

export default function Planning() {
  return (
    <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
        <DialogPlanning />
      </div>
      <PlanningMenage />
    </div>
  );
}
