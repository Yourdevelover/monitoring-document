import { prisma } from "@/lib/prisma";
import { EditProfileCard } from "./edit-profile-card";
import { requireManager } from "@/lib/auth";

export default async function ManagerProfilePage() {
  const manager = await requireManager();

  const profile = await prisma.user.findUnique({
    where: { id: manager.id },
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-4">
        <header className="border-b border-[#e5e7eb] pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7280]">Profil</p>
          <h1 className="mt-1 text-base font-bold">Profil Manajer</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Kelola informasi akun dan data kontak Anda.</p>
        </header>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <p className="text-sm text-[#6b7280]">Nama</p>
            <p className="mt-1 text-sm font-medium">{profile?.name}</p>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <p className="text-sm text-[#6b7280]">Email</p>
            <p className="mt-1 text-sm font-medium">{profile?.email}</p>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <p className="text-sm text-[#6b7280]">Nomor Telepon</p>
            <p className="mt-1 text-sm font-medium">{profile?.phoneNumber ?? "Belum diisi"}</p>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <p className="text-sm text-[#6b7280]">Role</p>
            <p className="mt-1 text-sm font-medium">{profile?.role}</p>
          </div>
        </div>

        <EditProfileCard
          name={profile?.name ?? ""}
          email={profile?.email ?? ""}
          phoneNumber={profile?.phoneNumber ?? ""}
        />
      </div>
    </main>
  );
}
