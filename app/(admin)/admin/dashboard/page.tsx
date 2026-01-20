export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#2D1E17]">Executive Overview</h2>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
        <h3 className="text-xl font-bold mb-4">Platform Health</h3>
        <div className="h-64 bg-zinc-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-200 text-zinc-400">
          Analytics Chart Placeholder
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h4 className="font-bold">Recent Staff Activity</h4>
          <p className="text-sm text-zinc-500 mt-2">No activity recorded today.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h4 className="font-bold">Security Logs</h4>
          <p className="text-sm text-zinc-500 mt-2">All systems normal.</p>
        </div>
      </div>
    </div>
  );
}
