import { useState } from "react"
import { useData } from "@/context/DataContext"
import { Trophy } from "lucide-react"

export default function LivePrices(){

const { data } = useData()

const [search,setSearch]=useState("")

if(!data){
return(
<div className="p-10 text-gray-400">
No data available
</div>
)
}

const filtered=data.products.filter(p=>
p.name.toLowerCase().includes(search.toLowerCase())
)

return(

<div className="p-8">

<h1 className="text-3xl font-bold text-white mb-6">
Live Prices
</h1>


{/* SEARCH BAR */}

<div className="mb-6">

<input

placeholder="Search product..."

value={search}

onChange={e=>setSearch(e.target.value)}

className="

w-full
md:w-96

px-4
py-2

rounded-lg

bg-slate-900
border border-white/10

text-white

focus:outline-none
focus:ring-2
focus:ring-blue-500

transition

"

/>

</div>



{/* TABLE */}

<div className="rounded-xl border border-white/10 overflow-hidden">

<table className="w-full">

<thead>

<tr className="bg-slate-900 text-gray-400 text-sm">

<th className="text-left p-4">
Product
</th>

<th className="text-center p-4">
You
</th>

<th className="text-center p-4">
Seller1
</th>

<th className="text-center p-4">
Seller2
</th>

<th className="text-center p-4">
Seller3
</th>

<th className="text-center p-4">
Buy Box
</th>

</tr>

</thead>


<tbody>

{filtered.map(product=>{

const sellerMap:any={}

product.prices.forEach(p=>{
sellerMap[p.seller]=p.price
})

return(

<tr
key={product.asin}

className="
border-t border-white/10
hover:bg-slate-900/40
transition
"
>

{/* PRODUCT */}

<td className="p-4">

<p className="font-semibold text-blue-400">
{product.name}
</p>

<p className="text-xs text-gray-500">
{product.asin}
</p>

</td>



{/* YOUR PRICE */}

<td className="p-4 text-center">

<span className="
px-3 py-1
rounded-lg

bg-blue-500/10
text-blue-400

font-mono
">

₹{sellerMap["You"]}

</span>

</td>



{/* SELLER1 */}

<td className="p-4 text-center">

<span className="font-mono text-white">

₹{sellerMap["Seller1"]}

</span>

</td>



{/* SELLER2 */}

<td className="p-4 text-center">

<span className="font-mono text-white">

₹{sellerMap["Seller2"]}

</span>

</td>



{/* SELLER3 */}

<td className="p-4 text-center">

<span className="font-mono text-white">

₹{sellerMap["Seller3"]}

</span>

</td>



{/* BUY BOX */}

<td className="p-4 text-center">

<span className={`

px-3 py-1
rounded-full
text-xs
font-semibold

flex
items-center
justify-center
gap-1

${product.buy_box_winner==="You"
? "bg-green-500/20 text-green-400"
: "bg-yellow-500/20 text-yellow-400"}

`}>

<Trophy size={14}/>

{product.buy_box_winner}

</span>

</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}