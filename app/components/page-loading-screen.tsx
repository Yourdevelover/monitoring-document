export function PageLoadingScreen() {
  return (
    <div className="navigation-progress-track" role="status" aria-label="Memuat halaman">
      <span className="navigation-progress-indeterminate" />
    </div>
  );
}