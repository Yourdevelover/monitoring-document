import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type EmployeeProfilePageProps = {
  searchParams: Promise<{ user?: string }>;
};

export default async function EmployeeProfilePage({ searchParams }: EmployeeProfilePageProps) {
  const employee = await requireEmployee();
  const { user: viewedUserId } = await searchParams;

  const profile = await prisma.user.findUnique({
    where: { id: Number(viewedUserId) || employee.id },
    include: {
      team: true,
    },
  });

  const canViewProfile = profile?.id === employee.id || profile?.teamId === employee.teamId;

  if (!profile || !canViewProfile) {
    return <p className="text-sm text-slate-600">Profil tidak ditemukan.</p>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="border-b border-slate-300 bg-white px-5 py-5 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Profil</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-white">
              {profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold">{profile.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Informasi karyawan</p>
            </div>
          </div>
        </header>

        <section className="bg-white px-5 py-2 sm:px-7">
          <div className="divide-y divide-slate-200">
            {[
              ["Email", profile.email],
              ["Nomor Telepon", profile.phoneNumber ?? "Belum diisi"],
              ["Tim", profile.team?.name ?? "Belum ditentukan"],
              ["Role", profile.role],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <p className="shrink-0 text-sm text-slate-500">{label}</p>
                <p className="break-words text-right text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {profile.id === employee.id && <section className="bg-white px-5 py-5 sm:px-7">
          <div className="mb-5 border-b border-slate-200 pb-4">
            <h2 className="text-sm font-semibold">Edit Profil</h2>
            <p className="mt-1 text-sm text-slate-500">Perubahan akan dikirim ke persetujuan manajer.</p>
          </div>

          <form action="/api/profile" method="POST" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={profile?.name ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-slate-700">
                Nomor Telepon
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                defaultValue={profile?.phoneNumber ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={profile?.email ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password Baru
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Kosongkan jika tidak ingin mengganti password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-slate-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:col-span-2 sm:justify-self-start"
            >
              Ajukan Edit ke Manajer
            </button>
          </form>
        </section>}

        <div className="flex justify-end">
          <BackToPreviousButton />
        </div>
      </div>
    </main>
  );
}
