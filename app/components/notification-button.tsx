import Link from "next/link";

export function NotificationButton({ href, count }: { href: string; count: number }) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `Buka notifikasi, ${count} pengumuman` : "Buka notifikasi"}
      title={count > 0 ? `${count} pengumuman` : "Notifikasi"}
      className="relative mx-3 inline-flex h-11 min-w-11 shrink-0 items-center justify-center px-2 text-[#4b5563] transition-colors hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
    >
      <svg
        aria-hidden="true"
        className="h-7 w-7 text-[#111111]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 22a2.25 2.25 0 0 0 2.24-2h-4.48A2.25 2.25 0 0 0 12 22Zm7-5-1.8-2.1V10a5.2 5.2 0 0 0-4.2-5.1V4a1 1 0 0 0-2 0v.9A5.2 5.2 0 0 0 6.8 10v4.9L5 17v1h14v-1Z" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#c62828] px-0.5 text-[9px] font-bold leading-none tabular-nums text-white"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}