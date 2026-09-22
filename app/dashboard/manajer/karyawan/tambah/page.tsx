import { BulkEmployeeForm } from "./bulk-employee-form";

export default function CreateEmployeePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Tambah Karyawan</h1>
        <p className="mt-2 text-slate-600">Tambahkan satu karyawan atau beberapa karyawan sekaligus.</p>

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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </div>

        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            form="single-employee-form"
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Simpan Karyawan
          </button>
          <BulkEmployeeForm />
        </div>
      </div>
    </main>
  );
}
