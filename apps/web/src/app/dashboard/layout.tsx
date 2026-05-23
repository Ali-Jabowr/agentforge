import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { LayoutDashboard, Key, Zap } from 'lucide-react'

const navItems = [
  { href: '/dashboard/runs', label: 'Runs', icon: LayoutDashboard },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
        <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-5">
          <Zap className="h-5 w-5 text-violet-400" />
          <span className="font-semibold text-white">AgentForge</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <UserButton
            appearance={{
              elements: { avatarBox: 'h-8 w-8' },
            }}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
