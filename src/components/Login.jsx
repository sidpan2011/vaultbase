import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAuthStore from "../store/authStore"
import Logo from "./Logo"
import { Menu } from "lucide-react"

const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      if (password === "vaultbase") {
        await login()
        navigate("/app", { replace: true })
      } else {
        setError("Invalid password")
        setPassword("")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleLogin()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleLogin()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full h-full p-4">
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-2">
          <Menu className="cursor-pointer" />
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4 justify-center h-[calc(100vh-120px)] w-full max-w-md">
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => {
            setError("")
            setPassword(e.target.value)
          }} 
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isLoading}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!password || isLoading}
        >
          {isLoading ? "Loading..." : "Unlock"}
        </Button>
        <Button variant="link" className="w-min">
          Reset Password
        </Button>
        <p className="text-sm text-muted-foreground">
          Your password is used to unlock your VaultBase.
        </p>
      </div>
    </form>
  )
}

export default Login