import { prisma } from "@/lib/prisma";
import { EditProfileCard } from "./edit-profile-card";
import { requireLeader } from "@/lib/auth";

export default async function LeaderProfilePage() {
  const leader = await requireLeader();

  const profile = await prisma.user.findUnique({
    where: { id: leader.id },
    include: { department: true },
  });

  return (
    <main className="min-h-screen bg-[#f3f6fa] px-4 py-8 text-[#111111] sm:px-6">
      <div className="w-full">
        {profile && (
          <EditProfileCard
            name={profile.name}
            email={profile.email}
            phoneNumber={profile.phoneNumber ?? ""}
            nik={profile.nik ?? ""}
            address={profile.address ?? ""}
            role={profile.role}
            isActive={profile.isActive}
            createdAt={profile.createdAt}
            department={profile.department?.name ?? ""}
          />
        )}
      </div>
    </main>
  );
}
