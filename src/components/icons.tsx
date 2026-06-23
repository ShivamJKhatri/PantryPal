import type { ReactNode } from 'react'

type IconProps = { size?: number; className?: string }

function Icon({ size = 20, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const IconHome = (p: IconProps) => (
  <Icon {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>
)
export const IconList = (p: IconProps) => (
  <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Icon>
)
export const IconPantry = (p: IconProps) => (
  <Icon {...p}><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8zM8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" /></Icon>
)
export const IconSettings = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Icon>
)
export const IconLink = (p: IconProps) => (
  <Icon {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Icon>
)
export const IconCamera = (p: IconProps) => (
  <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></Icon>
)
export const IconClipboard = (p: IconProps) => (
  <Icon {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></Icon>
)
export const IconCheck = (p: IconProps) => (
  <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>
)
export const IconPlus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
)
export const IconMinus = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14" /></Icon>
)
export const IconClose = (p: IconProps) => (
  <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>
)
export const IconExternal = (p: IconProps) => (
  <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></Icon>
)
export const IconJar = (p: IconProps) => (
  <Icon {...p}><path d="M8 3h8v3H8zM7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /></Icon>
)
export const IconReceipt = (p: IconProps) => (
  <Icon {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" /><path d="M8 10h8M8 14h8" /></Icon>
)
export const IconCart = (p: IconProps) => (
  <Icon {...p}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></Icon>
)
export const IconChevronLeft = (p: IconProps) => (
  <Icon {...p}><path d="m15 18-6-6 6-6" /></Icon>
)
