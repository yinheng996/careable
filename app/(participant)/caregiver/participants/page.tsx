import { getManagedParticipants } from '@/app/actions/caregiver';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, Calendar, Heart, AlertCircle } from 'lucide-react';

export default async function CaregiverParticipantsPage() {
  const result = await getManagedParticipants();
  const participants = result.success ? result.data : [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Managed Participants</h1>
          <p className="text-[#6B5A4E] mt-1">Children and individuals you care for</p>
        </div>
        <Link 
          href="/caregiver/participants/add"
          className="flex items-center gap-2 px-4 py-2 bg-[#E89D71] text-white rounded-xl font-semibold hover:bg-[#D88C61] transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Add Participant
        </Link>
      </div>

      {/* Empty State */}
      {participants.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-[#FEF3EB] to-white border-0">
          <div className="w-16 h-16 bg-[#E89D71]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#E89D71]" />
          </div>
          <h3 className="text-lg font-bold text-[#2D1E17] mb-2">No participants yet</h3>
          <p className="text-[#6B5A4E] mb-6 max-w-md mx-auto">
            Add a participant to register them for events and manage their activity schedule
          </p>
          <Link 
            href="/caregiver/participants/add"
            className="inline-block px-6 py-3 bg-[#E89D71] text-white rounded-xl font-semibold hover:bg-[#D88C61] transition-colors shadow-sm"
          >
            Add Your First Participant
          </Link>
        </Card>
      ) : (
        /* Participants List */
        <div className="grid grid-cols-1 gap-4">
          {participants.map((link: any) => {
            const displayName = link.participant?.participant_full_name || link.participant?.full_name || 'Participant';
            const hasSpecialNeeds = link.participant?.special_needs;
            
            return (
              <Card key={link.id} className="p-6 bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Participant Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#FEF3EB] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-[#E89D71]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#2D1E17]">{displayName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-zinc-100 text-[#6B5A4E] rounded-lg text-xs font-medium capitalize">
                            {link.relationship}
                          </span>
                          {link.participant?.membership_type && (
                            <span className="px-2 py-1 bg-[#E8F3F0] text-[#86B1A4] rounded-lg text-xs font-medium">
                              {link.participant.membership_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Special Needs */}
                    {hasSpecialNeeds && (
                      <div className="ml-15 p-3 bg-[#FEF3EB] rounded-lg border border-[#E89D71]/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[#E89D71] mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#E89D71] uppercase tracking-wide mb-1">
                              Special Needs
                            </div>
                            <div className="text-sm text-[#6B5A4E]">{link.participant.special_needs}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <Link 
                      href={`/caregiver/participants/${link.participant_id}/events`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E89D71] text-white rounded-lg font-medium hover:bg-[#D88C61] transition-colors text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      View Events
                    </Link>
                    <Link 
                      href={`/caregiver/participants/${link.participant_id}/edit`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-[#6B5A4E] rounded-lg font-medium hover:bg-zinc-50 transition-colors text-sm"
                    >
                      Edit Details
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <Card className="p-4 bg-[#F0F9FF] border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[#2D1E17] text-sm">Caregiver Support</div>
            <div className="text-xs text-[#6B5A4E] mt-1">
              You can register participants for events, view their schedules, and manage their profiles from here. 
              All registrations require your approval before check-in.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
