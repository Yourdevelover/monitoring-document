import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/auth";

const OPS = ["bagi", "kali", "tambah", "kurang"] as const;

function getBaseUrl(req: Request) {
  const host = req.headers.get("host") ?? "localhost:3000";
  const safeHost = host.replace(/^0\.0\.0\.0/, "localhost");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${safeHost}`;
}

export async function POST(req: Request) {
  const employee = await requireEmployee();
  const form = await req.formData();
  const action = String(form.get("action") ?? "upsert");
  const base = getBaseUrl(req);

  if (action === "delete") {
    const id = Number(form.get("id"));
    if (!isFinite(id)) return Response.json({ error: "ID tidak valid" }, { status: 400 });
    await prisma.target.deleteMany({ where: { id, userId: employee.id } });
    return Response.redirect(new URL("/dashboard/karyawan/target?toast=" + encodeURIComponent("Target dihapus."), base), 303);
  }

  if (action === "update") {
    const id = Number(form.get("id"));
    const name = String(form.get("name") ?? "").trim();
    const targetValue = Number(form.get("targetValue"));
    const currentValue = Number(form.get("currentValue") ?? 0);
    const formula = String(form.get("formula") ?? "bagi");
    const threshold = Number(form.get("threshold") ?? 20);
    if (!isFinite(id) || !name || !isFinite(targetValue) || targetValue <= 0 || !OPS.includes(formula as (typeof OPS)[number])) {
      return Response.json({ error: "Data tidak valid" }, { status: 400 });
    }
    await prisma.target.updateMany({ where: { id, userId: employee.id }, data: { name, targetValue, currentValue, formula, threshold } });
    return Response.redirect(new URL("/dashboard/karyawan/target?toast=" + encodeURIComponent("Progres tersimpan."), base), 303);
  }

  const name = String(form.get("name") ?? "").trim();
  const period = String(form.get("period") ?? "").trim();
  const targetValue = Number(form.get("targetValue"));
  const currentValue = Number(form.get("currentValue") ?? 0);
  const formula = String(form.get("formula") ?? "bagi");
  const threshold = Number(form.get("threshold") ?? 20);

  if (!name || !period || !isFinite(targetValue) || targetValue <= 0 || !OPS.includes(formula as (typeof OPS)[number])) {
    return Response.json({ error: "Data tidak valid" }, { status: 400 });
  }

  await prisma.target.upsert({
    where: { userId_period_name: { userId: employee.id, period, name } },
    create: { userId: employee.id, name, period, targetValue, currentValue, formula, threshold },
    update: { targetValue, currentValue, formula, threshold },
  });

  return Response.redirect(new URL("/dashboard/karyawan/target?toast=" + encodeURIComponent("Target tersimpan."), base), 303);
}