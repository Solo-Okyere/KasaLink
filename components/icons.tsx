import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>;
}

export function Bookmark(props: IconProps) {
  return <IconBase {...props}><path d="M6 4h12v16l-6-3-6 3z" /></IconBase>;
}

export function Bot(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4v4" /><path d="M9 13h.01" /><path d="M15 13h.01" /></IconBase>;
}

export function CheckCircle2(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-5" /></IconBase>;
}

export function CircleSlash(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="m5 19 14-14" /></IconBase>;
}

export function Heart(props: IconProps) {
  return <IconBase {...props}><path d="M20.8 8.6c0 5.4-8.8 10.2-8.8 10.2S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6z" /></IconBase>;
}

export function MessageCircle(props: IconProps) {
  return <IconBase {...props}><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.4A8.5 8.5 0 1 1 21 11.5z" /></IconBase>;
}

export function Pencil(props: IconProps) {
  return <IconBase {...props}><path d="M4 20h4l11-11-4-4L4 16v4z" /><path d="m14 6 4 4" /></IconBase>;
}

export function Send(props: IconProps) {
  return <IconBase {...props}><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></IconBase>;
}

export function ShieldAlert(props: IconProps) {
  return <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v5" /><path d="M12 17h.01" /></IconBase>;
}

export function ShieldCheck(props: IconProps) {
  return <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-5" /></IconBase>;
}

export function Sparkles(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 15v4" /><path d="M21 17h-4" /></IconBase>;
}

export function Trash2(props: IconProps) {
  return <IconBase {...props}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 15h10l1-15" /></IconBase>;
}

export function UserRoundSearch(props: IconProps) {
  return <IconBase {...props}><circle cx="10" cy="8" r="4" /><path d="M3 21a7 7 0 0 1 11.6-5.3" /><circle cx="17" cy="17" r="3" /><path d="m19.2 19.2 2 2" /></IconBase>;
}

export function UsersRound(props: IconProps) {
  return <IconBase {...props}><path d="M16 21a6 6 0 0 0-12 0" /><circle cx="10" cy="8" r="4" /><path d="M22 21a5 5 0 0 0-5-5" /><path d="M17 4a4 4 0 0 1 0 8" /></IconBase>;
}

export function X(props: IconProps) {
  return <IconBase {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconBase>;
}
