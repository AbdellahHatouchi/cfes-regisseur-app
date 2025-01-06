import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
// import { UserItem } from './user-item'

export const Navbar = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          {/* <UserItem afterSignOutUrl="/" /> */}
        </div>
      </div>
    </div>
  )
}
