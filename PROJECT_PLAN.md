# خطة المشروع التقنية: "وثيقتي" (Wathiqati) - نظام إدارة المستندات الذكي

مشروع منصة آمنة لرفع، تصنيف، وتحليل المستمسكات الشخصية باستخدام الذكاء الاصطناعي.

## 1. المكدس التقني (Technology Stack)

*   **Frontend (الواجهة الأمامية):**
    *   **Framework:** Next.js 14+ (App Router)
    *   **Language:** TypeScript
    *   **Styling:** Tailwind CSS + Radix UI (للبناء السريع والمظهر الاحترافي) + Lucide Icons
    *   **State Management:** React Query (لإدارة البيانات والسيرفر) + Zustand (للحالة المحلية البسيطة)
    *   **Animations:** Framer Motion (لخلق تجربة مستخدم مبهرة)

*   **Backend (الواجهة الخلفية):**
    *   **Framework:** NestJS (Node.js) - معياري وقابل للتوسع.
    *   **Language:** TypeScript
    *   **Documentation:** Swagger/OpenAPI (مدمج في NestJS).

*   **Database (قاعدة البيانات):**
    *   **Engine:** PostgreSQL.
    *   **ORM:** Prisma أو TypeORM (نفضل Prisma لسهولة التعامل مع الأنواع).
    *   **Vector Search:** `pgvector` extensions (للبحث الدلالي لاحقاً).

*   **Storage (التخزين):**
    *   **Provider:** Cloudflare R2 (متوافق مع S3 API، أرخص، وسريع جداً، ويدعم Signed URLs).

*   **AI & Processing:**
    *   **OCR:** Tesseract (البداية المجانية) -> Google Cloud Vision (لاحقاً للدقة العالية).
    *   **LLM Integration:** OpenAI API (GPT-4o-mini لتحليل JSON) أو Azure OpenAI.
    *   **Queue:** BullMQ (Redis) لمعالجة الملفات في الخلفية (OCR والتصنيف لا يجب أن يوقف استجابة الـ API).

---

## 2. هيكل قاعدة البيانات المقترح (Database Schema)

سنستخدم بنية علائقية قوية.

### `User`
- `id`: UUID (PK)
- `email`: String (Unique)
- `passwordHash`: String
- `fullName`: String
- `plan`: Enum (FREE, PRO, FAMILY)
- `createdAt`: Timestamp

### `Document`
- `id`: UUID (PK)
- `userId`: UUID (FK -> User)
- `title`: String (اسم الملف الظاهر)
- `originalName`: String
- `r2Key`: String (مسار الملف في R2)
- `mimeType`: String (pdf, jpeg, png...)
- `size`: Int
- `category`: Enum (ID_CARD, PASSPORT, RESIDENCE, BILL, CERTIFICATE, CONTRACT, OTHER) - *يتم تحديده بواسطة AI أو يدوياً*
- `status`: Enum (PROCESSING, READY, FAILED)
- `expiryDate`: DateTime (Nullable) - *مهم للتنبيهات*
- `isEncrypted`: Boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `ExtractedData` (بيانات المستند المستخرجة)
- `id`: UUID (PK)
- `documentId`: UUID (FK -> Document)
- `fieldName`: String (مثل: "Passport Number", "Full Name")
- `fieldValue`: String
- `confidence`: Float (ثقة الـ OCR)

### `Tag`
- `id`: UUID
- `name`: String
- `userId`: UUID

### `DocumentShare` (الروابط المؤقتة)
- `id`: UUID
- `documentId`: UUID
- `token`: String (Unique, Secure Random)
- `expiresAt`: DateTime
- `accessType`: Enum (VIEW, DOWNLOAD)
- `viewsCount`: Int (audit)

### `AuditLog` (سجل النشاطات - للأمان)
- `id`: UUID
- `userId`: UUID
- `action`: String (UPLOAD, VIEW, DELETE, DOWNLOAD_SHARE)
- `resourceId`: UUID
- `ipAddress`: String
- `timestamp`: DateTime

---

## 3. تصميم الـ API (NestJS Controllers)

