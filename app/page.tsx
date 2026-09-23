import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user?.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (user?.role === "MANAGER") {
    redirect("/dashboard/manajer");
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-12 text-[#111111]">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
            Monitoring System
          </p>
          <h1 className="mt-3 text-xl font-bold tracking-tight">Masuk</h1>
        </div>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <form action="/api/login" method="POST" className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue="admin@monitoring.local"
                className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="admin"
                className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#333333] active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[#6b7280]">
            Daftar sebagai manajer?{" "}
            <a href="/daftar-manajer" className="font-medium text-[#2563eb] hover:underline">
              Daftar
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
