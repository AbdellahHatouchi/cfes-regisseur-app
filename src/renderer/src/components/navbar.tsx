import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { Users, FileText, Home } from 'lucide-react'
import { useNavigate, useLocation } from '@tanstack/react-router'

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-8 flex items-center space-x-2">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            onClick={() => navigate({ to: '/' })}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Button>
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            onClick={() => navigate({ to: '/' })}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Attestations Fiscales</span>
          </Button>
          <Button
            variant={isActive('/users') ? 'default' : 'ghost'}
            onClick={() => navigate({ to: '/users' })}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Utilisateurs</span>
          </Button>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
