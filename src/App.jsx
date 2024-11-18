import { lazy, Suspense, useMemo } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import useAuthStore from "./store/authStore"
import Login from "./components/Login"
import { Spinner } from "./components/Spinner"
import ErrorBoundary from "./components/ErrorBoundary"

// Lazy load ProfileCard component with proper module handling
const ProfileCard = lazy(async () => {
  try {
    const module = await import("./components/ProfileCard")
    // Ensure we're returning a proper component
    if (!module.default) {
      throw new Error('ProfileCard module does not have a default export')
    }
    return { default: module.default }
  } catch (error) {
    console.error("Error loading ProfileCard:", error)
    throw error
  }
})

// Loading component
const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center">
    <Spinner />
  </div>
)

// Protected Route Component with initialization check
const ProtectedRoute = ({ children }) => {
  // Use selector function to avoid infinite loop
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isInitialized = useAuthStore(state => state.isInitialized)

  // Memoize the authentication check
  const authCheck = useMemo(() => {
    if (!isInitialized) {
      return <LoadingFallback />
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/" replace />
    }

    return (
      <ErrorBoundary key="protected-route">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    )
  }, [isAuthenticated, isInitialized, children])

  return authCheck
}

function App() {
  return (
    <ErrorBoundary key="main-error-boundary">
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="w-[380px] min-h-[600px] overflow-hidden">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <ProfileCard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
