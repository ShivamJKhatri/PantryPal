import { useRef, useEffect } from 'react'
import type { Page } from '../App.tsx'
import { IconHome, IconList, IconPantry, IconSettings } from './icons.tsx'

type NavProps = {
  page: Page
  onNavigate: (p: Page) => void
  hasList: boolean
  stapleCount: number
  storeName?: string
  zipCode?: string
}

const TABS: { id: Page; label: string; Icon: typeof IconHome }[] = [
  { id: 'capture', label: 'Add', Icon: IconHome },
  { id: 'list', label: 'List', Icon: IconList },
  { id: 'pantry', label: 'Pantry', Icon: IconPantry },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

export default function BottomNav({ page, onNavigate, hasList, stapleCount, storeName, zipCode }: NavProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    const tabs = tabsRef.current
    const indicator = indicatorRef.current
    if (!tabs || !indicator) return

    const activeTab = tabs.querySelector<HTMLElement>('[aria-current="page"]')
    if (!activeTab) return

    const tabsRect = tabs.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    if (firstRender.current) {
      // No transition on first paint — jump to position
      indicator.style.transition = 'none'
      firstRender.current = false
    } else {
      indicator.style.transition = ''
    }

    indicator.style.width = `${tabRect.width}px`
    indicator.style.transform = `translateX(${tabRect.left - tabsRect.left - 4}px)`
  }, [page])

  return (
    <nav className="bottom-nav" aria-label="Main">
      <span className="bottom-nav__brand">
        <span className="bottom-nav__brand-p">P</span>
        PantryPal
      </span>
      <div className="bottom-nav__tabs-wrap">
        <div className="bottom-nav__tabs" ref={tabsRef}>
          <div className="bottom-nav__indicator" ref={indicatorRef} aria-hidden />
          {TABS.map(({ id, label, Icon }) => {
            const active = page === id
            const badge =
              id === 'list' && hasList ? '•'
              : id === 'pantry' && stapleCount > 0 ? String(stapleCount)
              : null
            return (
              <button
                key={id}
                type="button"
                className="bottom-nav__tab press"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(id)}
              >
                <span className="bottom-nav__icon-wrap">
                  <Icon size={20} />
                  {badge && <span className="bottom-nav__badge">{badge}</span>}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
      {storeName && zipCode && (
        <div className="bottom-nav__store" aria-hidden="true">
          <span className="bottom-nav__store-dot" />
          <span className="bottom-nav__store-text">{storeName} {zipCode}</span>
          <span className="bottom-nav__store-avatar">{storeName[0]}</span>
        </div>
      )}
    </nav>
  )
}
