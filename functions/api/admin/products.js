import {json,adminOK,slugify} from '../../_shared.js';
const id=()=>crypto.randomUUID();
export async function onRequestGet({request,env}) {
 if(!await adminOK(request,env))return json({error:'غير مصرح'},401);
 const {results=[]}=await env.DB.prepare('SELECT id,title,slug,description,price_halalas,published,file_name FROM products ORDER BY created_at DESC').all();
 return json({products:results});
}
export async function onRequestPost({request,env}) {
 if(!await adminOK(request,env))return json({error:'غير مصرح'},401);
 try {
  const f=await request.formData(),file=f.get('file');
  if(!(file instanceof File)||!file.size)return json({error:'ارفع ملف المنتج'},400);
  if(file.size>25*1024*1024)return json({error:'الحد الأقصى للملف 25MB في هذا الإصدار'},400);
  const title=String(f.get('title')||'').trim(),price=Math.round(Number(f.get('price'))*100);
  if(!title||!Number.isFinite(price)||price<100)return json({error:'تحقق من الاسم والسعر'},400);
  const pid=id(),slug=slugify(title)+'-'+pid.slice(0,6),key='products/'+pid+'/'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type||'application/octet-stream'}});
  await env.DB.prepare('INSERT INTO products (id,title,slug,description,price_halalas,file_key,file_name,file_mime,published) VALUES (?,?,?,?,?,?,?,?,?)').bind(pid,title,slug,String(f.get('description')||''),price,key,file.name,file.type||'application/octet-stream',f.get('published')==='1'?1:0).run();
  return json({ok:true,id:pid});
 }catch(e){return json({error:'تعذر حفظ المنتج. تأكد من ربط مخزن الملفات R2.'},500)}
}
