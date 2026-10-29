export function PageLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat halaman"
      className="fixed inset-0 z-[9998] flex min-h-screen items-center justify-center bg-[#111111]/55 p-4 text-white backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-black/25 px-8 py-7 text-center">
        <span
          aria-hidden="true"
          className="size-12 animate-spin rounded-full border-4 border-white/30 border-t-white"
        />
        <p className="text-sm font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}