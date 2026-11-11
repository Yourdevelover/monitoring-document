import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ConfirmActionForm } from "@/app/components/confirm-action-form";
import { BackToPreviousButton } from "@/app/components/back-to-previous-button";

export default async function LeaderTeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const leaderId = Number(id);
  const leader = Number.isInteger(leaderId) && leaderId > 0
    ? await prisma.user.findFirst({
        where: { id: leaderId, role: "LEADER" },
        include: { ledTeam: { include: { department: true, members: { where: { role: "KARYAWAN" }, orderBy: { name: "asc" } } } } },
      })
    : null;
  if (!leader) notFound();

  const destinationTeams = await prisma.team.findMany({
    where: {
      leaderId: { not: leader.id },
      isActive: true,
      leader: { role: "LEADER", isActive: "ACTIVE" },
      department: { isActive: true },
    },
    include: { leader: true, department: true },
    orderBy: [{ department: { name: "asc" } }, { leader: { name: "asc" } }],
  });
  const members = leader.ledTeam?.members ?? [];
  const activeCount = members.filter((member) => member.isActive === "ACTIVE").length;

  return (
    <main className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">Kelola tim Leader</p>
          <h1 className="mt-1 text-[13px] font-semibold">Karyawan {leader.name}</h1>
          <p className="mt-1 text-xs text-[#6b7280]">{leader.ledTeam?.name ?? "Belum ada tim"} · {leader.ledTeam?.department.name ?? "Belum ada departemen"}</p>
        </div>
        <p className="text-xs text-[#6b7280]">{members.length} karyawan · {activeCount} aktif</p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-4">
        {leader.ledTeam ? members.length ? (
          <div className="divide-y divide-[#e5e7eb]">
            {members.map((member) => (
              <div key={member.id} className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:items-center xl:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.8fr)_auto]">
                <span className={`inline-flex w-fit rounded px-2 py-1 text-[10px] font-medium ${member.isActive === "ACTIVE" ? "bg-[#edf3ec] text-[#346538]" : "bg-[#fdebec] text-[#9f2f2d]"}`}>{member.isActive === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                <p className="min-w-0 truncate text-xs text-[#374151]" title={member.email}>{member.email}{member.position ? ` · ${member.position}` : ""}</p>
                <a href={`/dashboard/admin/karyawan/${member.id}`} className="min-w-0 truncate text-[13px] font-medium hover:text-[#1f6c9f] hover:underline sm:text-right xl:text-left">{member.name}</a>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-3 xl:col-span-1">
                  <form action="/api/admin/leaders/members" method="POST" className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="action" value="move" />
                    <input type="hidden" name="leaderId" value={leader.id} />
                    <input type="hidden" name="employeeId" value={member.id} />
                    <label className="sr-only" htmlFor={`move-employee-${member.id}`}>Leader tujuan untuk {member.name}</label>
                    <select id={`move-employee-${member.id}`} name="targetLeaderId" required defaultValue="" disabled={destinationTeams.length === 0} className="h-8 max-w-[15rem] rounded-md border border-[#e5e7eb] bg-white px-2 text-xs disabled:bg-[#f1f3f5]">
                      <option value="">Pindahkan ke Leader...</option>
                      {destinationTeams.map((team) => <option key={team.id} value={team.leaderId}>{team.leader.name} · {team.department.name}</option>)}
                    </select>
                    <button type="submit" disabled={destinationTeams.length === 0} className="inline-flex h-8 items-center justify-center rounded-md border border-[#d1d5db] px-3 text-xs font-medium text-[#374151] hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50">Pindahkan</button>
                  </form>
                  <ConfirmActionForm action="/api/admin/leaders/members" confirmMessage={`Yakin ingin ${member.isActive === "ACTIVE" ? "menonaktifkan" : "mengaktifkan kembali"} akun ${member.name}?`}>
                    <input type="hidden" name="action" value={member.isActive === "ACTIVE" ? "deactivate" : "activate"} />
                    <input type="hidden" name="leaderId" value={leader.id} />
                    <input type="hidden" name="employeeId" value={member.id} />
                    <button type="submit" className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium ${member.isActive === "ACTIVE" ? "border border-[#e5e7eb] text-[#9f2f2d] hover:bg-red-50" : "bg-[#346538] text-white hover:bg-[#2d5a30]"}`}>
                      {member.isActive === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </ConfirmActionForm>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="py-8 text-center text-sm text-[#6b7280]">Tidak ada karyawan di tim ini.</p> : <p className="py-8 text-center text-sm text-[#6b7280]">Leader belum memiliki tim.</p>}
        {destinationTeams.length === 0 && members.length > 0 && <p className="mt-4 border-t border-[#e5e7eb] pt-3 text-xs text-[#6b7280]">Tidak ada tim Leader aktif lain sebagai tujuan pemindahan.</p>}
      </section>

      <div className="flex justify-end">
        <BackToPreviousButton />
      </div>
    </main>
  );
}
