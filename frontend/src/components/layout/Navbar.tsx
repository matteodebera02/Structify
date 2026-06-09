import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import logo from '@/img/logo-whith-text.png'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="border-b border-base-border bg-white px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="Structify"
          className="h-8 sm:h-9 w-auto object-contain"
        />
      </Link>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-xs text-base-muted hidden sm:block">{user?.email}</span>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/register"><Button size="sm">Sign up free</Button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
