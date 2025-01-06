import { Building2, ChevronsLeftRight } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, useNavigate } from 'react-router-dom'
import { getInitials } from '@/lib/utils'
import { Spinner } from './spinner'

interface UserItemProps {
  afterSignOutUrl: string
}

export const UserItem: React.FC<UserItemProps> = ({ afterSignOutUrl }) => {
  const { data, logOut } = useAuth()
  const navigate = useNavigate()
  if (data.isLoading) {
    return <Spinner />
  }
  if (!data.user) {
    return <Navigate to={'/'} replace={true} />
  }
  const sginOut = () => {
    logOut()
    navigate(afterSignOutUrl, { replace: true })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5 rounded-md"
        >
          <div className="gap-x-2 flex items-center md:max-w-[170px] lg:max-w-[200px] max-w-[150px]">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src={user?.imageUrl} /> */}
              <AvatarFallback>{getInitials(data.user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="text-start font-medium line-clamp-1">{data.user.fullName}</span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" alignOffset={11} forceMount>
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {data.user.email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-8 w-8 flex justify-center items-center">
                {/* <AvatarImage src={user?.imageUrl} /> */}
                {/* <AvatarFallback>{getInitials(data.user.fullName)}</AvatarFallback> */}
                <Building2 />
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">{data.user.companyName}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
          onClick={sginOut}
        >
          {/* <SignOutButton>Log out</SignOutButton> */}
          {afterSignOutUrl && <span>Log out</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
