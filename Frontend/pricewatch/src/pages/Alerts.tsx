import { useState } from "react"
import { useData } from "@/context/DataContext"
import { Bell } from "lucide-react"

export default function Alerts(){

const { data, loading } = useData()

const [selected,setSelected]=useState<any>(null)

if(loading)
return <div className="p-6 text-white">Loading...</div>

if(!data || !data.products)
return <div className="p-6 text-white">No alerts data</div>


return(

<div className="p-6 space-y-6">


{/* TITLE */}

<div className="flex items-center gap-2">

<Bell className="text-yellow-400"/>

<h1 className="text-2xl font-bold text-white">
Alerts
</h1>

</div>



<div className="grid grid-cols-2 gap-6">


{/* LEFT SIDE ALERT LIST */}

<div className="space-y-3">

{data.products.map((p:any)=>{

const isLose=p.status==="LOSE"

return(

<div

key={p.asin}

onClick={()=>setSelected(p)}

className={`

p-3
rounded-lg
border
cursor-pointer

${isLose
?"border-red-500 bg-red-500/10"
:"border-green-500 bg-green-500/10"}

`}
>

<p className="text-sm font-semibold text-blue-400">

{p.name}

</p>


<p className={`

text-xs mt-1 font-bold

${isLose
?"text-red-400"
:"text-green-400"}

`}>

{p.status || "UNKNOWN"}

</p>


<p className="text-xs text-yellow-400">

₹{p.recommended_price}

</p>


</div>

)

})}

</div>



{/* RIGHT SIDE RECOMMENDER */}

{selected && (

<div className="p-4 rounded-xl border bg-[#0b1220] space-y-3">


<p className="text-blue-400 font-semibold">

{selected.name}

</p>



<div className="p-3 rounded bg-green-500/10">

<p className="text-xs">
Recommended Price
</p>

<p className="text-xl font-bold text-green-400">

₹{selected.recommended_price}

</p>

</div>



{/* price comparison */}

{selected.prices?.map((s:any)=>{

const maxPrice=Math.max(
...selected.prices.map((x:any)=>x.price)
)

const width=(s.price/maxPrice)*100

return(

<div key={s.seller}>

<div className="flex justify-between text-xs">

<span>{s.seller}</span>

<span>₹{s.price}</span>

</div>

<div className="h-2 bg-gray-700 rounded">

<div

className={`

h-2 rounded

${s.seller==="You"
?"bg-blue-500"
:"bg-gray-400"}

`}

style={{width:`${width}%`}}

>

</div>

</div>

</div>

)

})}



<p className="text-xs">

Win probability:

<span className="text-green-400 ml-1">

{selected.win_probability || 0}%

</span>

</p>


<p className="text-xs">

Strategy:

<span className="text-blue-400 ml-1">

{selected.strategy || "Maintain price"}

</span>

</p>


<p className="text-xs text-gray-400">

{selected.insight || ""}

</p>


</div>

)}


</div>


</div>

)

}