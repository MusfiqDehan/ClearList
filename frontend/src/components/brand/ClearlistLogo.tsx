import Image from "next/image";

type ClearlistLogoProps = {
  className?: string;
  priority?: boolean;
};

export function ClearlistLogo({ className = "", priority = false }: ClearlistLogoProps) {
  return (
    <Image
      src="/clearlist-logo.svg"
      alt=""
      width={40}
      height={40}
      className={`clearlist-logo ${className}`}
      priority={priority}
    />
  );
}
