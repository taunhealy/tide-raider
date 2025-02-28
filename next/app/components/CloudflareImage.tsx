interface CloudflareImageProps {
  id: string;
  alt: string;
  className?: string;
}

export function CloudflareImage({ id, alt, className }: CloudflareImageProps) {
  return (
    <img
      src={`${process.env.NEXT_PUBLIC_R2_URL}/${id}`}
      alt={alt}
      className={className}
    />
  );
}
