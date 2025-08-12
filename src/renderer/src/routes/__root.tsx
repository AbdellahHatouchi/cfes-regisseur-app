import { Navbar } from '@/components/navbar'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <div className="flex-col mt-2 w-full 2xl:mx-auto 2xl:max-w-screen-xl 2xl:rounded-md border">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  )
})
