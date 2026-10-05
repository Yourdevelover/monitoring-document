import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/redirect";

function redirectToTarget(request: Request, message: string) {
  const url = new URL("/dashboard/manajer/target", getBaseUrl(request));
  url.searchParams.set("toast", message);
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const manager = await getSessionUser();
  if (!manager || manager.role !== "MANAGER") {
    return Response.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const form = await request.formData();
  const action = String(form.get("action") ?? "upsert");
  const period = String(form.get("period") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();

  if (action === "delete") {
    const id = Number(form.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: "ID target tidak valid." }, { status: 400 });
    }

    await prisma.target.deleteMany({ where: { id, userId: manager.id } });
    return redirectToTarget(request, "Target pribadi dihapus.");
  }

  if (action === "update") {
    const id = Number(form.get("id"));
    const currentValue = Number(form.get("currentValue"));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(currentValue) || currentValue < 0) {
      return Response.json({ error: "Data progres tidak valid." }, { status: 400 });
    }

    await prisma.target.updateMany({
      where: { id, userId: manager.id },
      data: { currentValue },
    });
    return redirectToTarget(request, "Progres target pribadi tersimpan.");
  }

  const targetValue = Number(form.get("targetValue"));
  const currentValue = Number(form.get("currentValue") ?? 0);
  if (!name || !/^\d{4}-\d{2}$/.test(period) || !Number.isFinite(targetValue) || targetValue <= 0 || !Number.isFinite(currentValue) || currentValue < 0) {
    return Response.json({ error: "Nama, periode, target, dan progres harus valid." }, { status: 400 });
  }

  await prisma.target.upsert({
    where: { userId_period_name: { userId: manager.id, period, name } },
    create: {
      userId: manager.id,
      name,
      period,
      targetValue,
      currentValue,
      formula: "bagi",
      threshold: 20,
    },
    update: { targetValue, currentValue },
  });

  return redirectToTarget(request, "Target pribadi tersimpan.");
}