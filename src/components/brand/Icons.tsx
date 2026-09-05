import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (children: React.ReactNode, props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 16}
    height={props.size ?? 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth ?? 1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className ?? ''}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconCube = (p: IconProps = {}) =>
  base(<><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M4 7l8 4 8-4" /><path d="M12 11v10" /></>, p);

export const IconLayers = (p: IconProps = {}) =>
  base(<><path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="m2 13 10 5 10-5" /><path d="m2 18 10 5 10-5" /></>, p);

export const IconShield = (p: IconProps = {}) =>
  base(<><path d="M12 3 4 6v6c0 4 3.5 7.5 8 9 4.5-1.5 8-5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>, p);

export const IconBolt = (p: IconProps = {}) =>
  base(<path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />, p);

export const IconGrid = (p: IconProps = {}) =>
  base(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>, p);

export const IconActivity = (p: IconProps = {}) =>
  base(<path d="M3 12h4l3-9 4 18 3-9h4" />, p);

export const IconUsers = (p: IconProps = {}) =>
  base(<><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17" cy="6" r="2.5" /><path d="M22 19c0-2.5-2-4.5-5-4.5" /></>, p);

export const IconBox = (p: IconProps = {}) =>
  base(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></>, p);

export const IconClipboard = (p: IconProps = {}) =>
  base(<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 12h6" /><path d="M9 16h4" /></>, p);

export const IconCalendar = (p: IconProps = {}) =>
  base(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4M16 3v4" /></>, p);

export const IconBook = (p: IconProps = {}) =>
  base(<><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5Z" /><path d="M18 21V3" /><path d="M8 7h6M8 11h6" /></>, p);

export const IconSearch = (p: IconProps = {}) =>
  base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" /></>, p);

export const IconPlus = (p: IconProps = {}) =>
  base(<><path d="M12 5v14" /><path d="M5 12h14" /></>, p);

export const IconMinus = (p: IconProps = {}) =>
  base(<path d="M5 12h14" />, p);

export const IconX = (p: IconProps = {}) =>
  base(<><path d="M6 6 18 18" /><path d="m18 6-12 12" /></>, p);

export const IconCheck = (p: IconProps = {}) =>
  base(<path d="m5 12 5 5L20 7" />, p);

export const IconChevronDown = (p: IconProps = {}) =>
  base(<path d="m6 9 6 6 6-6" />, p);

export const IconChevronRight = (p: IconProps = {}) =>
  base(<path d="m9 6 6 6-6 6" />, p);

export const IconAlertTriangle = (p: IconProps = {}) =>
  base(<><path d="M12 3 2 21h20L12 3Z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.5" fill="currentColor" /></>, p);

export const IconBell = (p: IconProps = {}) =>
  base(<><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 21h4" /></>, p);

export const IconSettings = (p: IconProps = {}) =>
  base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>, p);

export const IconExternal = (p: IconProps = {}) =>
  base(<><path d="M14 5h5v5" /><path d="m19 4-9 9" /><path d="M19 13v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>, p);

export const IconCloud = (p: IconProps = {}) =>
  base(<path d="M18 18a4 4 0 0 0 0-8 6 6 0 0 0-11.6 1.5A4 4 0 0 0 7 18h11Z" />, p);

export const IconDoc = (p: IconProps = {}) =>
  base(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6" /><path d="M8 13h8" /><path d="M8 17h5" /></>, p);

export const IconSheet = (p: IconProps = {}) =>
  base(<><rect x="3" y="3" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M3 14h18" /><path d="M9 3v16" /></>, p);

export const IconForm = (p: IconProps = {}) =>
  base(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10" /><path d="M7 12h10" /><circle cx="7" cy="16" r="1" fill="currentColor" /><path d="M11 16h6" /></>, p);

export const IconSliders = (p: IconProps = {}) =>
  base(<><path d="M4 21V13" /><path d="M4 9V3" /><path d="M12 21v-9" /><path d="M12 5V3" /><path d="M20 21v-5" /><path d="M20 11V3" /><circle cx="4" cy="11" r="1.5" fill="currentColor" /><circle cx="12" cy="7" r="1.5" fill="currentColor" /><circle cx="20" cy="13" r="1.5" fill="currentColor" /></>, p);

export const IconArrowUpRight = (p: IconProps = {}) =>
  base(<><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>, p);

export const IconInbox = (p: IconProps = {}) =>
  base(<><path d="M3 12h6l1.5 3h3L15 12h6" /><path d="M3 12V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /></>, p);

export const IconQrCode = (p: IconProps = {}) =>
  base(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3" /><path d="M21 14v7" /><path d="M14 21h7" /></>, p);

export const IconSpark = (p: IconProps = {}) =>
  base(<><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="m5.6 18.4 2.8-2.8" /><path d="m15.6 8.4 2.8-2.8" /></>, p);

export const IconLock = (p: IconProps = {}) =>
  base(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>, p);

export const IconRefresh = (p: IconProps = {}) =>
  base(<><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 21v-5h5" /><path d="M21 3v5h-5" /></>, p);

export const IconDownload = (p: IconProps = {}) =>
  base(<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>, p);

export const IconUpload = (p: IconProps = {}) =>
  base(<><path d="M12 21V9" /><path d="m7 14 5-5 5 5" /><path d="M5 21h14" /></>, p);

export const IconUser = (p: IconProps = {}) =>
  base(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></>, p);

export const IconFire = (p: IconProps = {}) =>
  base(<><path d="M12 3s5 4 5 9a5 5 0 1 1-10 0c0-3 2-5 3-7 0 0 1 1 1 3" /><path d="M12 14a3 3 0 0 0 0 6 3 3 0 0 0 0-6Z" /></>, p);

export const IconCircuit = (p: IconProps = {}) =>
  base(<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /><path d="M10 7h4v4h-4z" /><path d="M7 10v4" /><path d="M17 14V-4" transform="translate(-10 7)" /></>, p);

export const IconLogoMark = (p: IconProps = {}) =>
  base(<><path d="M3 12 12 3l9 9-9 9-9-9Z" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></>, p);