import { useData } from "@/context/DataContext";

export default function Alerts() {
  const { data, loading } = useData();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No alerts data</div>;

  const products = data.products || [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Alerts</h1>

      {products.map((p: any) => (
        <div key={p.asin} className="border p-4 rounded">
          <p className="font-semibold">{p.name}</p>

          <p>
            Status:{" "}
            <span className="text-red-400">{p.status}</span>
          </p>

          <p>
            Recommendation: ₹{p.recommended_price}
          </p>
        </div>
      ))}
    </div>
  );
}