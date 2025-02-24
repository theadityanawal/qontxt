import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: '📊'
  },
  {
    title: 'Resumes',
    href: '/dashboard/resumes',
    icon: '📝'
  },
  {
    title: 'Job Matches',
    href: '/dashboard/jobs',
    icon: '🎯'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: '⚙️'
  }
];

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-card h-screen flex flex-col">
      {/* Logo and branding */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            qontxt
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <span role="img" aria-label={item.title}>{item.icon}</span>
                    {item.title}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium truncate">
                {user?.displayName || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="ml-2"
            >
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
