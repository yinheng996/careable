export default function ParticipantDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <h2 className="text-2xl font-bold text-[#2D1E17]">Welcome back!</h2>
        <p className="text-[#6B5A4E]">Check your upcoming events and messages.</p>
      </div>
      
      <div className="grid gap-4">
        <h3 className="font-bold text-[#2D1E17]">Upcoming Events</h3>
        <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center py-10">
          <p className="text-zinc-400">No events scheduled yet.</p>
        </div>
      </div>
    </div>
  );
}
