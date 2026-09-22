import { prisma } from "@/lib/prisma";
import { EditProfileCard } from "./edit-profile-card";
import { requireManager } from "@/lib/auth";

export default async function ManagerProfilePage() {
  const manager = await requireManager();

  const profile = await prisma.user.findUnique({
    where: { id: manager.id },
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <header className="border-b border-slate-300 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Profil</p>
          <h1 className="mt-1 text-2xl font-bold">Profil Manajer</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola informasi akun dan data kontak Anda.</p>
        </header>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Nama</p>
            <p className="mt-1 text-lg font-semibold">{profile?.name}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 text-lg font-semibold">{profile?.email}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Nomor Telepon</p>
            <p className="mt-1 text-lg font-semibold">{profile?.phoneNumber ?? "Belum diisi"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-1 text-lg font-semibold">{profile?.role}</p>
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
