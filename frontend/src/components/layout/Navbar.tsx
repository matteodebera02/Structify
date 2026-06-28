import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import logo from '@/img/logo-whith-text.png'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 px-4 sm:px-6 h-14 flex items-center justify-between transition-all duration-200',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-base-border shadow-sm'
          : 'bg-white border-b border-base-border'
      )}
    >
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
