import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "@/context/DataContext"
import toast, { Toaster } from "react-hot-toast"
import { Bell, AlertTriangle, CheckCircle } from "lucide-react"

export default function Alerts(){

const navigate = useNavigate()

const {
data,
loading,
setUnreadAlerts
} = useData()



// popup + sound
useEffect(()=>{

if(!data) return

const losingProducts =
data.products.filter(
p => p.status === "LOSE"
)

setUnreadAlerts(0)

if(losingProducts.length){

const sound = new Audio(
"https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
)

sound.play().catch(()=>{})

losingProducts.forEach(product=>{

toast.error(

`${product.name}

Reduce price → ₹${product.recommended_price}`,

{
duration:3500
}

)

})

}

},[data,setUnreadAlerts])



if(loading){

return(
<div className="p-6 text-gray-400">
Loading alerts...
</div>
)

}

if(!data){

return(
<div className="p-6 text-gray-400">
No alerts available
</div>
)

}



return(

<div className="p-8">

<Toaster position="top-right"/>


{/* header */}

<div className="flex items-center gap-2 mb-6">

<Bell className="text-yellow-400"/>

<h1 className="text-3xl font-bold">
Alerts
</h1>

</div>



{/* alert cards */}

<div className="space-y-4">

{data.products.map(product=>{

const isLose =
product.status === "LOSE"

return(

<div

key={product.asin}

onClick={()=>
navigate(
`/ai-recommender?asin=${product.asin}`
)
}

className={`
p-5
rounded-xl
border
cursor-pointer
transition

hover:scale-[1.01]

${isLose
? "border-red-500/40 bg-red-500/10 hover:shadow-red-500/20"
: "border-green-500/40 bg-green-500/10 hover:shadow-green-500/20"}
`}
>

{/* title */}

<p className="font-semibold text-blue-400">

{product.name}

</p>



{/* status */}

<div className="flex items-center gap-2 mt-2">

{isLose

? <AlertTriangle
className="text-red-400"
size={18}
/>

: <CheckCircle
className="text-green-400"
size={18}
/>

}

<p>

Status:

<span
className={`
ml-2 font-bold

${isLose
? "text-red-400"
: "text-green-400"}
`}
>

{product.status}

</span>

</p>

</div>



{/* recommendation */}

<p className="mt-2 text-sm">

Recommended Price:

<span className="ml-2 font-mono text-yellow-400">

₹{product.recommended_price}

</span>

</p>



{/* hint */}

<p className="mt-3 text-xs text-muted-foreground">

Click to view AI recommendation →

</p>

</div>

)

})}

</div>

</div>

)

}