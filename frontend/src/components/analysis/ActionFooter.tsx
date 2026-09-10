export default function ActionFooter() {
  return (
    <div>
      <div className="flex gap-3 mb-3">
        <button className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
          Export PDF
        </button>
        <button className="flex-1 bg-primary-dark text-white rounded-lg py-2 text-sm hover:bg-primary cursor-pointer">
          Share with Doctor
        </button>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        All analyses are for informational purposes only. Consult a healthcare professional.
      </p>
    </div>
  );
}
