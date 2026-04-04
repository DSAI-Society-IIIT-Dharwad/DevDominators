import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "@/context/DataContext"
import Footer from "@/components/Footer"
import {
Package,
Trophy,
Bell,
TrendingUp,
TrendingDown
} from "lucide-react"

export default function Dashboard(){

const { data, loading } = useData()
const navigate = useNavigate()

useEffect(()=>{
document.title="Dashboard | PriceWatch Pro"
},[])

if(loading){
return(
<div className="p-10 text-center text-gray-400">
Loading dashboard...
</div>
)
}

if(!data){
return(
<div className="p-10 text-center text-gray-400">
No data available
</div>
)
}

const products=data.products
const summary=data.summary

return(

<div className="flex-1 min-h-screen p-8">

<h1 className="text-3xl font-bold text-white mb-6">
Dashboard
</h1>


{/* KPI CARDS */}

<div className="grid md:grid-cols-4 gap-4 mb-6">

<KPI
title="Total Products"
value={summary.total_asins}
icon={<Package/>}
color="blue"
/>

<KPI
title="Win Rate"
value={`${summary.buy_box_win_rate}%`}
icon={<Trophy/>}
color="green"
/>

<KPI
title="Active Alerts"
value={summary.active_alerts}
icon={<Bell/>}
color="red"
/>

<KPI
title="Avg Market Price"
value={`₹${summary.avg_market_price}`}
icon={<TrendingUp/>}
color="yellow"
/>

</div>



{/* PRODUCT CARDS */}

<div className="space-y-5">

{products.map(product=>{

const competitorPrices=
product.prices
.filter(p=>p.seller!=="You")
.map(p=>p.price)

const lowestPrice=Math.min(...competitorPrices)

return(

<div
key={product.asin}

className={`
rounded-xl p-6
border
shadow-lg
transition
backdrop-blur-md

${product.status==="WIN"
? "border-green-500/40 bg-green-500/5 hover:shadow-green-500/20"
: "border-red-500/40 bg-red-500/5 hover:shadow-red-500/20"}
`}
>


{/* TITLE */}

<h2 className="text-lg font-bold text-blue-400 mb-3">

{product.name}

</h2>


{/* PRICE ROW */}

<div className="flex justify-between items-center mb-2">

<p className="text-yellow-400 font-mono text-lg">

Your Price: ₹{product.your_price}

</p>


<span

className={`
px-3 py-1
text-xs
rounded-full
font-bold

${product.status==="WIN"
? "bg-green-500/20 text-green-400 border border-green-500/30"
: "bg-red-500/20 text-red-400 border border-red-500/30"}
`}
>

{product.status==="WIN"
? "🏆 WIN"
: "❌ LOSE"}

</span>

</div>


{/* COMPETITOR */}

<p

className={`
text-sm
font-semibold

${product.status==="WIN"
? "text-green-400"
: "text-red-400"}
`}
>

Lowest Competitor: ₹{lowestPrice}

</p>


{/* BUTTON */}

<div className="mt-4 flex justify-end">

<button

onClick={()=>
navigate(`/ai-recommender?asin=${product.asin}`)
}

className="

px-4 py-2
rounded-lg

bg-gradient-to-r
from-blue-600
to-indigo-600

hover:from-blue-500
hover:to-indigo-500

text-white
text-sm
font-semibold

shadow-md
hover:shadow-blue-500/40

transition
"

>

Analyze →

</button>

</div>


</div>

)

})}

</div>

<Footer/>

</div>

)

}



function KPI({title,value,icon,color}:{title:string,value:any,icon:any,color:string}){

const colors:any={

blue:"bg-blue-500/10 text-blue-400 border-blue-500/20",
green:"bg-green-500/10 text-green-400 border-green-500/20",
red:"bg-red-500/10 text-red-400 border-red-500/20",
yellow:"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"

}

return(

<div className={`

p-4
rounded-xl
border
backdrop-blur-md
shadow-md
transition
hover:scale-105

${colors[color]}

`}>

<div className="flex items-center justify-between">

<p className="text-sm">
{title}
</p>

<div>
{icon}
</div>

</div>

<p className="text-2xl font-bold mt-2">
{value}
</p>

</div>

)

}