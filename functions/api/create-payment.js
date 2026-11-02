import {json} from '../_shared.js';
export async function onRequestPost({request,env}) {
 try {
  if(!env.MOYASAR_PUBLISHABLE_KEY||!env.SITE_URL)return json({error:'إعدادات الدفع غير مكتملة'},503);
  const body=await request.json(),p=await env.DB.prepare('SELECT id,title,price_halalas FROM products WHERE id=? AND published=1').bind(body.product_id).first();
  if(!p)return json({error:'المنتج غير متاح'},404);
  const orderId=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO orders (id,product_id,customer_email,amount_halalas,currency,status) VALUES (?,?,?,?,?,?)').bind(orderId,p.id,String(body.email||'').slice(0,200),p.price_halalas,'SAR','pending').run();
  return json({order_id:orderId,amount:p.price_halalas,title:p.title,publishable_key:env.MOYASAR_PUBLISHABLE_KEY,callback_url:env.SITE_URL+'/payment-result?order='+orderId});
 }catch(e){return json({error:'تعذر تجهيز الطلب. حاول مرة أخرى.'},500)}
}
