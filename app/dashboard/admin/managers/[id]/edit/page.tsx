import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

type EditManagerProps = { params: Promise<{ id: string }> };

export default async function EditManagerPage({ params }: EditManagerProps) {
  await requireAdmin();
  const { id } = await params;
  const manager = await prisma.user.findFirst({ where: { id: Number(id), role: "MANAGER" } });
  if (!manager) notFound();

  return (
    <main className="space-y-4 p-4 text-slate-900">
      <header className="border-b border-slate-300 pb-4">
        <h1 className="mt-2 text-base font-semibold">Edit Manajer</h1>
      </header>
      <form action="/api/admin/managers/update" method="POST" className="grid max-w-2xl gap-3">
        <input type="hidden" name="userId" value={manager.id} />
        <input name="name" defaultValue={manager.name} placeholder="Nama manajer" required className="border border-slate-300 px-3 py-2" />
        <input name="email" type="email" defaultValue={manager.email} placeholder="Email" required className="border border-slate-300 px-3 py-2" />
        <input name="phoneNumber" type="tel" defaultValue={manager.phoneNumber ?? ""} placeholder="Nomor telepon (opsional)" className="border border-slate-300 px-3 py-2" />
        <input name="password" type="password" placeholder="Password baru (opsional)" minLength={6} className="border border-slate-300 px-3 py-2" />
        <button type="submit" className="w-fit bg-slate-900 px-4 py-2 text-sm font-medium text-white">Simpan Perubahan</button>
      </form>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
