import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useCountUp } from '@/hooks/useCountUp';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import Footer from '@/components/Footer';
import type { Product } from '@/types/data';

export default function AIRecommender() {
  const { data, loading } = useData();
  const [params] = useSearchParams();
  const products = data?.products ?? [];
  const [selectedAsin, setSelectedAsin] = useState<string>('');

  useEffect(() => { document.title = 'AI Recommender | PriceWatch Pro'; }, []);

  useEffect(() => {
    const asin = params.get('asin');
    if (asin && products.some(p => p.asin === asin)) setSelectedAsin(asin);
    else if (products.length && !selectedAsin) setSelectedAsin(products[0].asin);
  }, [params, products, selectedAsin]);

  const selected = products.find(p => p.asin === selectedAsin) ?? null;

  if (loading) return <div className="flex-1 p-6"><div className="h-96 rounded-xl bg-secondary animate-pulse" /></div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/30 to-accent/30 border border-primary/20 p-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-[32px] font-bold text-foreground">AI Price Recommender</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">Powered by competitive intelligence — get the optimal price to win the Buy Box</p>
        </div>

        {/* Product Selector */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Select a Product to Analyze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map(p => (
              <button key={p.asin} onClick={() => setSelectedAsin(p.asin)}
                className={`glass-card p-4 text-left transition-all ${selectedAsin === p.asin ? 'border-primary ring-1 ring-primary/30 bg-primary/[0.06] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-foreground truncate">{p.name.length > 45 ? p.name.slice(0, 45) + '...' : p.name}</p>
                  </TooltipTrigger>
                  <TooltipContent><p className="max-w-xs">{p.name}</p></TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">{p.brand}</span>
                  <span className="font-mono text-sm text-foreground">₹{p.your_price}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'WIN' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{p.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Panel */}
        {selected && <RecommendationPanel product={selected} />}
      </div>
      <Footer />
    </div>
  );
}

function RecommendationPanel({ product: p }: { product: Product }) {
  const compPrices = p.prices.filter(s => s.seller !== 'You');
  const minComp = Math.min(...compPrices.map(s => s.price));
  const recPrice = useCountUp(p.recommended_price, 600, '₹');

  const posColor = p.market_position === 'Competitive' ? 'bg-success/15 text-success' : p.market_position === 'Close Competition' ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive';
  const wpColor = p.win_probability >= 70 ? 'text-success' : p.win_probability >= 40 ? 'text-warning' : 'text-destructive';
  const wpStroke = p.win_probability >= 70 ? '#10B981' : p.win_probability >= 40 ? '#F59E0B' : '#EF4444';
  const gapColor = p.price_gap < 0 ? 'text-success' : 'text-destructive';

  const maxPrice = Math.max(...p.prices.map(s => s.price));

  // Chart data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = useMemo(() => {
    return days.map((d, i) => {
      const row: Record<string, string | number> = { day: d };
      p.prices.forEach(s => {
        const variance = s.seller === 'You' ? 5 : 8;
        row[s.seller] = s.price + Math.round(Math.sin(i * 1.2 + p.prices.indexOf(s)) * variance);
      });
      return row;
    });
  }, [p]);

  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (p.win_probability / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current Market Position */}
        <div className="glass-card p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Current Market Position</h3>
            <p className="text-sm text-foreground">{p.name}</p>
          </div>
          <p className="text-4xl font-bold font-mono text-foreground">₹{p.your_price}</p>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${posColor}`}>{p.market_position}</span>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nearest Competitor</span><span className="font-mono text-foreground">₹{minComp}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Price Gap</span><span className={`font-mono font-semibold ${gapColor}`}>₹{Math.abs(p.price_gap)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Buy Box</span><span className={`font-semibold ${p.buy_box_winner === 'You' ? 'text-success' : 'text-destructive'}`}>{p.buy_box_winner}</span></div>
          </div>
          <p className="text-xs text-muted-foreground italic">{p.reason}</p>

          {/* Bar Chart */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Price Comparison</h4>
            <div className="space-y-2">
              {p.prices.map(s => {
                const width = (s.price / maxPrice) * 100;
                const isYou = s.seller === 'You';
                const cheaper = s.price < p.your_price;
                return (
                  <div key={s.seller} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">{s.seller}</span>
                    <div className="flex-1 h-6 rounded bg-secondary/60 overflow-hidden">
                      <div className={`h-full rounded flex items-center px-2 transition-all duration-700 ${isYou ? 'bg-primary/60' : cheaper ? 'bg-destructive/40' : 'bg-muted-foreground/20'}`}
                        style={{ width: `${width}%` }}>
                        <span className="text-[10px] font-mono text-foreground">₹{s.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Recommendation */}
        <div className="glass-card p-6 space-y-5" style={{ border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 30px rgba(139,92,246,0.15)' }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Price</p>
          <p className="text-[52px] font-bold font-mono text-success leading-none">{recPrice}</p>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Current: <span className="font-mono text-foreground">₹{p.your_price}</span></span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">Rec: <span className="font-mono text-success">₹{p.recommended_price}</span></span>
            {p.recommended_price < p.your_price && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success font-bold">Save ₹{p.your_price - p.recommended_price}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Win Probability */}
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="relative inline-block">
                <svg width="80" height="80" className="-rotate-90">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke={wpStroke} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-700" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold font-mono ${wpColor}`}>{p.win_probability}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Buy Box Win Chance</p>
            </div>

            {/* Confidence */}
            <div className="rounded-xl bg-secondary/50 p-4 text-center flex flex-col items-center justify-center">
              <p className="text-2xl font-bold font-mono text-primary">{p.confidence}%</p>
              <div className="w-full h-1.5 rounded-full bg-secondary mt-2">
                <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${p.confidence}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">AI Confidence</p>
            </div>

            {/* Price Gap */}
            <div className="rounded-xl bg-secondary/50 p-4 text-center flex flex-col items-center justify-center">
              <p className={`text-2xl font-bold font-mono ${gapColor}`}>₹{Math.abs(p.price_gap)}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{p.price_gap < 0 ? 'Below competitors' : 'Above cheapest'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StrategyCard border="border-l-primary" bg="bg-primary/[0.03]" icon="📋" label="Strategy" value={p.strategy} />
        <StrategyCard border="border-l-warning" bg="bg-warning/[0.03]" icon="💡" label="Market Insight" value={p.insight} />
        <StrategyCard border="border-l-success" bg="bg-success/[0.03]" icon="🚀" label="Expected Impact" value={p.impact} />
      </div>

      {/* Price Trend Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Price Trend (Simulated)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} domain={['dataMin - 15', 'dataMax + 15']} />
            <RTooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12 }} />
            <Legend />
            <ReferenceLine y={p.recommended_price} stroke="#10B981" strokeDasharray="5 5" label={{ value: `Recommended ₹${p.recommended_price}`, position: 'right', fill: '#10B981', fontSize: 11 }} />
            <Line type="monotone" dataKey="You" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
            <Line type="monotone" dataKey="Seller1" stroke="#6B7280" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="Seller2" stroke="#6B7280" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="Seller3" stroke="#6B7280" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StrategyCard({ border, bg, icon, label, value }: { border: string; bg: string; icon: string; label: string; value: string }) {
  return (
    <div className={`glass-card p-4 border-l-[3px] ${border} ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
