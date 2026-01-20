import Link from 'next/link';

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D1E17]">Staff Management</h2>
        <Link 
          href="/staff/verify"
          className="bg-[#2D1E17] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
        >
          <span>📷</span> Verify Attendance
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <span className="text-3xl">👥</span>
          <h3 className="mt-4 font-bold">Total Participants</h3>
          <p className="text-2xl font-black text-[#E89D71]">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <span className="text-3xl">🤝</span>
          <h3 className="mt-4 font-bold">Active Volunteers</h3>
          <p className="text-2xl font-black text-[#86B1A4]">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <span className="text-3xl">📅</span>
          <h3 className="mt-4 font-bold">Pending Events</h3>
          <p className="text-2xl font-black text-[#6B5A4E]">0</p>
        </div>
      </div>
    </div>
  );
}
