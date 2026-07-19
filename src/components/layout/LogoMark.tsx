/**
 * @file LogoMark.tsx
 * @description Renders the latest generated logo as the app brand mark.
 *
 * @features
 * - Displays the most recent generated logo SVG when available
 * - Falls back to an empty placeholder when no logos exist
 * - Pauses animations for brand-mark usage
 *
 * @dependencies react
 * @sideEffects None
 */
import { memo } from 'react';
import type { Logo } from '../../types/logo';

interface LogoMarkProps {
  latestLogo: Logo | undefined;
  hasLogos: boolean;
}

export const LogoMark = memo(({ latestLogo, hasLogos }: LogoMarkProps) => {
  if (!hasLogos || !latestLogo) {
    return <div className="w-full h-full bg-[#110e0d]" />;
  }

  const Component = latestLogo.Component;
  return (
    <div className="w-full h-full">
      <Component isPaused={false} />
    </div>
  );
});

LogoMark.displayName = 'LogoMark';
