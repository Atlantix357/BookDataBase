import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { LayoutDashboard, BookOpen, Library, Settings } from 'lucide-react'

const navItems = [
  {
    title: 'Book List',
    href: '/',
    icon: BookOpen,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Book Shelf',
    href: '/bookshelf',
    icon: Library,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const location = useLocation()
  
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="flex items-center h-16 px-6 border-b">
        <h1 className="text-xl font-bold">BookDB</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
