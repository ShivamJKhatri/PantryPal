import type { Page } from '../App.tsx'
import { IconHome, IconList, IconPantry, IconSettings } from './icons.tsx'

type NavProps = {
  page: Page
  onNavigate: (p: Page) => void
  hasList: boolean
  stapleCount: number
}

const TABS: { id: Page; label: string; Icon: typeof IconHome }[] = [
  { id: 'capture', label: 'Add', Icon: IconHome },
  { id: 'list', label: 'List', Icon: IconList },
  { id: 'pantry', label: 'Pantry', Icon: IconPantry },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

export default function BottomNav({ page, onNavigate, hasList, stapleCount }: NavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <span className="bottom-nav__brand">PantryPal</span>
      <div className="bottom-nav__tabs">
        {TABS.map(({ id, label, Icon }) => {
          const active = page === id
          const badge =
            id === 'list' && hasList ? '•' : id === 'pantry' && stapleCount > 0 ? String(stapleCount) : null
          return (
            <button
              key={id}
              type="button"
              className="bottom-nav__tab press"
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(id)}
            >
              <span className="bottom-nav__icon-wrap">
                <Icon size={22} />
                {badge && <span className="bottom-nav__badge">{badge}</span>}
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
