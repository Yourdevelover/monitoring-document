type IconProps = { className?: string };

function IconDashboard({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 15h8v6H3z" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-8 1.67-8 5v2h16v-2c0-3.33-4.69-5-8-5zm9.5-2a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm.5 2c-1.23 0-2.6.3-3.77.87.9 1.13 1.27 2.13 1.27 3.13v2h7v-2c0-3.33-2.5-5-4.5-5z" />
    </svg>
  );
}

function IconUser({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z" />
    </svg>
  );
}

function IconClipboard({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 2h8v2H8v-2zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
    </svg>
  );
}

function IconClock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59l4.2 4.2-1.41 1.41L11 13.41V7h2v5.59z" />
    </svg>
  );
}

function IconMegaphone({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.3 3.7c-.2-.2-.5-.3-.8-.3-.1 0-.2 0-.3.1L4 9.5v5l15.2 6c.1.1.2.1.3.1.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8V4.5c0-.3-.1-.6-.3-.8zM3 10H1v4h2v-4zm2 5.5l2 1V20l-2-1v-3.5z" />
    </svg>
  );
}

function IconTarget({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-14a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function IconProfile({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 13.5c-2.9 0-5.5-1.3-7.2-3.4.9-2 3.4-3.1 7.2-3.1s6.3 1.1 7.2 3.1c-1.7 2.1-4.3 3.4-7.2 3.4z" />
    </svg>
  );
}

function IconStar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.6l-4.2-4.2 1.4-1.4 2.8 2.8 5.6-5.6 1.4 1.4-7 7z" />
    </svg>
  );
}

function IconFile({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 14.66l-3.6-3.6 1.41-1.41 2.19 2.19 4.71-4.71 1.41 1.41-6.12 6.12z" />
    </svg>
  );
}

function IconHistory({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3a9 9 0 00-9 9H1l4 4 4-4H6a7 7 0 117 7 7 7 0 01-4.9-2l-1.4 1.4A9 9 0 1013 3zm-1 5v5l4.2 2.5.8-1.3-3.5-2V8h-1.5z" />
    </svg>
  );
}

function IconLogout({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 17l5-5-5-5v3H2v4h8v3zm9-15H9a2 2 0 00-2 2v4h2V4h10v16H9v-4H7v4a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  "Dashboard": IconDashboard,
  "Kelola Admin": IconShield,
  "Kelola Manajer": IconUsers,
  "Kelola Karyawan": IconClipboard,
  "Karyawan": IconUser,
  "Aktivitas": IconClock,
  "Berkas": IconFile,
  "Histori Berkas": IconHistory,
  "Data Penting": IconStar,
  "Pengumuman": IconMegaphone,
  "Target": IconTarget,
  "Profil": IconProfile,
  "Persetujuan Profil": IconCheck,
};

export function getNavIcon(label: string): React.ComponentType<IconProps> | null {
  return iconMap[label] ?? null;
}

export { IconLogout };
