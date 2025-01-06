import { cn } from '@/lib/utils'
import logoLight from '@/assets/logo.png'
import logoDark from '@/assets/logo-dark.png'
import { Link } from '@tanstack/react-router'
import { Img } from 'react-image'

export const Logo = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
  return (
    <Link to="/">
      <div className="flex items-center gap-x-2">
        {/* Light Mode Logo */}
        <Img
          src={logoLight}
          height="50"
          width="50"
          alt="Logo"
          className="dark:hidden transition-opacity duration-300"
        />
        {/* Dark Mode Logo */}
        <Img
          src={logoDark}
          height="50"
          width="50"
          alt="Logo"
          className="hidden dark:block transition-opacity duration-300"
        />
        <p
          className={cn(
            'font-semibold text-nowrap hidden md:block transition-colors duration-300',
            className
          )}
          {...props}
        >
          Commune Ferkla Essoufla
        </p>
      </div>
    </Link>
  )
}
