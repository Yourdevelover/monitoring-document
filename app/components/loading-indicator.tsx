export function LoadingIndicator({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span role="status" className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
      <span>{label}</span>
    </span>
  );
}