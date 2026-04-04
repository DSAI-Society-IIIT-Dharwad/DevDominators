<<<<<<< HEAD
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Bell } from "lucide-react";

export default function Alerts() {

  const { data, loading, readAlerts, setReadAlerts } = useData();

  const navigate = useNavigate();

  useEffect(() => {

    document.title = "Alerts";

  }, []);

  const products = data?.products ?? [];

  const allAlerts = useMemo(() => {

    return products.flatMap(p =>

      p.alerts.map((a, i) => ({

        id: `${p.asin}-${i}`,
        text: a,
        product: p

      }))

    );

  }, [products]);


  const unreadCount = allAlerts.filter(

    a => !readAlerts.includes(a.id)

  ).length;


  const markAsRead = (id: string) => {

    if (!readAlerts.includes(id)) {

      setReadAlerts(prev => [...prev, id]);

    }

  };


  if (loading) return <div className="p-6">Loading...</div>;


  return (

    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold flex items-center gap-2">

        <Bell size={20}/> Alerts ({unreadCount})

      </h1>


      {allAlerts.map(alert => {

        const isRead = readAlerts.includes(alert.id);

        return (

          <div

            key={alert.id}

            onClick={() => markAsRead(alert.id)}

            className={`p-3 border rounded cursor-pointer
            ${isRead ? "opacity-40" : "bg-red-50"}`}

          >

            <div className="font-medium">

              {alert.product.name}

            </div>

            <div className="text-sm">

              {alert.text}

            </div>


            <button

              onClick={(e) => {

                e.stopPropagation();

                navigate(`/ai-recommender?asin=${alert.product.asin}`);

              }}

              className="text-blue-500 text-xs mt-1"

            >

              Analyze →

            </button>

          </div>

        );

      })}

    </div>

  );

=======
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
>>>>>>> 0800a8ba18106228508e0d8368bab83afef34b6c
}