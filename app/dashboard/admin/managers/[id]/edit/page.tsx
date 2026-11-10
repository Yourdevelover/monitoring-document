import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type EditLeaderProps = { params: Promise<{ id: string }> };

export default async function EditLeaderPage({ params }: EditLeaderProps) {
  await requireAdmin();
  const { id } = await params;
  const leader = await prisma.user.findFirst({ where: { id: Number(id), role: "LEADER" } });
  if (!leader) notFound();

  return (
    <main className="space-y-4">
      <header className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Kelola Leader</p>
        <h1 className="mt-1 text-[13px] font-semibold tracking-tight">Edit Leader</h1>
      </header>
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
      <form action="/api/admin/leaders/update" method="POST" className="grid max-w-2xl gap-3">
        <input type="hidden" name="userId" value={leader.id} />
        <input name="name" defaultValue={leader.name} placeholder="Nama leader" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="email" type="email" defaultValue={leader.email} placeholder="Email" required className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="phoneNumber" type="tel" defaultValue={leader.phoneNumber ?? ""} placeholder="Nomor telepon (opsional)" className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <input name="password" type="password" placeholder="Password baru (opsional)" minLength={6} className="border border-[#e5e7eb] px-3 py-2 text-sm" />
        <button type="submit" className="btn btn-primary w-fit">Simpan Perubahan</button>
      </form>
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
