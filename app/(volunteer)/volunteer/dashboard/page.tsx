export default function VolunteerDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <h2 className="text-2xl font-bold text-[#2D1E17]">Volunteer Dashboard</h2>
        <p className="text-[#6B5A4E]">See where you can help today.</p>
      </div>
      
      <div className="grid gap-4">
        <h3 className="font-bold text-[#2D1E17]">Opportunities</h3>
        <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center py-10">
          <p className="text-zinc-400">Loading new opportunities...</p>
        </div>
      </div>
    </div>
  );
}
