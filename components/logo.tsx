import Image from "next/image";
import Link from "next/link";

export const Logo = () => (
 <Link href="/" className="flex items-center">
      <Image
        src="/logo.png"
        alt="Logo"
        width={160}
        height={60}
        className="h-auto w-32"
        priority
      />
    </Link>
);
