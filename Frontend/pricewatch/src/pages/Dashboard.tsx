import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useCountUp } from '@/hooks/useCountUp';
import { Package, Trophy, Bell, Tag, RefreshCw, ArrowRight, CheckCircle, TrendingDown, AlertTriangle } from 'lucide-react';
import Footer from '@/components/Footer';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function Dashboard() {
  const { data, loading, reload } = useData();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Dashboard | PriceWatch Pro'; }, []);

  const s = data?.summary;
  const products = data?.products ?? [];

  const totalAsins = useCountUp(s?.total_asins ?? 0);
  const winRate = useCountUp(s?.buy_box_win_rate ?? 0, 600, '', '%');
  const alerts = useCountUp(s?.active_alerts ?? 0);
  const avgPrice = useCountUp(s?.avg_market_price ?? 0, 600, '₹');

  const winRateColor = (s?.buy_box_win_rate ?? 0) >= 70 ? 'text-success' : (s?.buy_box_win_rate ?? 0) >= 40 ? 'text-warning' : 'text-destructive';

  const maintainCount = products.filter(p => p.strategy.toLowerCase().includes('maintain')).length;
  const reduceCount = products.filter(p => p.strategy.toLowerCase().includes('reduce')).length;
  const reviewCount = products.filter(p => p.status === 'LOSE').length;

  const bestOpp = products.length ? products.reduce((a, b) => a.win_probability > b.win_probability ? a : b) : null;

  if (loading) return <DashSkeleton />;
  if (!data) return <div className="flex-1 flex items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Pricing Intelligence Overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-green" />
              <span className="text-xs font-semibold text-success animate-pulse-green">LIVE</span>
            </div>
            <span className="text-xs text-muted-foreground">Updated: {data.last_updated}</span>
            <button onClick={reload} className="p-2 rounded-lg hover:bg-secondary transition"><RefreshCw className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={<Package />} iconBg="bg-primary/20 text-primary" label="Active ASINs" value={totalAsins} />
          <KPICard icon={<Trophy />} iconBg={`${winRateColor === 'text-success' ? 'bg-success/20 text-success' : winRateColor === 'text-warning' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`} label="Across all products" value={winRate} valueClass={winRateColor} />
          <KPICard icon={<Bell />} iconBg="bg-destructive/20 text-destructive" label="Requires attention" value={alerts} valueClass="text-destructive" pulse />
          <KPICard icon={<Tag />} iconBg="bg-accent/20 text-accent" label="Across all ASINs" value={avgPrice} valueClass="text-accent font-mono" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Price Overview Table */}
          <div className="lg:col-span-3 glass-card p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Price Overview</h2>
              <p className="text-xs text-muted-foreground">Live competitor pricing</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-left py-2 px-2">Brand</th>
                    <th className="text-right py-2 px-2">Your Price</th>
                    <th className="text-right py-2 px-2">Lowest Comp.</th>
                    <th className="text-right py-2 px-2">Gap</th>
                    <th className="text-center py-2 px-2">Status</th>
                    <th className="text-center py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const compPrices = p.prices.filter(s => s.seller !== 'You').map(s => s.price);
                    const lowestComp = Math.min(...compPrices);
                    const cheaper = p.your_price < lowestComp;
                    return (
                      <tr key={p.asin} className={`border-b border-border/50 hover:bg-secondary/30 transition ${p.status === 'LOSE' ? 'border-l-2 border-l-destructive' : 'border-l-2 border-l-success'}`}
                        style={{ animationDelay: `${i * 80}ms` }}>
                        <td className="py-3 px-2 max-w-[180px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <p className="text-foreground font-medium truncate">{p.name.length > 38 ? p.name.slice(0, 38) + '...' : p.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{p.asin}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent><p className="max-w-xs">{p.name}</p></TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-3 px-2"><span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">{p.brand}</span></td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-foreground">₹{p.your_price}</td>
                        <td className={`py-3 px-2 text-right font-mono font-semibold ${cheaper ? 'text-success' : 'text-destructive'}`}>₹{lowestComp}</td>
                        <td className={`py-3 px-2 text-right font-mono text-xs font-semibold ${p.price_gap < 0 ? 'text-success' : 'text-destructive'}`}>
                          {p.price_gap < 0 ? `▼ ₹${Math.abs(p.price_gap)}` : `▲ ₹${p.price_gap}`}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'WIN' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                            {p.status === 'WIN' ? '🏆 WIN' : '❌ LOSE'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button onClick={() => navigate(`/ai-recommender?asin=${p.asin}`)} className="text-xs font-medium text-primary hover:underline">
                            Analyze →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Today's Pricing Decisions */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">💡 Today's Pricing Decisions</h3>
                <p className="text-xs text-muted-foreground">{s?.total_asins} products analyzed</p>
              </div>
              <div className="space-y-3">
                <DecisionRow color="border-l-success" icon="✅" label="Maintain Price" count={maintainCount} />
                <DecisionRow color="border-l-destructive" icon="🔻" label="Reduce Price" count={reduceCount} />
                <DecisionRow color="border-l-warning" icon="⚠️" label="Review Needed" count={reviewCount} />
              </div>
            </div>

            {/* Best Opportunity */}
            {bestOpp && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-foreground">🚀 Best Opportunity</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-foreground truncate">{bestOpp.name.length > 40 ? bestOpp.name.slice(0, 40) + '...' : bestOpp.name}</p>
                  </TooltipTrigger>
                  <TooltipContent><p className="max-w-xs">{bestOpp.name}</p></TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-lg bg-secondary p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Current</p>
                    <p className="font-mono font-bold text-foreground">₹{bestOpp.your_price}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 rounded-lg bg-success/10 border border-success/30 p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Recommended</p>
                    <p className="font-mono font-bold text-success">₹{bestOpp.recommended_price}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-success">Win Probability: {bestOpp.win_probability}%</p>
                <p className="text-xs text-muted-foreground italic">{bestOpp.strategy}</p>
                <button onClick={() => navigate(`/ai-recommender?asin=${bestOpp.asin}`)} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
                  View Details →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function KPICard({ icon, iconBg, label, value, valueClass = '', pulse = false }: { icon: React.ReactNode; iconBg: string; label: string; value: string; valueClass?: string; pulse?: boolean }) {
  return (
    <div className="glass-card p-5 animate-fade-slide-up">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-3xl font-bold font-mono animate-count-up ${valueClass} ${pulse ? 'animate-pulse-ring inline-block' : ''}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DecisionRow({ color, icon, label, count }: { color: string; icon: string; label: string; count: number }) {
  return (
    <div className={`flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3 border-l-[3px] ${color}`}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-lg font-bold text-foreground">{count}</span>
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="h-10 w-48 rounded bg-secondary animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />)}
      </div>
      <div className="h-64 rounded-xl bg-secondary animate-pulse" />
    </div>
  );
}
