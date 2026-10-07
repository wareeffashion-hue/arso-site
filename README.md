# منظومة وريف

صفحة هبوط تجمع كل أنظمة وريف في مكان واحد: **فريق وريف** (الحضور والعمليات)، **عزو** (الإسناد التسويقي)، والخدمات القادمة.

بدون أي مكتبات، يحتاج Node.js فقط.

```bash
npm start   # http://localhost:3000
npm test
```

## روابط الأنظمة

تُضبط من متغيرات البيئة في Railway، بدون تعديل الكود:

| المتغير | النظام |
|---|---|
| `TEAM_URL` | رابط فريق وريف (مثلاً `https://wareef-staff-production.up.railway.app`) |
| `AZWO_URL` | رابط عزو (الافتراضي `https://azwo-production.up.railway.app/app`) |

النظام اللي ما له رابط يظهر بحالة «قريباً».

## إضافة خدمة جديدة

أضف عنصراً في `public/apps.js` (الاسم، الوصف، المميزات، الأيقونة، و`env` لاسم متغير الرابط)، ثم أضف المتغير في Railway.

## النشر على Railway

مشروع جديد ← **Deploy from GitHub repo** ← هذا المستودع، ثم أضف `TEAM_URL` و `AZWO_URL` و `PORT=3000`، ثم **Settings ← Networking ← Generate Domain** بالمنفذ 3000. لا يحتاج Volume.
