# 🤲 منصة الدعاء الجماعي

منصة لتجميع المؤمنين من كل أنحاء العالم للدعاء المشترك

---

## 🚀 البدء السريع

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد المتغيرات البيئية

انسخ ملف `.env.local.example` إلى `.env.local` وأضف بياناتك:

```bash
cp .env.local.example .env.local
```

### 3. تشغيل المشروع محلياً

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح

---

## 📦 البناء للإنتاج

```bash
npm run build
npm start
```

---

## 🌐 النشر على Vercel

### الطريقة الأسهل:

1. ادفع الكود إلى GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. انقر "New Project"
4. اختر المستودع
5. أضف المتغيرات البيئية
6. انقر "Deploy"

---

## 📱 مميزات PWA

الموقع يعمل كتطبيق:
- ✅ قابل للتثبيت على الموبايل
- ✅ يعمل بدون إنترنت (offline)
- ✅ إشعارات Push
- ✅ تجربة Native App

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول المطلوبة:

#### 1. users
```sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  mother_name text not null,
  city text,
  show_full_name boolean default true,
  created_at timestamp with time zone default now()
);
```

#### 2. prayer_requests
```sql
create table prayer_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  type text not null check (type in ('need', 'deceased')),
  deceased_name text,
  deceased_mother text,
  relation text,
  status text default 'active' check (status in ('active', 'resolved')),
  prayer_count integer default 0,
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);
```

#### 3. prayers
```sql
create table prayers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  request_id uuid references prayer_requests(id),
  prayed_at timestamp with time zone default now()
);
```

#### 4. contact_messages
```sql
create table contact_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  message text not null,
  created_at timestamp with time zone default now()
);
```

### Function لزيادة العداد:
```sql
create or replace function increment_prayer_count(request_id uuid)
returns void as $$
begin
  update prayer_requests
  set prayer_count = prayer_count + 1
  where id = request_id;
end;
$$ language plpgsql;
```

---

## 🔔 إعداد الإشعارات

### 1. إنشاء VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### 2. أضف المفاتيح في `.env.local`

---

## 📧 إعداد البريد الإلكتروني

لإرسال رسائل التواصل إلى haydar.cd@gmail.com:

1. قم بتفعيل "App Passwords" في حساب Gmail
2. أضف البيانات في `.env.local`

---

## 🎨 التخصيص

### الألوان
عدّل `tailwind.config.js` لتغيير الألوان

### الرسائل التشجيعية
عدّل مصفوفة `encouragingMessages` في `components/DuaPlatform.js`

### الإنجازات
عدّل مصفوفة `achievements` في `components/DuaPlatform.js`

---

## 📄 الترخيص

فكرة وتطوير: الغافقي 🌿

منصة الدعاء الجماعي © 2025

---

## 📞 التواصل

للاستفسارات: haydar.cd@gmail.com