### Auth Module (`/auth`)
- `POST /auth/register`: إنشاء حساب جديد.
- `POST /auth/login`: تسجيل الدخول (JWT).
- `POST /auth/2fa/generate`: تفعيل المصادقة الثنائية.

### Documents Module (`/documents`)
- `POST /documents/upload`: رفع ملف (Multipart). يقوم برفع الملف لـ R2 وإرسال رسالة لـ Queue للمعالجة (OCR).
- `GET /documents`: جلب قائمة الملفات (مع Pagination & Filtering).
- `GET /documents/:id`: جلب تفاصيل ملف.
- `GET /documents/:id/download`: الحصول على Signed URL مؤقت للتحميل.
- `PATCH /documents/:id`: تعديل (الاسم، التصنيف، تاريخ الانتهاء).
- `DELETE /documents/:id`: حذف ناعم أو نهائي.

### Search Module (`/search`)
- `GET /search?q=...`: بحث نصي (Full Text Search) في العناوين والبيانات المستخرجة.
- `GET /search/smart?q=...`: بحث ذكي (Semantic Search) "أين عقد إيجار منزلي؟".

### Share Module (`/share`)
- `POST /documents/:id/link`: إنشاء رابط مؤقت (مع تحديد مدة الانتهاء).
- `GET /share/:token`: الوصول للملف عبر الرابط العام (صفحة عرض عامة).

### AI Assistant Module (`/ai`)
- `POST /ai/chat`: محادثة مع المستندات (RAG - Retrieval Augmented Generation).
- `POST /ai/extract-summary`: طلب استخراج بيانات يدوياً لملف معين.

---

## 4. توصيات واجهة المستخدم (UI/UX)

### "The Vault" Dashboard (الرئيسية)
- **التصميم:** Card-based Grid layout. كل بطاقة تمثل مستند مع معاينة صغيرة (Thumbnail).
- **مؤشرات الحالة:**
    - شريط ملون صغير في البطاقة يدل على الفئة (أحمر للجوازات، أزرق للهويات...).
    - أيقونة "تنبيه" واضحة للمستندات التي قاربت على الانتهاء.
- **Search Bar:** كبير وفي المنتصف، يدعم الأوامر الطبيعية.

### Document View & Verify (صفحة المستند)
- تقسيم الشاشة (Split View):
    - **يمين:** معاينة المستند (PDF Viewer أو صورة).
    - **يسار:** الحقول المستخرجة (Extracted Fields) قابلة للتعديل. المستخدم يجب أن يضغط "Confirm" ليحفظ البيانات التي استخرجها الـ AI.

### Smart Upload (الرفع الذكي)
- منطقة Drag & Drop كبيرة.
- بمجرد الرفع، يظهر شريط تقدم "Analyzing..." (جاري التحليل) ليوحي بالذكاء.
- النظام يقترح: "يبدو أن هذا جواز سفر عراقي، هل تريد حفظه في مجلد 'السفر'؟".

### Emergency Mode (وضع الطوارئ)
- زر مخفي أو بحركة معينة يفعّل وضعاً يعرض فقط المستندات غير الحساسة، أو يطلب رمزاً إضافياً لفتح "الخزنة العميقة".

---

## 5. خريطة الطريق (Implementation Roadmap Update)

### الأسبوع 1: الأساس (Bone Structure)
1.  إعداد Monorepo (أو مجلدين منفصلين client/server).
2.  إعداد Docker و Postgres.
3.  بناء NestJS Backend مع Prisma و Auth (JWT).
4.  بناء واجهة Next.js أساسية وتسجيل الدخول.
5.  ربط Cloudflare R2 وخدمة الرفع الأساسية.

### الأسبوع 2: الذكاء والربط (Brain & Connect)
1.  بناء خدمة OCR (Tesseract مبدئياً).
2.  واجهة عرض المستندات واستخراج البيانات.
3.  نظام الروابط المؤقتة.
4.  لوحة التحكم (Dashboard) مع التفرقة بين الأنواع.

### الأسبوع 3: الصقل (Polish)
1.  تحسينات الـ UX والأنيميشن.
2.  التنبيهات (Cron Job يفحص الانتهاء).
3.  نشر النسخة الأولى (Deployment).
