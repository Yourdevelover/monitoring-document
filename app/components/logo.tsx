import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return (
    <Image
      src="/logo/logo.png"
      alt="Logo"
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: "auto" }}
      className={`object-contain ${className}`}
      priority
    />
  );
}
