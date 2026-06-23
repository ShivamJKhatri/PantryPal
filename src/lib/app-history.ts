import { useEffect } from 'react'

export type Page = 'capture' | 'list' | 'pantry' | 'settings'

export type ListView =
  | { kind: 'recipes' }
  | { kind: 'detail'; recipeId: string }
  | { kind: 'cart' }

export type AppHistoryState = {
  page: Page
  listView?: ListView
}

export function readHistoryState(): AppHistoryState | null {
  return history.state as AppHistoryState | null
}

export function useAppHistory(
  page: Page,
  listView: ListView,
  setPage: (p: Page) => void,
  setListView: (v: ListView) => void,
) {
  useEffect(() => {
    if (!readHistoryState()?.page) {
      history.replaceState({ page, listView: page === 'list' ? listView : undefined }, '')
    }

    function onPopState() {
      const state = readHistoryState()
      if (!state?.page) return
      setPage(state.page)
      if (state.page === 'list') {
        setListView(state.listView ?? { kind: 'recipes' })
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setPage, setListView])
}

export function pushAppState(page: Page, listView?: ListView) {
  history.pushState({ page, listView: page === 'list' ? listView : undefined }, '')
}

export function replaceAppState(page: Page, listView?: ListView) {
  history.replaceState({ page, listView: page === 'list' ? listView : undefined }, '')
}
