import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";

export default function LivePrices() {
  const { data, loading } = useData();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Live Prices | PriceWatch Pro";
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data</div>;

  const products = data?.products || [];

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Live Prices</h1>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      {filtered.map((p: any) => (
        <div key={p.asin} className="border p-4 rounded">
          <p className="font-semibold">{p.name}</p>
          <p>Your Price: ₹{p.your_price}</p>

          {(p.prices || []).map((s: any, i: number) => (
            <p key={i}>
              {s.seller}: ₹{s.price}
            </p>
          ))}

          <p>Buy Box: {p.buy_box_winner}</p>
        </div>
      ))}
    </div>
  );
}