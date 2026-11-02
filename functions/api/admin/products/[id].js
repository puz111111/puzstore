import {json,adminOK,slugify} from '../../../_shared.js';
export async function onRequestPut({request,env,params}) {
 if(!await adminOK(request,env))return json({error:'غير مصرح'},401);
 try {
  const f=await request.formData(),id=params.id,title=String(f.get('title')||'').trim(),price=Math.round(Number(f.get('price'))*100);
  if(!title||!Number.isFinite(price)||price<100)return json({error:'تحقق من الاسم والسعر'},400);
  const published=f.get('published')==='1'?1:0,description=String(f.get('description')||'');
  const file=f.get('file');
  if(file instanceof File&&file.size){
   if(file.size>25*1024*1024)return json({error:'الحد الأقصى 25MB'},400);
   const key='products/'+id+'/'+crypto.randomUUID()+'_'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
   await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type||'application/octet-stream'}});
   const old=await env.DB.prepare('SELECT file_key FROM products WHERE id=?').bind(id).first();
   await env.DB.prepare('UPDATE products SET title=?,slug=?,description=?,price_halalas=?,published=?,file_key=?,file_name=?,file_mime=? WHERE id=?').bind(title,slugify(title)+'-'+id.slice(0,6),description,price,published,key,file.name,file.type||'application/octet-stream',id).run();
   if(old?.file_key)await env.BUCKET.delete(old.file_key);
  } else {
   await env.DB.prepare('UPDATE products SET title=?,slug=?,description=?,price_halalas=?,published=? WHERE id=?').bind(title,slugify(title)+'-'+id.slice(0,6),description,price,published,id).run();
  }
  return json({ok:true});
 }catch(e){return json({error:'تعذر تعديل المنتج'},500)}
}
export async function onRequestDelete({request,env,params}) {
 if(!await adminOK(request,env))return json({error:'غير مصرح'},401);
 const p=await env.DB.prepare('SELECT file_key FROM products WHERE id=?').bind(params.id).first();
 if(p?.file_key)await env.BUCKET.delete(p.file_key);
 await env.DB.prepare('DELETE FROM products WHERE id=?').bind(params.id).run();
 return json({ok:true});
}
