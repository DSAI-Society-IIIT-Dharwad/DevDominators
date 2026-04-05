import { useData } from "@/context/DataContext";
import { useState } from "react";
import { Brain, TrendingUp } from "lucide-react";

type Product = {
  asin: string;
  name: string;
  brand: string;
  your_price: number;
  prices: { seller: string; price: number }[];
  recommended_price: number;
  win_probability: number;
  confidence: number;
  strategy: string;
  insight: string;
};

export default function AIRecommender() {

  const { data, loading } = useData();

  const [selected, setSelected] = useState<Product | null>(null);


  if (loading)
    return <div className="p-6">Loading...</div>;

  if (!data)
    return <div className="p-6 text-red-500">No data found</div>;


  return (

    <div className="p-6 space-y-6">


      {/* HEADER */}

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-xl flex items-center gap-3 shadow">

        <Brain className="text-white" size={26} />

        <div>

          <h1 className="text-xl font-bold text-white">
            AI Price Recommender
          </h1>

          <p className="text-xs text-gray-200">
            Smart pricing decision engine
          </p>

        </div>

      </div>



      {/* 2 COLUMN LAYOUT */}

      <div className="grid grid-cols-2 gap-6">


        {/* PRODUCT LIST */}

        <div className="space-y-3">

          {data.products.map((p: Product) => {

            const lowest = Math.min(
              ...p.prices
                .filter(s => s.seller !== "You")
                .map(s => s.price)
            );

            const isLose = p.your_price > lowest;

            return (

              <div

                key={p.asin}

                onClick={() => setSelected(p)}

                className={`
                  p-3
                  border
                  rounded-lg
                  cursor-pointer
                  transition
                  hover:scale-[1.02]

                  ${isLose
                    ? "bg-red-500/10 border-red-500/40"
                    : "bg-green-500/10 border-green-500/40"}
                `}
              >

                <p className="text-sm font-semibold text-blue-400 truncate">

                  {p.name}

                </p>

                <p className="text-xs mt-1">

                  ₹{p.your_price}

                </p>


                <p className={`
                  text-xs font-bold mt-1

                  ${isLose
                    ? "text-red-400"
                    : "text-green-400"}
                `}>

                  {isLose ? "LOSE" : "WIN"}

                </p>

              </div>

            );

          })}

        </div>



        {/* RECOMMENDATION CARD */}

        {selected ? (

          <RecommendationPanel product={selected} />

        ) : (

          <div className="flex items-center justify-center border rounded-xl text-gray-400">

            Select a product to view recommendation

          </div>

        )}

      </div>

    </div>

  );

}



/* ========================== */

function RecommendationPanel({

  product

}: {

  product: Product

}) {


  const competitorPrices =
    product.prices.filter(
      s => s.seller !== "You"
    );


  const lowestCompetitor =
    Math.min(
      ...competitorPrices.map(
        s => s.price
      )
    );


  const isLose =
    product.your_price > lowestCompetitor;


  const maxPrice =
    Math.max(
      ...product.prices.map(
        s => s.price
      )
    );


  return (

    <div className="p-4 rounded-xl border bg-gradient-to-br from-[#0b1220] to-[#020617] space-y-3 shadow max-h-[70vh] overflow-y-auto">


      {/* PRODUCT */}

      <div>

        <p className="text-sm text-blue-400 font-semibold truncate">

          {product.name}

        </p>

      </div>



      {/* RECOMMENDED PRICE */}

      <div className={`
        p-3 rounded-lg border

        ${isLose
          ? "bg-red-500/10 border-red-500/30"
          : "bg-green-500/10 border-green-500/30"}
      `}>

        <p className="text-xs text-gray-400">
          Recommended Price
        </p>

        <p className={`
          text-2xl font-bold

          ${isLose
            ? "text-red-400"
            : "text-green-400"}
        `}>

          ₹{product.recommended_price}

        </p>

      </div>



      {/* PRICE BARS */}

      <div>

        <p className="text-xs mb-1 flex items-center gap-1">

          <TrendingUp size={12} />

          Competitor Prices

        </p>


        {product.prices.map(s => {

          const width =
            (s.price / maxPrice) * 100;

          const cheaper =
            s.price < product.your_price;

          const isYou =
            s.seller === "You";


          return (

            <div key={s.seller} className="mb-1">

              <div className="flex justify-between text-xs">

                <span>
                  {s.seller}
                </span>

                <span>
                  ₹{s.price}
                </span>

              </div>


              <div className="h-2 bg-gray-700 rounded">

                <div
                  className={`
                    h-2 rounded

                    ${isYou
                      ? "bg-blue-500"
                      : cheaper
                        ? "bg-red-500"
                        : "bg-gray-400"}
                  `}
                  style={{
                    width: `${width}%`
                  }}
                />

              </div>

            </div>

          );

        })}

      </div>



      {/* METRICS */}

      <div className="grid grid-cols-2 gap-2 text-xs">

        <div className="p-2 bg-gray-800 rounded">

          Win:

          <span className="ml-1 text-green-400 font-bold">

            {product.win_probability}%

          </span>

        </div>


        <div className="p-2 bg-gray-800 rounded">

          Confidence:

          <span className="ml-1 text-blue-400 font-bold">

            {product.confidence}%

          </span>

        </div>

      </div>



      {/* STRATEGY */}

      <div className="p-2 bg-gray-800 rounded text-xs">

        <b>Strategy:</b> {product.strategy}

      </div>



      {/* INSIGHT */}

      <div className="p-2 bg-gray-800 rounded text-xs text-gray-300">

        {product.insight}

      </div>


    </div>

  );

}