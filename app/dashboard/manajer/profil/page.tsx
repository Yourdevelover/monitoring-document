import { prisma } from "@/lib/prisma";
import { requireManajer } from "@/lib/auth";

export default async function ManagerProfilePage() {
  const manager = await requireManajer();
  const profile = await prisma.user.findUnique({
    where: { id: manager.id },
    include: { department: true },
  });
  const fields = [
    ["Nama", profile?.name ?? "-"],
    ["Email", profile?.email ?? "-"],
    ["Nomor telepon", profile?.phoneNumber ?? "Belum diisi"],
    ["Departemen", profile?.department?.name ?? "-"],
    ["Status", profile?.isActive ?? "-"],
  ];
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="border-b border-[#e5e7eb] pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
            Akun
          </p>
          <h1 className="mt-1 text-[15px] font-semibold">Profil Manajer</h1>
        </header>
        <section className="divide-y divide-[#e5e7eb] border-y border-[#d1d5db] bg-white px-4">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]"
            >
              <span className="text-xs text-[#6b7280]">{label}</span>
              <span className="break-words text-xs font-medium">{value}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
