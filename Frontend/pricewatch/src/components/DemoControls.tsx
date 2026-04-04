import { useState } from 'react';
import { useData } from '@/context/DataContext';
import type { PriceData } from '@/types/data';

export default function DemoControls() {
  const { data, setData, resetDemo } = useData();
  const [status, setStatus] = useState('');

  const simulateAlert = () => {
    if (!data) return;
    const newData: PriceData = JSON.parse(JSON.stringify(data));
    const win = newData.products.find(p => p.status === 'WIN');
    if (!win) { setStatus('No WIN products to flip'); return; }

    win.status = 'LOSE';
    win.buy_box_winner = 'Seller1';
    win.prices[1].price = win.your_price - 20;
    win.alerts.unshift(`[ALERT] Competitor just dropped to Rs.${win.your_price - 20}! You lost Buy Box!`);
    win.strategy = 'Reduce price immediately';
    win.win_probability = 35;
    win.price_gap = 20;
    win.market_position = 'Close Competition';

    newData.summary.active_alerts += 3;
    newData.summary.buy_box_win_rate = Math.max(0, newData.summary.buy_box_win_rate - 25);
    newData.summary.products_losing += 1;
    newData.summary.products_winning = Math.max(0, newData.summary.products_winning - 1);

    setData(newData);
    setStatus(`⚡ ${win.name.slice(0, 30)}... flipped to LOSE`);
  };

  const handleReset = () => {
    resetDemo();
    setStatus('✅ Demo reset to original data');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] glass-card p-4 min-w-[220px] space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">🎮 Demo Controls</p>
      <button
        onClick={simulateAlert}
        className="w-full rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground transition hover:opacity-90"
      >
        🚨 Simulate Competitor Alert
      </button>
      <button
        onClick={handleReset}
        className="w-full rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition hover:opacity-90"
      >
        ✅ Reset Demo
      </button>
      {status && <p className="text-[10px] text-muted-foreground">{status}</p>}
    </div>
  );
}
