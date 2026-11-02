import {json,sha256} from '../_shared.js';
export async function onRequestPost({request,env}) {
 try{
  const {order_id,payment_id}=await request.json();
  const order=await env.DB.prepare('SELECT id,product_id,moyasar_payment_id,amount_halalas,currency FROM orders WHERE id=?').bind(order_id).first();
  if(!order||!payment_id||!order.moyasar_payment_id||order.moyasar_payment_id!==payment_id)return json({error:'لم يتم ربط عملية الدفع بالطلب بعد. حدّث الصفحة بعد لحظات.'},409);
  const auth=btoa(env.MOYASAR_SECRET_KEY+':');
  const res=await fetch('https://api.moyasar.com/v1/payments/'+encodeURIComponent(payment_id),{headers:{authorization:'Basic '+auth}});
  const payment=await res.json();
  if(!res.ok||payment.status!=='paid'||payment.amount!==order.amount_halalas||payment.currency!==order.currency||payment.description!=='PUZ Store Order '+order.id)return json({error:'لم يتم تأكيد الدفع'},402);
  await env.DB.prepare("UPDATE orders SET status='paid',paid_at=COALESCE(paid_at,CURRENT_TIMESTAMP) WHERE id=?").bind(order.id).run();
  const raw=crypto.randomUUID()+crypto.randomUUID(),hash=await sha256(raw),expires=Math.floor(Date.now()/1000)+48*60*60;
  await env.DB.prepare('INSERT INTO downloads (token_hash,order_id,expires_at) VALUES (?,?,?)').bind(hash,order.id,expires).run();
  return json({url:'/api/download?token='+raw});
 }catch(e){return json({error:'تعذر تجهيز رابط التحميل'},500)}
}
