import { BarChart3, LayoutDashboard, LineChart, Bot, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useData } from '@/context/DataContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Live Prices', icon: LineChart, path: '/live-prices' },
  { label: 'AI Recommender', icon: Bot, path: '/ai-recommender' },
  { label: 'Alerts', icon: Bell, path: '/alerts' },
];

export default function AppSidebar() {
  const { data } = useData();
  const alertCount = data?.summary.active_alerts ?? 0;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-border bg-sidebar z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <BarChart3 className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold text-foreground">PriceWatch</span>
        <span className="text-lg font-bold text-primary">Pro</span>
      </div>

      <div className="mx-4 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 pt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-primary/10 text-foreground border-l-[3px] border-primary ml-0 pl-[9px]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.label === 'Alerts' && alertCount > 0 && (
              <span className="absolute right-3 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse-ring">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-5 pb-5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-green" />
          <span className="text-xs font-medium text-success">Live</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Last synced: just now</p>
      </div>
    </aside>
  );
}
