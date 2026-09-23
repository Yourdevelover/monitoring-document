import { BulkEmployeeForm } from "./bulk-employee-form";

export default function CreateEmployeePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-5 text-[#111111]">
      <div className="mx-auto max-w-3xl rounded-lg border border-[#e5e7eb] bg-white p-4">
        <h1 className="text-base font-semibold">Tambah Karyawan</h1>
        <p className="mt-2 text-[#6b7280]">Tambahkan satu karyawan atau beberapa karyawan sekaligus.</p>

        <form id="single-employee-form" action="/api/manager/employee/create" method="POST" className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] px-3 py-2"
            />
          </div>

        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            form="single-employee-form"
            className="rounded-lg bg-[#2563eb] px-4 py-2 font-semibold text-white"
          >
            Simpan Karyawan
          </button>
          <BulkEmployeeForm />
        </div>
      </div>
    </main>
  );
}
