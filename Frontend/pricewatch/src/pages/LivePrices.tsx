import { useEffect, useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Search, Download } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LivePrices() {
  const { data, loading } = useData();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { document.title = 'Live Prices | PriceWatch Pro'; }, []);

  const products = data?.products ?? [];
  const brands = useMemo(() => ['All', ...new Set(products.map(p => p.brand))], [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (brandFilter !== 'All' && p.brand !== brandFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, brandFilter, statusFilter]);

  const exportCSV = () => {
    const headers = ['Product Name', 'Brand', 'Your Price', 'Seller1', 'Seller2', 'Seller3', 'Buy Box', 'Status'];
    const rows = filtered.map(p => [
      `"${p.name}"`, p.brand, p.your_price,
      p.prices[1]?.price ?? '', p.prices[2]?.price ?? '', p.prices[3]?.price ?? '',
      p.buy_box_winner, p.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pricewatch-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex-1 p-6"><div className="h-96 rounded-xl bg-secondary animate-pulse" /></div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">Live Price Comparison</h1>
          <p className="text-sm text-muted-foreground">Real-time competitor pricing across all monitored products</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full rounded-lg bg-secondary border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none">
            {brands.map(b => <option key={b}>{b === 'All' ? 'All Brands' : b}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none">
            <option value="All">All Status</option>
            <option value="WIN">WIN</option>
            <option value="LOSE">LOSE</option>
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-3 px-3 text-left">#</th>
                <th className="py-3 px-3 text-left">Product Name</th>
                <th className="py-3 px-3 text-left">Brand</th>
                <th className="py-3 px-3 text-right">Your Price</th>
                <th className="py-3 px-3 text-right">Seller1</th>
                <th className="py-3 px-3 text-right">Seller2</th>
                <th className="py-3 px-3 text-right">Seller3</th>
                <th className="py-3 px-3 text-center">Buy Box</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.asin} className={`border-b border-border/50 hover:bg-secondary/30 transition ${p.status === 'LOSE' ? 'bg-destructive/[0.03]' : ''}`}>
                  <td className="py-3 px-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-3 px-3 max-w-[250px]">
                    <p className="text-foreground font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{p.asin}</p>
                  </td>
                  <td className="py-3 px-3"><span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">{p.brand}</span></td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">₹{p.your_price}</td>
                  {[1, 2, 3].map(idx => {
                    const sp = p.prices[idx];
                    if (!sp) return <td key={idx} className="py-3 px-3 text-right">-</td>;
                    const cheaper = sp.price < p.your_price;
                    return (
                      <td key={idx} className="py-3 px-3 text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`font-mono cursor-default ${cheaper ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>₹{sp.price}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Seller: {sp.seller}</p>
                            <p>Price: ₹{sp.price}</p>
                            <p>{cheaper ? `₹${p.your_price - sp.price} cheaper than you` : `₹${sp.price - p.your_price} more expensive`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-center">
                    {p.buy_box_winner === 'You'
                      ? <span className="font-bold text-success">🏆 You</span>
                      : <span className="font-bold text-destructive">⚡ {p.buy_box_winner}</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'WIN' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} products | All prices in ₹ INR | Last updated: {data?.last_updated}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>🟢 You have lowest price</span>
          <span>🔴 Competitor is lower</span>
          <span>⚪ Equal price</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}
