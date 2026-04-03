import React from 'react';
import { cn } from '@/lib/utils';

export interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  size?: number | string;
}

export function MaterialIcon({
  name,
  fill = false,
  weight = 400,
  grade = 0,
  size,
  className,
  style,
  ...props
}: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-rounded select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' 24`,
        fontSize: size ? size : 'inherit',
        lineHeight: 1, // Ensures the icon doesn't add weird vertical spacing
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
