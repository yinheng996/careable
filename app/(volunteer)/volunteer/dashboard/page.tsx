import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations } from '@/lib/supabase/db';
import AttendanceQR from '@/src/components/AttendanceQR';

export default async function VolunteerDashboard() {
  const { userId } = await auth();
  const registrations = await getUserRegistrations(userId!);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <h2 className="text-2xl font-bold text-[#2D1E17]">Volunteer Dashboard</h2>
        <p className="text-[#6B5A4E]">See where you can help today.</p>
      </div>
      
      <div className="grid gap-4">
        <h3 className="font-bold text-[#2D1E17]">My Registered Events</h3>
        {registrations.length > 0 ? (
          <div className="grid gap-4">
            {registrations.map((reg: any) => (
              <div key={reg.id} className="bg-white p-4 rounded-xl border border-zinc-100 flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-[#2D1E17]">{reg.events.title}</h4>
                  <p className="text-sm text-zinc-500">{new Date(reg.events.start_time).toLocaleDateString()} at {reg.events.location}</p>
                  <p className="text-xs mt-1">
                    Status: <span className={`font-medium ${reg.status === 'attended' ? 'text-green-600' : 'text-blue-600'}`}>
                      {reg.status}
                    </span>
                  </p>
                </div>
                {reg.status !== 'attended' && (
                  <AttendanceQR 
                    registrationId={reg.id} 
                    eventTitle={reg.events.title} 
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center py-10">
            <p className="text-zinc-400">No events scheduled yet.</p>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <h3 className="font-bold text-[#2D1E17]">New Opportunities</h3>
        <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center py-10">
          <p className="text-zinc-400">Loading new opportunities...</p>
        </div>
      </div>
    </div>
  );
}
