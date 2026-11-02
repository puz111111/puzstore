const grid=document.getElementById('products-grid'), modal=document.getElementById('modal'), content=document.getElementById('modal-content');
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('close-modal').onclick=()=>modal.classList.add('hidden');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden')});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sar=n=>(n/100).toFixed(2).replace(/\.00$/,'')+' ر.س';
async function loadProducts(){
  try{
    const r=await fetch('/api/products');const data=await r.json();
    if(!r.ok)throw Error(data.error||'تعذر تحميل المنتجات');
    grid.innerHTML=data.products.length?data.products.map(p=>`<article class="product-card"><div class="product-icon">PUZ<span>.</span></div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><span class="price">${sar(p.price_halalas)}</span><button class="small-btn" data-id="${esc(p.id)}">عرض وشراء</button></div></article>`).join(''):'<div class="empty">لا توجد منتجات منشورة حالياً. قريباً نضيف أول منتج!</div>';
    grid.querySelectorAll('button').forEach(b=>b.onclick=()=>showProduct(data.products.find(p=>p.id===b.dataset.id)));
  }catch(e){grid.innerHTML='<div class="empty">تعذر تحميل المنتجات. تأكد من إعداد قاعدة البيانات.</div>'}
}

function showProduct(p){
  content.innerHTML=`<p class="eyebrow">PUZ DIGITAL PRODUCT</p><h2>${esc(p.title)}</h2><p class="muted">${esc(p.description)}</p><h2>${sar(p.price_halalas)}</h2><label>البريد الإلكتروني لاستلام الإيصال (اختياري)</label><input id="email" class="field" type="email" placeholder="name@example.com"><button id="pay" class="btn primary full">المتابعة للدفع</button><p class="note">ستظهر لك وسائل الدفع المتاحة من بوابة الدفع. لا تغلق الصفحة حتى تنتهي العملية.</p><div id="pay-status"></div>`;
  modal.classList.remove('hidden');
  document.getElementById('pay').onclick=async()=>{
    const btn=document.getElementById('pay'),status=document.getElementById('pay-status');btn.disabled=true;btn.textContent='جاري تجهيز الطلب...';
    try{
      const r=await fetch('/api/create-payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({product_id:p.id,email:document.getElementById('email').value})});
      const d=await r.json();if(!r.ok)throw Error(d.error||'تعذر إنشاء الطلب');
      content.innerHTML=`<h2>إتمام الدفع</h2><p class="muted">${esc(d.title)} — ${sar(d.amount)}</p><div class="mysr-form"></div><p class="note">الدفع يتم عبر Moyasar. وسائل الدفع التي تظهر تعتمد على تفعيلها لحسابك وإعدادات التاجر.</p>`;
      if(!document.querySelector('script[data-moyasar]')){
        const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdn.moyasar.com/mpf/1.15.0/moyasar.css';document.head.appendChild(css);
        const s=document.createElement('script');s.src='https://cdn.moyasar.com/mpf/1.15.0/moyasar.js';s.dataset.moyasar='1';
        s.onload=()=>initMoyasar(d);document.body.appendChild(s);
      }else initMoyasar(d);
    }catch(e){status.innerHTML=`<div class="status">${esc(e.message)}</div>`;btn.disabled=false;btn.textContent='المتابعة للدفع'}
  };
}
function initMoyasar(d){
  if(!window.Moyasar){document.querySelector('.mysr-form').textContent='تعذر تحميل بوابة الدفع.';return}
  window.Moyasar.init({
    element:'.mysr-form',amount:d.amount,currency:'SAR',
    description:'PUZ Store Order '+d.order_id,
    publishable_api_key:d.publishable_key,
    callback_url:d.callback_url,
    methods:['creditcard','applepay','stcpay'],
    on_completed:async function(payment){
      await fetch('/api/attach-payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({order_id:d.order_id,payment_id:payment.id})});
      return payment;
    }
  });
}

loadProducts();
