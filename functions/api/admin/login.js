import {json,sha256,safeEqual,signedAdmin} from '../../_shared.js';
export async function onRequestPost({request,env}) {
  try {
    const {password=''}=await request.json();
    if(!env.ADMIN_PASSWORD_HASH||!env.DOWNLOAD_SIGNING_SECRET)return json({error:'إعدادات الإدارة غير مكتملة'},500);
    const hash=await sha256(password);
    if(!safeEqual(hash,env.ADMIN_PASSWORD_HASH))return json({error:'كلمة المرور غير صحيحة'},401);
    return json({token:await signedAdmin(env)});
  } catch(e){return json({error:'تعذر تسجيل الدخول'},400)}
}
