import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";

export default function Dashboard() {
  const { data, loading } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard | PriceWatch Pro";
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data</div>;

  const products = data?.products || [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {products.map((p: any) => {
        const compPrices =
          (p.prices || [])
            .filter((s: any) => s.seller !== "You")
            .map((s: any) => s.price) || [];

        const lowestComp = compPrices.length ? Math.min(...compPrices) : 0;

        return (
          <div
            key={p.asin}
            className="p-4 border rounded-lg flex justify-between"
          >
            <div>
              <p className="font-semibold">{p.name}</p>
              <p>Your Price: ₹{p.your_price}</p>
              <p>Lowest Competitor: ₹{lowestComp}</p>
              <p>Status: {p.status}</p>
            </div>

            <button
              onClick={() =>
                navigate(`/ai-recommender?asin=${p.asin}`)
              }
              className="text-blue-500"
            >
              Analyze →
            </button>
          </div>
        );
      })}
    </div>
  );
}