import Image from "next/image";

export function originalBrandLogoUrl(url: string): string {
  if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) return url;
  return url.replace(/(\/image\/upload\/)(?:[^/]+\/)*?(v\d+\/)/, "$1$2");
}

export function brandLogoUrl(url: string, width: number): string {
  const original = originalBrandLogoUrl(url);
  if (!/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\//.test(original)) {
    return original;
  }
  return original.replace("/image/upload/", `/image/upload/f_auto,q_100,c_limit,w_${width * 3}/`);
}

export default function BrandLogo({ src, width, priority = false }: {
  src: string;
  width: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={brandLogoUrl(src, width)}
      width={width}
      height={width}
      style={{ width, height: "auto" }}
      alt="Logo"
      unoptimized
      priority={priority}
    />
  );
}
