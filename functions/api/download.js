import {sha256} from '../_shared.js';
export async function onRequestGet({request,env}) {
 try{
  const token=new URL(request.url).searchParams.get('token')||'',hash=await sha256(token);
  const d=await env.DB.prepare('SELECT order_id,expires_at,used_at FROM downloads WHERE token_hash=?').bind(hash).first();
  if(!d||d.expires_at<Math.floor(Date.now()/1000)||d.used_at)return new Response('رابط التحميل غير صالح أو انتهت صلاحيته.',{status:410});
  const p=await env.DB.prepare('SELECT file_key,file_name,file_mime FROM products JOIN orders ON products.id=orders.product_id WHERE orders.id=?').bind(d.order_id).first();
  if(!p)return new Response('الملف غير موجود.',{status:404});
  const object=await env.BUCKET.get(p.file_key);
  if(!object)return new Response('الملف غير موجود.',{status:404});
  await env.DB.prepare('UPDATE downloads SET used_at=? WHERE token_hash=?').bind(Math.floor(Date.now()/1000),hash).run();
  return new Response(object.body,{headers:{'content-type':p.file_mime,'content-disposition':`attachment; filename*=UTF-8''${encodeURIComponent(p.file_name)}`,'cache-control':'no-store'}});
 }catch(e){return new Response('حدث خطأ.',{status:500})}
}
