import type { ReactNode } from 'react'
import {
  Link,
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { queryClient } from '@/lib/query-client'
import { THEME_INIT_SCRIPT, useTheme } from '@/hooks/use-theme'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Lokvera — AI Voice Agents + Sales CRM' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </TooltipProvider>
        <AppToaster />
      </QueryClientProvider>
    </RootDocument>
  )
}

function AppToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} />
}

function NotFoundPage() {
  return (
    <main className="relative z-10 flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-text-soft">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-soft">
          This page does not exist or has moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to login
          </Link>
        </Button>
      </div>
    </main>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
