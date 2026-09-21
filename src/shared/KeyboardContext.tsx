import React, { createContext, useContext, useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

interface KeyboardContextType {
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (key: string) => void
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined)

const shortcuts = new Map<string, KeyboardShortcut>()

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

      for (const [, shortcut] of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (isMac ? e.metaKey : e.ctrlKey) : true
        const metaMatch = shortcut.meta ? e.metaKey : true
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch && metaMatch && shiftMatch && altMatch
        ) {
          e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const registerShortcut = (shortcut: KeyboardShortcut) => {
    const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.key}`
    shortcuts.set(key, shortcut)
  }

  const unregisterShortcut = (key: string) => {
    shortcuts.delete(key)
  }

  return (
    <KeyboardContext.Provider value={{ registerShortcut, unregisterShortcut }}>
      {children}
    </KeyboardContext.Provider>
  )
}

export function useKeyboard() {
  const context = useContext(KeyboardContext)
  if (!context) {
    return {
      registerShortcut: () => {},
      unregisterShortcut: () => {}
    }
  }
  return context
}

export function useShortcut(shortcut: KeyboardShortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboard()

  useEffect(() => {
    registerShortcut(shortcut)
    const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.key}`
    return () => unregisterShortcut(key)
  }, [shortcut.key, shortcut.action, registerShortcut, unregisterShortcut])
}
