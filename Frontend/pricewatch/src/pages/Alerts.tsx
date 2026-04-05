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


/* built-in notification sound */
const playAlertSound = () => {

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()

  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.type = "sine"
  oscillator.frequency.value = 880   // sound pitch

  gainNode.gain.value = 0.15         // volume

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.start()

  setTimeout(()=>{
    oscillator.stop()
  },180)

}


return(

<div className="p-6 space-y-6">


{/* TITLE */}

<div className="flex items-center gap-2">

<Bell className="text-yellow-400"/>

<h1 className="text-2xl font-bold text-white">
Alerts
</h1>

</div>



{/* ALERT LIST */}

<div className="space-y-3 max-w-xl">

{data.products.map((p:any)=>{

const isLose=p.status==="LOSE"

return(

<div

key={p.asin}

onClick={()=>{

setSelected(p)

/* play sound */
playAlertSound()

/* auto close popup */
setTimeout(()=>{
setSelected(null)
},4000)

}}

className={`

p-3
rounded-lg
border
cursor-pointer
transition

${isLose
?"border-red-500 bg-red-500/10 hover:bg-red-500/20"
:"border-green-500 bg-green-500/10 hover:bg-green-500/20"}

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



{/* POPUP */}

{selected && (

<div

className="fixed right-6 bottom-6 w-80 p-4 rounded-xl border
bg-[#0b1220] shadow-2xl z-50"

>

<p className="text-xs text-gray-400 mb-1">
🔔 ALERT NOTIFICATION
</p>


<p className="text-sm font-semibold text-blue-400">

{selected.name}

</p>


<p className={`

text-xs font-bold mt-1

${selected.status==="LOSE"
?"text-red-400"
:"text-green-400"}

`}>

{selected.status}

</p>


<p className="text-lg font-bold text-yellow-400 mt-1">

₹{selected.recommended_price}

</p>


<p className="text-xs text-gray-400 mt-2">

{selected.status==="LOSE"
?"Competitor price dropped. Adjust price to stay competitive."
:"Your price is competitive. Keep current price."}

</p>


<button

onClick={()=>setSelected(null)}

className="mt-3 text-xs text-blue-400 hover:underline"

>

Close

</button>


</div>

)}


</div>

)

}