import Image from "next/image";

export function LogoFooter({ className = "h-8 w-auto max-w-full" }: { className?: string }) {
  return (
    <Image
      src="/logo/logofooter.png"
      alt="Logo Footer"
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: "auto", height: "auto" }}
      className={`object-contain ${className}`}
    />
  );
}
