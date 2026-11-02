(async()=>{
 const q=new URLSearchParams(location.search),order=q.get('order'),payment=q.get('id');
 const box=document.getElementById('result');
 if(!order||!payment){box.textContent='لم تصل بيانات عملية الدفع. إذا تم خصم المبلغ، تواصل مع الدعم.';return}
 try{
  // Attach first in case the browser's on_completed callback did not finish before redirect.
  await fetch('/api/attach-payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({order_id:order,payment_id:payment})});
  const r=await fetch('/api/claim-download',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({order_id:order,payment_id:payment})});
  const d=await r.json();if(!r.ok)throw Error(d.error||'لم يكتمل الدفع');
  box.textContent='تم تأكيد الدفع بنجاح. رابط التحميل صالح لمدة 48 ساعة ولمرة واحدة.';
  const a=document.getElementById('download');a.href=d.url;a.classList.remove('hidden');document.getElementById('home').classList.remove('hidden');
 }catch(e){box.textContent=e.message+' إذا تم خصم المبلغ، تواصل مع الدعم وأرسل رقم الطلب: '+order}
})();
