import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Fallback storage for development environment
const fallbackStorage = {
  data: new Map(),
  getItem: (name) => {
    return Promise.resolve(fallbackStorage.data.get(name) || null)
  },
  setItem: (name, value) => {
    fallbackStorage.data.set(name, value)
    return Promise.resolve()
  },
  removeItem: (name) => {
    fallbackStorage.data.delete(name)
    return Promise.resolve()
  }
}

// Check if we're in a Chrome extension environment
const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local

const storage = {
  getItem: async (name) => {
    try {
      if (isExtensionEnvironment) {
        const result = await chrome.storage.local.get(name)
        return result[name] || null
      }
      return fallbackStorage.getItem(name)
    } catch (err) {
      console.error('Storage get error:', err)
      return fallbackStorage.getItem(name)
    }
  },
  setItem: async (name, value) => {
    try {
      if (isExtensionEnvironment) {
        await chrome.storage.local.set({ [name]: value })
      } else {
        await fallbackStorage.setItem(name, value)
      }
    } catch (err) {
      console.error('Storage set error:', err)
      await fallbackStorage.setItem(name, value)
    }
  },
  removeItem: async (name) => {
    try {
      if (isExtensionEnvironment) {
        await chrome.storage.local.remove(name)
      } else {
        await fallbackStorage.removeItem(name)
      }
    } catch (err) {
      console.error('Storage remove error:', err)
      await fallbackStorage.removeItem(name)
    }
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isInitialized: false,
      login: () => {
        try {
          set({ isAuthenticated: true, isInitialized: true })
        } catch (err) {
          console.error('Login error:', err)
          throw err
        }
      },
      logout: () => {
        try {
          set({ isAuthenticated: false, isInitialized: true })
        } catch (err) {
          console.error('Logout error:', err)
          throw err
        }
      },
      initialize: () => set({ isInitialized: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (state) => {
        state?.initialize()
      },
      skipHydration: !isExtensionEnvironment // Skip hydration in non-extension environment
    }
  )
)

export default useAuthStore 