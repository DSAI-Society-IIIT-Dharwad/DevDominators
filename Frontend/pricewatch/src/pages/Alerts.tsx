import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useCountUp } from '@/hooks/useCountUp';
import { Bell, Trophy, AlertTriangle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function Alerts() {
  const { data, loading } = useData();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Alerts | PriceWatch Pro'; }, []);

  const s = data?.summary;
  const products = data?.products ?? [];

  const totalAlerts = useCountUp(s?.active_alerts ?? 0);
  const wins = useCountUp(s?.products_winning ?? 0);
  const actionReq = useCountUp(s?.products_losing ?? 0);

  const allAlerts = useMemo(() => {
    return products.flatMap(p => p.alerts.map(a => ({ alert: a, product: p })));
  }, [products]);

  const getAlertStyle = (alert: string) => {
    if (alert.startsWith('[ALERT]') || alert.startsWith('[WARNING]')) return { border: 'border-l-destructive', bg: 'bg-destructive/[0.03]', icon: '⚠️', iconBg: 'bg-destructive/20' };
    if (alert.startsWith('[WIN]')) return { border: 'border-l-success', bg: 'bg-success/[0.03]', icon: '🏆', iconBg: 'bg-success/20' };
    if (alert.startsWith('[WATCH]')) return { border: 'border-l-warning', bg: 'bg-warning/[0.03]', icon: '👁️', iconBg: 'bg-warning/20' };
    return { border: 'border-l-primary', bg: 'bg-primary/[0.03]', icon: 'ℹ️', iconBg: 'bg-primary/20' };
  };

  const stripPrefix = (a: string) => a.replace(/^\[(ALERT|WARNING|WIN|WATCH|INFO)\]\s*/, '');

  const mostCompetitive = products.length ? products.reduce((a, b) => Math.abs(a.price_gap) < Math.abs(b.price_gap) ? a : b) : null;
  const bestWinProb = products.length ? products.reduce((a, b) => a.win_probability > b.win_probability ? a : b) : null;
  const lowestPriced = products.length ? products.reduce((a, b) => a.your_price < b.your_price ? a : b) : null;

  if (loading) return <div className="flex-1 p-6"><div className="h-96 rounded-xl bg-secondary animate-pulse" /></div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">🔔 Alert Center</h1>
          <p className="text-sm text-muted-foreground">Stay ahead of every competitor move</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SumCard icon={<Bell className="h-5 w-5" />} iconBg="bg-destructive/20 text-destructive" label="Total Alerts Today" value={totalAlerts} valueClass="text-destructive" />
          <SumCard icon={<Trophy className="h-5 w-5" />} iconBg="bg-success/20 text-success" label="Buy Box Wins" value={wins} valueClass="text-success" />
          <SumCard icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-destructive/20 text-destructive" label="Action Required" value={actionReq} valueClass="text-destructive" />
        </div>

        {/* Banner */}
        {(s?.products_losing ?? 0) > 0 ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-5 py-3 text-sm font-medium text-destructive">
            🚨 {s?.products_losing} products losing Buy Box — Immediate action required!
          </div>
        ) : (
          <div className="rounded-xl bg-success/10 border border-success/30 px-5 py-3 text-sm font-medium text-success">
            ✅ All clear! Winning Buy Box on all products.
          </div>
        )}

        {/* Alert Feed */}
        <div className="space-y-3">
          {allAlerts.map(({ alert, product: p }, i) => {
            const style = getAlertStyle(alert);
            const compPrices = p.prices.filter(s => s.seller !== 'You').map(s => s.price);
            const minComp = Math.min(...compPrices);
            return (
              <div key={`${p.asin}-${i}`} className={`glass-card p-4 border-l-[3px] ${style.border} ${style.bg} animate-slide-in-left`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}>
                    <span className="text-sm">{style.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name.length > 45 ? p.name.slice(0, 45) + '...' : p.name}</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{stripPrefix(alert)}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Your price: <span className="font-mono">₹{p.your_price}</span> | Competitor: <span className="font-mono">₹{minComp}</span> | Recommended: <span className="font-mono">₹{p.recommended_price}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'WIN' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{p.status}</span>
                    <span className="text-[10px] text-muted-foreground">just now</span>
                    <button onClick={() => navigate(`/ai-recommender?asin=${p.asin}`)} className="text-[11px] font-medium text-primary hover:underline">Analyze →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat label="Most Competitive Product" value={mostCompetitive ? (mostCompetitive.name.length > 35 ? mostCompetitive.name.slice(0, 35) + '...' : mostCompetitive.name) : '-'} />
            <QuickStat label="Best Win Probability" value={bestWinProb ? `${bestWinProb.win_probability}% — ${bestWinProb.name.slice(0, 25)}...` : '-'} valueClass="text-success" />
            <QuickStat label="Your Lowest Priced Item" value={lowestPriced ? `₹${lowestPriced.your_price} — ${lowestPriced.name.slice(0, 25)}...` : '-'} />
            <QuickStat label="Products Losing Buy Box" value={`${s?.products_losing ?? 0} of ${s?.total_asins ?? 0} products`} valueClass={(s?.products_losing ?? 0) > 0 ? 'text-destructive' : ''} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SumCard({ icon, iconBg, label, value, valueClass }: { icon: React.ReactNode; iconBg: string; label: string; value: string; valueClass: string }) {
  return (
    <div className="glass-card p-5 animate-fade-slide-up">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} mb-3`}>{icon}</div>
      <p className={`text-3xl font-bold font-mono ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function QuickStat({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-medium text-foreground ${valueClass}`}>{value}</p>
    </div>
  );
}
