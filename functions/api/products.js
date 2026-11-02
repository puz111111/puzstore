import {json} from '../_shared.js';
export async function onRequestGet({env}) {
  try {
    const {results=[]}=await env.DB.prepare('SELECT id,title,description,price_halalas FROM products WHERE published=1 ORDER BY created_at DESC').all();
    return json({products:results});
  } catch(e){return json({error:'قاعدة البيانات غير جاهزة'},500)}
}
