import {json} from '../_shared.js';
export async function onRequestPost({request,env}) {
 try {
  const {order_id,payment_id}=await request.json();
  const o=await env.DB.prepare('SELECT id,amount_halalas,currency FROM orders WHERE id=?').bind(order_id).first();
  if(!o||!payment_id)return json({error:'الطلب غير موجود'},404);
  const auth=btoa(env.MOYASAR_SECRET_KEY+':');
  const res=await fetch('https://api.moyasar.com/v1/payments/'+encodeURIComponent(payment_id),{headers:{authorization:'Basic '+auth}});
  const p=await res.json();
  if(!res.ok||p.amount!==o.amount_halalas||p.currency!==o.currency||p.description!=='PUZ Store Order '+o.id)return json({error:'تعذر مطابقة عملية الدفع'},400);
  await env.DB.prepare('UPDATE orders SET moyasar_payment_id=? WHERE id=?').bind(payment_id,o.id).run();
  return json({ok:true});
 }catch(e){return json({error:'تعذر حفظ عملية الدفع'},500)}
}
