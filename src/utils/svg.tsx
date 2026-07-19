/**
 * @file svg.tsx
 * @description Reusable SVG wrapper component for logo rendering.
 *
 * @features
 * - Renders a 100x100 SVG viewBox container
 * - Accepts children and optional className
 */
import type { ReactNode } from 'react';

interface SvgWrapperProps {
  children: ReactNode;
  className?: string;
}

export const SvgWrapper = ({ children, className = '' }: SvgWrapperProps) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-full ${className}`}
  >
    {children}
  </svg>
);
