import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface TrackCoverProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  iconSize?: number;
}

export function TrackCover({
  src,
  alt,
  className,
  iconSize = 24,
  ...props
}: TrackCoverProps) {
  const [hasError, setHasError] = useState(false);
  const showError = hasError || !src;

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded bg-muted aspect-square",
        className
      )}
      {...props}
    >
      {!showError && (
        <img
          alt={alt}
          className={cn("h-full w-full object-cover")}
          key={src}
          loading="lazy"
          src={src}
          onError={() => {
            setHasError(true);
          }}
        />
      )}
      {showError && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
          <ImageIcon aria-label={alt} size={iconSize} />
        </div>
      )}
    </div>
  );
}
