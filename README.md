# SlipScan

ระบบอ่านสลิปโอนเงินอัตโนมัติ สำหรับร้านค้า/แม่ค้าออนไลน์ — รองรับทั้ง Web และ LINE OA (LIFF)

---
## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind |
| Backend | n8n (self-hosted on Railway) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email magic link + Google OAuth + LINE) |
| Storage | Supabase Storage |
| OCR | Typhoon OCR — `typhoon-ocr` (scb10x) |
| Parse | Typhoon — `typhoon-v2.5-30b-a3b-instruct` |
| Payment | Stripe (live mode) |
| Webhook proxy | Next.js API route (สำหรับ Stripe signature verify) |
| LIFF | LINE Front-end Framework |
| LINE OA | LINE Messaging API |
| Admin | Retool |
| Hosting | Vercel + Railway |

---

## Core Features

### User-facing (Web)
- ✅ Sign up / Login (email magic link + Google OAuth)
- ✅ Upload สลิปโอนเงิน — รับครั้งละสูงสุด 10 รูป พร้อม progress list (real-time status)
- ✅ อ่านข้อมูลสลิปอัตโนมัติ — ชื่อผู้รับ, ยอดเงิน, วันที่, เวลา, ธนาคาร, เลขอ้างอิง
- ✅ Dashboard
  - filter ตามวันที่อัปโหลด (default) หรือวันที่โอน (option) — ของที่ OCR อ่านวันไม่ออกแยกหมวด "ไม่ระบุวันที่"
  - pagination
  - แก้ไขข้อมูลสลิปได้
  - ดูรูปต้นฉบับใน popup
  - export CSV (พร้อม escape ค่าที่มี comma/quote กัน column เลื่อน)
  - empty state แยกระหว่าง "user ใหม่ยังไม่มีสลิป" (มี CTA) กับ "กรองแล้วไม่เจอ"
- ✅ Settings page — connected accounts (LINE, Google), credits, sign out
- ✅ Pricing + Payment
  - 3 packs: Starter ($1/100), Pro ($5/550), Whale ($10/1200)
  - Stripe Checkout — dynamic session พร้อม `client_reference_id`
- ✅ Signup bonus — แจก **150 credits** ฟรีระหว่าง beta (ลดเหลือ 20 credits หลัง beta)
- ✅ Support page — form ติดต่อ (Formspree)

### User-facing (LIFF — LINE)
- ✅ Auto login ผ่าน LINE access token
- ✅ สร้าง Supabase user อัตโนมัติเมื่อเข้า LIFF ครั้งแรก
- ✅ Header: avatar + display_name + credits chip
- ✅ Upload สลิป (camera capture) — รับครั้งละสูงสุด 10 รูป พร้อม timeout 60 วิ
  - อัปใบเดียว → ขึ้น Result modal
  - อัปหลายใบ → โชว์ "สแกนสำเร็จ N ใบ" inline (ไม่ขึ้น modal)
  - progress แสดงกล่องเทา แยกจาก error (กล่องแดง)
  - เกิน 10 รูป → เตือนและไม่ประมวลผล (ไม่ตัดเงียบ)
- ✅ Tab navigation ผ่าน `?tab=main/history/buy`
  - `?tab=main` → หน้าหลัก + upload + history 5 ล่าสุด
  - `?tab=history` → history 20 รายการ + header "ประวัติทั้งหมด"
  - `?tab=buy` → เปิด BuyModal อัตโนมัติ
- ✅ Result modal หลัง upload (เฉพาะอัปใบเดียว)
- ✅ Paywall banner เมื่อ credits = 0
- ✅ Buy Credits modal (Starter / Pro / Whale) ผ่าน Stripe
- ✅ ปุ่ม "เปิดบนเว็บ · export" — อยู่หัว section history มุมขวา (เห็นทันทีไม่ต้อง scroll)
  - Magic Link auto-login เป็น user เดียวกัน
- ✅ Connect Google / Connect LINE (account linking)
- ✅ Auto dark/light mode

### LINE OA (Messaging API)
- ✅ **Rich Menu A** (default, ก่อน register) — ปุ่มเดียว "เริ่มต้นใช้งาน" → เปิด LIFF
- ✅ **Rich Menu B** (หลัง register) — 3 ปุ่ม: Main / History / Buy
- ✅ **Rich Menu Beta** (4 ปุ่ม) — Main / History / Buy / ข้อเสนอแนะ → Google Form
- ✅ Switch Rich Menu A → B อัตโนมัติหลัง register ใน LIFF
- ✅ Switch Rich Menu → B กรณี user เคย register แล้ว follow OA ซ้ำ
- ✅ Welcome message Flex (user ใหม่) — อธิบายระบบ + แพ็คเกจ + ปุ่ม LIFF
- ✅ Welcome back message Flex (user เก่า) — credits คงเหลือ + ปุ่มเปิดแอป
- ✅ ส่งรูปสลิปใน chat → OCR → reply ผลลัพธ์ (Push API)
- ✅ **Notify Processing** — ส่ง "⏳ กำลังอ่านข้อมูล..." ครั้งเดียวต่อ batch ก่อนเริ่ม OCR (TTL dedup 10 วิ ผ่าน Supabase)
- ✅ **OCR error handling** — ถ้า OCR timeout/fail แจ้ง user ทันทีไม่ตัด credit
- ✅ รองรับ LINE batch events (หลายรูปใน webhook เดียว) ด้วย Loop Over Items
- ✅ แจ้งเตือน: ยังไม่ register / credits หมด / ไม่ใช่รูปสลิป / เกิน limit
- ✅ Survey ผ่าน LINE OA Survey (แชร์ผ่าน broadcast)

### Admin (Retool)
- ✅ Stats: total users, new today, total receipts, total credits
- ✅ User lookup ด้วย email
- ✅ Adjust credits (เขียน SQL ตรง ยังไม่ผ่าน ledger — ดู Pending Tasks)
- ✅ Recent receipts table (id, email, receiver_name, amount, bank_from, bank_to, created_at)
- ✅ Export CSV
- ✅ Returning users section
  - การ์ดสรุป: กลับมาอัปวันอื่น / จากทั้งหมด / % กลับมา
  - ตารางคนที่ active_days ≥ 2 เรียงตาม slips_used DESC (slips_used = credits ที่ใช้)
  - กดแถว → ดู receipts ของ user คนนั้นเรียงตามวัน

### Security
- ✅ Auth Guard ทุก API (รองรับทั้ง Supabase JWT และ LINE access token)
- ✅ RLS (Row Level Security) เปิดบน Supabase
- ✅ Privacy Policy + Terms of Use
- ✅ Google OAuth production verified
- ✅ Stripe webhook signature verify ผ่าน Next.js middleware
- ✅ LINE OAuth state validation (CSRF protection)
- ✅ Account linking duplicate check (block 409 หาก LINE account ผูกกับ user อื่น)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                       Web (Next.js)                       │
│   /login  /dashboard  /pricing  /settings  /auth/line/cb  │
└────────────┬─────────────────────────────────────────────┘
             │
             │ Supabase JWT
             │
┌────────────▼─────────────────────────────────────────────┐
│                       LIFF (Next.js)                      │
│         /liff  ?tab=main/history/buy                      │
└────────────┬─────────────────────────────────────────────┘
             │
             │ Authorization: Bearer <token>
             ▼
┌──────────────────────────────────────────────────────────┐
│                    n8n (Railway)                          │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Auth Module (Sub-workflow)                         │  │
│  │  ├─ Detect token type (Supabase / LINE)             │  │
│  │  ├─ Verify + return user_id, credits, profile       │  │
│  │  ├─ Auto-create Supabase user สำหรับ LINE ใหม่      │  │
│  │  └─ Switch Rich Menu A → B หลัง register ใหม่       │  │
│  └────────────────────────────────────────────────────┘  │
│                            ▲                              │
│                            │ Execute Workflow             │
│                            │                              │
│  ┌─────────────────────────┴────────────────────────────┐│
│  │  Bill              — POST /webhook/upload             ││
│  │  Liff API          — GET /webhook/me, /webhook/history││
│  │  Web Login         — POST /webhook/web-login          ││
│  │  Line Link         — POST /webhook/line-link          ││
│  │  Checkout          — POST /webhook/create-checkout    ││
│  │  Stripe Pay        — POST /webhook/stripe-payment     ││
│  │  LINE Message      — POST /webhook/line-message       ││
│  └──────────────────────────────────────────────────────┘│
└────────────┬─────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│             Supabase (Postgres + Auth + Storage)          │
└──────────────────────────────────────────────────────────┘
```

---

## n8n Workflows

### 1. Auth Module (Sub-workflow)
- **Workflow ID:** `YOUR_WORKFLOW_ID`
- **Trigger:** Execute Workflow Trigger
- **Input:** `{ headers: { authorization: "Bearer ..." } }`
- **Output:** `{ user_id, auth_type, credits, line_user_id, display_name, picture_url, is_new_user }`

```
Execute Workflow Trigger
   ↓
Extract Token → Check Auth Type → IF Check
   ├─ Supabase → Verify UUID → Verify Token → Fetch User → Format Supabase Output → Merge (idx 0)
   └─ LINE     → Verify Line Token → Get Or Create → Create Auth User
               → Resolve Auth User ID → Excute Query (CTE INSERT...UNION ALL)
               → Format Line Output → Is New User?
                                        ├─ true → Switch Rich Menu B → Pass Line Data → Merge (idx 0)
                                        └─ false ───────────────────────────────────→ Merge (idx 0)
```

**หมายเหตุสำคัญ — เคยพังเพราะ Merge node:**
- Merge node ต้องตั้ง **mode = `append`** (ไม่ใช่ default `combine`) — combine จะรอครบ 2 inputs ก่อน output ทำให้ workflow ค้าง user_id ส่งกลับเป็น `undefined`
- **Switch Rich Menu** เป็น HTTP request ไป LINE API → response กลับมาเป็น `{}` ไม่ใช่ user data → ห้ามต่อตรงเข้า Merge
- ต้องมี **Pass Line Data** code node คั่นเพื่อดึง `$('Format Line Output').first().json` กลับมา:
  ```javascript
  const lineData = $('Format Line Output').first().json;
  return [{ json: lineData }];
  ```
- ทั้ง true/false path ต้องต่อเข้า Merge **index 0** เหมือนกัน (ไม่ใช่ index 1) เพราะใช้ append mode แล้ว

**Rich Menu IDs:**
| ชื่อ | ID |
|------|-----|
| Rich Menu A (welcome) | `richmenu-YOUR_ID_A` |
| Rich Menu B (main, 3 ปุ่ม) | `richmenu-YOUR_ID_B` |
| Rich Menu Beta (4 ปุ่ม) | `richmenu-YOUR_ID_BETA` |

### 2. Bill Workflow (OCR + Upload)
```
Webhook /upload
   ↓
Validate Upload (เช็ค mime type + ขนาด ≥ 1KB)
   ↓
Check Upload IF
   ├─ invalid → Block - File (respond error, ไม่ตัด credit)
   └─ valid
        ↓
        Resize Image (onlyIfLarger, continueOnFail)
           ↓
        Base64 → Validate File (mime type check ซ้ำ)
           ↓
        Check File IF
           ├─ invalid → Block - File
           └─ valid
                ↓
                Authenticate User (Auth Module)
                   ↓
                Upload to Storage → Rate Limit → Check Credits
                   ├─ exceeded → Block - Rate Limited
                   ├─ no credits → Block - No Credits
                   └─ ok
                        ↓
                        Typhoon OCR → Typhoon Parse → Parse Result
                           ↓
                        Is Slip? IF
                           ├─ false → Block - Not Slip (respond error, ไม่ตัด credit)
                           └─ true
                                ↓
                                Save Receipt → Consume Credit → Log Usage → Respond Success
```

**หมายเหตุ Typhoon OCR/Parse:**
- OCR: `POST https://api.opentyphoon.ai/v1/chat/completions` model `typhoon-ocr`
- Parse: model `typhoon-v2.5-30b-a3b-instruct` — ใช้ prompt v11 (ดูหัวข้อ Parse Prompt Rules)
- OCR image_base64 ดึงจาก `$json.image_base64`, mime_type จาก `$json.mime_type`
- **ไม่ใช้ `=` prefix** ใน JSON Body field ของ n8n HTTP node (จะพัง) — ขึ้นต้นด้วย `{` ตรงๆ
- newline escape ใน OCR text: ใช้ `{{ JSON.stringify($json.choices[0].message.content).slice(1,-1) }}`

### 3. Liff API Workflow
- `GET /webhook/me` → Auth Module → return user profile + credits
- `GET /webhook/history` → Auth Module → SELECT receipts LIMIT 20 + COUNT(*) OVER() AS total_count

**หมายเหตุสำคัญ — Postgres node ตอน query ไม่เจอ row:**
- ไม่ได้คืน `[]` ตามที่คาด — มันคืน **1 item ที่เป็น empty object `{}`**
- `$input.all().length` จะ = 1 แม้ไม่มีข้อมูล → ตารางขึ้น count = 1 ผิด
- ต้อง filter empty items ใน Format Response node:
  ```javascript
  const receipts = $input.all()
    .map(item => item.json)
    .filter(r => r.id != null)  // กรอง empty object ออก
  ```

### 4. Web Login Workflow (Magic Link)
```
Webhook → Auth Module (LINE token) → Fetch User Email → Generate Magic Link → return { redirect_url }
```

### 5. Line Link Workflow (Account Linking)
```
Webhook → Auth Module (Supabase JWT) → Exchange Code for Token → Get LINE Profile
   ↓
Check Duplicate
   ├─ duplicate → 409 { error: "line_already_linked" }
   └─ ok → UPDATE users SET line_user_id, display_name, picture_url → Success
```

### 6. Create Checkout Workflow
```
Webhook → Check Pricing (map plan → price_id) → Stripe API → return checkout URL
```
- `client_reference_id = "user_id|plan"` (ไม่ใช้ metadata)

### 7. Stripe Payment Workflow
```
Webhook (จาก Next.js proxy) → Parse Event → Save Payment → Add Credit → Log Credit Purchase → Respond
```

### 8. LINE Message Webhook
- `POST /webhook/line-message`
- รับ events จาก LINE Messaging API

```
Webhook → Extract Event (filter + batch max 5)
   ↓
Notify Processing (runOnceForAllItems — TTL dedup 10 วิ via Supabase, guard: status='image' + user exists)
   ↓
Loop Over Items (batchSize=1)
   ├─ done → Response OK
   └─ loop → Is Follow?
               ├─ true  → Get User (Follow) → Build Welcome Reply → Is Existing User?
               │                                 ├─ existing → Switch Rich Menu B → Reply Welcome → Loop
               │                                 └─ new      → Reply Welcome → Loop
               └─ false → Get User → Check User & Credits
                                       ├─ no_user    → "กรุณาสมัครก่อน" → Reply → Loop
                                       ├─ no_credits → "Credits หมด" → Reply → Loop
                                       ├─ not_image  → "กรุณาส่งรูปสลิป" → Reply → Loop
                                       ├─ overflow   → "ส่งได้ครั้งละ 5 รูป" → Reply → Loop
                                       └─ ok → Download Image → Resize Image → Prepare Image
                                                 ↓
                                               Upload to Storage
                                                 ↓
                                               Typhoon OCR (continueOnFail=true)
                                                 ↓
                                               OCR Success? IF
                                                 ├─ false → Build OCR Error Reply → Reply Error Message → Loop
                                                 └─ true
                                                      ↓
                                                    Typhoon Parse → Parse Result
                                                      ↓
                                                    Is Slip? IF
                                                      ├─ false → Build Error Reply (not_image) → Reply → Loop
                                                      └─ true
                                                           ↓
                                                         Save Receipt → Consume Credit
                                                           → Log Usage → Build Success Reply
                                                           → Reply Success (Push API) → Loop
```

**หมายเหตุสำคัญ:**
- ใช้ **Push API** (`/v2/bot/message/push`) ไม่ใช้ Reply API เพราะ Reply token หมดอายุใน 1 นาที และใช้ได้ครั้งเดียว
- LINE อาจ batch หลาย events ใน 1 webhook (เช่น 3 รูปใน events array เดียว) → Loop Over Items จัดการ
- Get User node ต้องเปิด **Always Output Data** ไม่งั้น workflow หยุดเมื่อ user ไม่มีใน DB
- `$('Loop Over Items').item.json` ดึง event ปัจจุบันของ loop (ไม่ใช้ `.first()`)
- OCR image_base64/mime_type ดึงจาก `$('Prepare Image').first().json` (ไม่ใช่ `$json`) เพราะ Upload to Storage คั่นกลาง
- Download Image URL ใช้ `$('Check User & Credits').first().json.message_id` (named reference) ไม่ใช่ `$json.message_id` เพราะ Reply Processing/HTTP node ทับ `$json`
- **Notify Processing** ต้อง guard ด้วย `status === 'image'` + SELECT users ตรวจว่ามีบัญชีก่อนส่ง ไม่งั้น follow event หรือ user ใหม่จะได้ "กำลังอ่านข้อมูล" โดยไม่มีความหมาย:
  ```javascript
  const lineUserId = items.find(
    i => i.json.status === 'image' && i.json.line_user_id
  )?.json.line_user_id;
  // SELECT users WHERE line_user_id = lineUserId ก่อนส่ง
  ```

---

## Frontend Pages

| Path | Description |
|------|-------------|
| `/login` | Email magic link + Google OAuth login |
| `/dashboard` | Receipts list, upload zone, stats |
| `/settings` | Connected accounts (LINE, Google), credits, sign out |
| `/auth/line/callback` | รับ OAuth code จาก LINE → POST `/webhook/line-link` |
| `/pricing` | Stripe Checkout |
| `/liff` | LIFF dashboard — รองรับ `?tab=main/history/buy` |
| `/payment/success` | หน้าหลังจ่ายเงิน — รองรับ LIFF (`?from=liff`) |
| `/support` | Form ติดต่อ (Formspree) |

---

## Payment Architecture (Stripe)

```
User กดซื้อ pack (web หรือ LIFF)
    ↓
n8n create-checkout → Stripe API → return checkout URL
    ↓
User จ่ายเงิน → Stripe webhook → Next.js /api/stripe-webhook
    ↓
Next.js verify signature → forward ไป n8n /webhook/stripe-payment
    ↓
n8n: Save Payment → Add Credit → Respond
```

**ทำไมต้องผ่าน Next.js:** n8n ไม่เก็บ rawBody → verify Stripe signature ใน n8n ไม่ได้

---

## LINE Integration

### Channels

| Channel | ใช้ตอนไหน | ID |
|---------|----------|-----|
| LIFF Channel | LIFF page (mobile) | `YOUR_LIFF_CHANNEL_ID` (LIFF ID: `YOUR_LIFF_ID`) |
| LINE Login Channel (web OAuth) | Connect LINE button ใน /settings | `YOUR_LINE_LOGIN_CHANNEL_ID` |
| LINE Messaging API | LINE OA bot, Rich Menu, webhook | `YOUR_MESSAGING_API_CHANNEL_ID` |

### Rich Menu Setup (สร้างผ่าน LINE Messaging API เท่านั้น)
- OA Manager Rich Menu ไม่สามารถ switch ด้วย API ได้ → ต้องสร้างผ่าน API
- ขนาด A, B: 2500×843 (compact)
- ขนาด Beta: 2500×1686 (full, 2 แถว)
- Upload รูปผ่าน `api-data.line.me` (ไม่ใช่ `api.line.me`)
- Default A → ใช้ `POST /v2/bot/user/all/richmenu/{id}`
- Switch per user → `POST /v2/bot/user/{userId}/richmenu/{id}`

### Account Identity Pattern
- LINE user ที่เข้าผ่าน LIFF ครั้งแรก → ระบบสร้าง user ด้วย email `<line_user_id>@line.user`
- Magic Link generate ให้ email นี้ → LINE user เปิด web ได้ในฐานะ user เดียวกัน

---

## Infrastructure (Deployment)

### Railway — n8n Backend
- Public URL: `https://your-n8n.railway.app`
- Plan: **Hobby ($5/เดือน)** — idle ~$4.94/เดือน, traffic จริงบวกอีกน้อยมาก
- Payment: Virtual Debit Card ที่รองรับการจ่ายต่างประเทศ
  - ⚠️ บัตร prepaid Railway บล็อก ใช้ไม่ได้
- ยกเลิกได้: Account → Billing → Cancel Plan (service หยุดทันที แต่ data อยู่ถึงสิ้นรอบ)

**ทำไมไม่ใช้ n8n Cloud**
- n8n Cloud Starter = $24/เดือน (คิดต่อ execution — 2,500/เดือน)
- Self-host บน Railway = ~$5/เดือน (ไม่จำกัด execution)
- OCR app ยิง 1 execution ต่อ 1 upload → execution-based pricing แพงมากสำหรับ use case นี้
- Railway ถูกกว่า **5 เท่า** และไม่มี execution limit
- Webhook endpoints:
  - `/webhook/upload`
  - `/webhook/me`
  - `/webhook/history`
  - `/webhook/web-login`
  - `/webhook/line-link`
  - `/webhook/create-checkout`
  - `/webhook/stripe-payment`
  - `/webhook/line-message`

### Supabase Postgres connection (จาก Railway)
- ต้องใช้ **Transaction Pooler** เท่านั้น (port 6543)
- SSL mode: Allow หรือ Disable

### Railway — Cost & Billing

**โครงสร้างค่าใช้จ่าย**
- Railway **ไม่ได้คิดตาม request** — คิดตาม **resource-time** (RAM × CPU × วินาทีที่รัน)
- ตัวกินเงินหลัก = **RAM idle** (n8n เปิดค้าง 24 ชม. กิน ~$4.85-4.94/เดือน)
- CPU + Egress จาก webhook/OCR จริงๆ รวมกันแค่ ~$0.06 ต่อเดือน (ถูกมาก)
- แปลว่า: ต่อให้ traffic beta เพิ่ม 10 เท่า บิลเพิ่มแค่ ~$0.50-1.00 ไม่ใช่พุ่งทวีคูณ

**ตัวเลขจริง (May 2 – Jun 1, 2025)**
| รายการ | Usage | ค่าใช้จ่าย |
|---|---|---|
| Memory | 20,947 GB-min | $4.85 |
| CPU | 90.98 vCPU-min | $0.04 |
| Egress | 0.47 GB | $0.02 |
| Volume | 6,628 GB-min | $0.02 |
| **รวม** | | **$4.94** |

**Spending Limit ที่ตั้งไว้**
- Email alert: $6 (เตือนเมื่อเกิน idle ปกติ)
- Hard limit: $10 (ปิด service กันบิลพุ่ง)
- ตั้งได้ที่: `railway.app/account/usage` → Set Usage Limits (โผล่เฉพาะ Hobby plan)

⚠️ Hard limit = service ทั้งหมดหยุดทันที แต่ data + config ยังอยู่จนถึงรอบบิลใหม่

### Railway — n8n Internal Database (Postgres บน Railway)

n8n มี **Postgres แยกต่างหากบน Railway** สำหรับเก็บข้อมูลตัวเอง (workflow, execution logs) — **ไม่ใช่ตัวเดียวกับ Supabase** ที่เก็บข้อมูล app

**ปัญหาที่เจอ: execution_data บวม**
- n8n เก็บ execution log ทุกครั้งที่ workflow รัน สะสมจากการเทส → โตเป็น 280MB (94% ของ volume 500MB)
- แก้โดยลบ log เก่าใน Query tab และตั้ง prune อัตโนมัติ

**วิธีเช็คขนาดตาราง**
```sql
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

**วิธีล้าง execution log (ทำเมื่อ volume เต็ม)**
```sql
-- ลบ log เก่ากว่า 7 วัน
DELETE FROM execution_entity WHERE "startedAt" < NOW() - INTERVAL '7 days';

-- หรือลบทั้งหมด (ถ้ายังไม่ปล่อย production)
TRUNCATE TABLE execution_data CASCADE;
```

⚠️ `VACUUM FULL` รันใน Railway Query editor ไม่ได้ (transaction block error) → ใช้ `TRUNCATE` แทน ซึ่งคืนพื้นที่ disk ได้ทันที

**ตั้ง Auto-Prune กันบวมอีก (สำคัญ — ต้องทำก่อน beta)**
ไปที่ n8n service → Variables เพิ่ม:
```
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
EXECUTIONS_DATA_MAX_COUNT=10000
```
หลังตั้งแล้ว n8n จะลบ log เก่ากว่า 7 วัน / เกิน 10,000 รายการอัตโนมัติ

---

## Database Schema

```
users
├── id (UUID, FK to auth.users.id)
├── email
├── credits
├── line_user_id (UNIQUE, nullable)
├── display_name
├── picture_url
├── last_processing_notice_at (timestamptz, nullable) ← dedup Notify Processing TTL
└── created_at

receipts
├── id (UUID)
├── user_id (UUID)
├── receiver_name, sender_name
├── amount, date, time
├── bank_from, bank_to
├── ref_number, note
├── raw_text, image_url
├── confidence (text: high/medium/low)  ← is_authentic/suspicious_signs ถูกตัดออกแล้ว
└── created_at

credit_transactions
├── id (UUID)
├── user_id (UUID)
├── amount (int, +/-)
├── type (signup_bonus | purchase | usage | manual_adjustment)
├── ref_id (text, nullable) ← ref_number สลิป (สำหรับ usage) หรือ payment_id (สำหรับ purchase)
└── created_at (default NOW())

payments
├── id
├── user_id
├── amount, credits_added
├── status, provider, provider_ref
└── created_at
```

### หมายเหตุ credit_transactions
ตาราง write จาก 3 flow แล้ว:
- **signup_bonus** — Supabase Database Function (trigger หลัง user สมัคร)
- **usage** — Bill workflow: `Consume Credit → Log Usage` และ LINE workflow เช่นกัน
- **purchase** — Stripe workflow: `Add Credit → Log Credit Purchase`
- **manual_adjustment** — Retool ยังเขียน `users.credits` ตรงๆ โดยไม่ผ่าน ledger (Pending)

### Retool — เรื่องที่ต้องรู้
- Retool ของ project นี้ **ไม่ parameterize** ค่า `{{ }}` อัตโนมัติ → ค่าที่เป็น string/UUID ต้องครอบด้วย single quote เองเสมอ (`'{{ value }}'`) ไม่งั้น Postgres จะพยายาม parse UUID เป็นตัวเลขแล้ว error
- query ที่ต้องการ parameter แบบ UUID ให้ใช้รูปแบบ: `WHERE user_id = '{{ table.selectedSourceRow.user_id }}'`

---

## Environment Variables

### Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n.railway.app/webhook/upload
NEXT_PUBLIC_WEB_URL=https://your-app.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRPE_SECRET_KEY=sk_live_xxx   # ⚠️ พิมพ์ผิดขาด I — ใน code ใช้ชื่อนี้ตรงๆ
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_LIFF_ID=YOUR_LIFF_ID
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=YOUR_LINE_LOGIN_CHANNEL_ID
```

### n8n (Railway env vars)
```
WEBHOOK_URL=https://your-n8n.railway.app  # ห้ามมี /webhook ต่อท้าย
NODE_FUNCTION_ALLOW_BUILTIN=crypto
EXECUTIONS_DATA_PRUNE=true        # กัน execution log บวม
EXECUTIONS_DATA_MAX_AGE=168       # เก็บ log ไว้ 7 วัน
EXECUTIONS_DATA_MAX_COUNT=10000   # เก็บไม่เกิน 10,000 รายการ
```

### n8n Credentials

| ชื่อ | Type | ใช้ตรงไหน |
|------|------|----------|
| `Postgres account` (id: `YOUR_POSTGRES_CRED_ID`) | Postgres | ทุก DB query |
| `Supabase Service Role` (id: `YOUR_SUPABASE_CRED_ID`) | Header Auth | Create Auth User, Magic Link, Storage |
| `Typhoon API` | Header Auth (Bearer) | Typhoon OCR + Typhoon Parse |
| `Stripe Secret Key` | Header Auth | Create Checkout |

---

## Pricing

| Pack | Price | Credits |
|---|---|---|
| Free | - | 20 (signup bonus ปกติ) / **150 ระหว่าง beta** |
| Starter | $1 | 100 |
| Pro | $5 | 550 (+50 bonus) |
| Whale | $10 | 1,200 (+200 bonus) |

Stripe Price IDs (live): กำหนดผ่าน environment variable ไม่ commit
- Starter: `price_xxx` (ดู Stripe Dashboard)
- Pro: `price_xxx`
- Whale: `price_xxx`

---

## Admin Dashboard (Retool) — Queries

### Stats (getStats)
```sql
SELECT
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW() AT TIME ZONE 'Asia/Bangkok')) AS new_today,
  (SELECT COUNT(*) FROM receipts) AS total_receipts,
  (SELECT COALESCE(SUM(credits), 0) FROM users) AS total_credits
FROM users;
```
⚠️ ตั้ง `runWhenPageLoads = true` — ไม่งั้นต้องกด Refresh ทุกครั้ง

### Returning Users (returningUsers)
```sql
SELECT
  u.id AS user_id,
  u.email,
  COUNT(*) AS slips_used,
  COUNT(DISTINCT DATE(r.created_at AT TIME ZONE 'Asia/Bangkok')) AS active_days,
  MIN(DATE(r.created_at AT TIME ZONE 'Asia/Bangkok')) AS first_day,
  MAX(DATE(r.created_at AT TIME ZONE 'Asia/Bangkok')) AS last_day
FROM receipts r
JOIN users u ON u.id = r.user_id
GROUP BY u.id, u.email
HAVING COUNT(DISTINCT DATE(r.created_at AT TIME ZONE 'Asia/Bangkok')) >= 2
ORDER BY slips_used DESC;
```

### Returning Summary (returningSummary)
```sql
WITH per_user AS (
  SELECT user_id,
         COUNT(DISTINCT DATE(created_at AT TIME ZONE 'Asia/Bangkok')) AS active_days
  FROM receipts GROUP BY user_id
)
SELECT
  COUNT(*) AS total_uploaders,
  COUNT(*) FILTER (WHERE active_days >= 2) AS returning_users,
  ROUND(100.0 * COUNT(*) FILTER (WHERE active_days >= 2) / NULLIF(COUNT(*), 0), 1) AS returning_pct
FROM per_user;
```

### User Receipts drill-down (userReceipts)
```sql
SELECT DATE(created_at AT TIME ZONE 'Asia/Bangkok') AS day,
       created_at, receiver_name, amount, bank_from, bank_to
FROM receipts
WHERE user_id = '{{ returningUsersTable.selectedSourceRow.user_id }}'
ORDER BY created_at DESC;
```
⚠️ UUID ต้องครอบ single quote — ดูหัวข้อ "Retool — เรื่องที่ต้องรู้"

---

## Roadmap

### Phase 2 — Find product-market fit
- โพสต์ใน channel ที่ target ถูก (ขายของออนไลน์ + Pantip + community ฟรีแลนซ์)
- ใช้ posting approach แบบ discovery ไม่ใช่ sales pitch
- รอ data 1-2 สัปดาห์ → ใช้ Decision framework ตัดสิน (ดู Beta success criteria)

### Phase 3 — ถ้า Phase 2 ผ่าน
- **Tax feature Level 2** (เก็บไว้รอ): ประมาณการภาษีจากรายรับสะสม
  - Target: ฟรีแลนซ์รับงานบุคคล (ที่ระบบสรรพากรไม่ขึ้นให้)
  - คนละ scope กับ 50 ทวิ — ใช้ data จากสลิปที่ user อัปอยู่แล้ว
  - ระวัง trend e-WHT ที่อาจทำให้ pain เบาลงในอนาคต
- ขยาย OCR provider (Typhoon → multi-provider failover)
- Self-host OCR บน RunPod (แก้ปัญหา latency peak)

### ที่ตัดสินใจไม่ทำแล้ว (ถาวร)
- ❌ Slip fraud verification — API ธนาคารต้องเป็นนิติบุคคล partner = out of scope สำหรับ indie dev
- ❌ Receipt OCR (ใบเสร็จร้านค้า) — คนละ document type
- ❌ Full tax filing assistance — ต้องการ data จาก 50 ทวิ ที่ OCR สลิปไม่มี

---

## Pending Tasks

### ต้องทำก่อน / ระหว่าง beta
- [x] **credit_transactions logging** — เพิ่ม INSERT ledger ใน n8n: usage (Bill + LINE), purchase (Stripe), signup_bonus (Supabase function)
- [x] **Retool adjust credits ผ่าน ledger** — ⚠️ ยังไม่ได้ทำ Retool ยังเขียนตรง (Pending)
- [ ] ดู image_url bug — หลัง magic link login ปุ่มดูรูปหาย (ต้องเช็ค receipts query ว่า return image_url ไหม)
- [ ] **ลด signup bonus กลับเป็น 20 credits** หลังจบ beta (ตอนนี้ตั้งไว้ 150 ใน Supabase function)
- [ ] PWA ทดสอบบน production
- [x] **ตั้ง n8n execution auto-prune** — `EXECUTIONS_DATA_PRUNE=true`, `EXECUTIONS_DATA_MAX_AGE=168`, `EXECUTIONS_DATA_MAX_COUNT=10000` (กันไม่ให้ postgres-volume บวมซ้ำ)
- [x] **ตั้ง Railway Spending Limit** — Email alert $6, Hard limit $10 (ที่ `railway.app/account/usage`)
- [x] Stripe ตั้งบัญชีธนาคารรับเงินจริง
- [x] Stripe live mode + live price_id
- [x] Test webhook end-to-end
- [x] ทดสอบจ่ายเงินจริง
- [x] Rotate LINE Login Channel Secret
- [x] LIFF integration + Magic Link
- [x] LINE OA — Rich Menu A/B/Beta
- [x] LINE OA — Welcome message + switch Rich Menu
- [x] LINE OA — chat upload OCR (Typhoon)
- [x] LINE OA — Notify Processing (TTL dedup + guard user exists)
- [x] LINE OA — OCR error handling (timeout → แจ้ง user ไม่ตัด credit)
- [x] LIFF — Buy Credits modal + Stripe
- [x] LIFF — tab navigation (?tab=main/history/buy)
- [x] LIFF — file validation ก่อน upload (ขนาด + type)
- [x] LIFF — liffReady guard ใน useEffect (กัน race condition)
- [x] LIFF — handle new user gracefully (credits = 0 ไม่ใช่ error)
- [x] Retool — Returning users section (stat cards + table + drill-down)
- [x] Web dashboard — filter วันที่อัปโหลด (default) + วันที่โอน (option) + หมวด "ไม่ระบุวันที่"
- [x] Web dashboard — CSV escape (กัน column เลื่อนจาก comma ในชื่อ)
- [x] Web dashboard — empty state แยกคนใหม่
- [x] LIFF — timeout 60 วิ + progress/error แยก state + limit 10
- [x] Web — Validate Upload node (กัน fake file ก่อน Resize)

### Nice to have (หลัง launch)
- [ ] Error monitoring (Sentry)
- [ ] Export PDF
- [ ] Email notification
- [ ] Admin retention dashboard (cohort analysis / activation metric)
- [ ] Groq → model อื่นตอน rate limit เป็นปัญหา (ไม่ relevant แล้ว เปลี่ยน Typhoon แล้ว)
- [ ] แก้ `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` ให้ work
- [ ] แก้ X-Forwarded-For warning ใน n8n
- [ ] Web dashboard — โชว์ "—" แทน "฿0.00" สำหรับแถวที่ OCR อ่านยอดไม่ออก
- [ ] Admin — drift detector (query ตรวจว่า users.credits ตรงกับ SUM(credit_transactions) ไหม)

### Beta success criteria

#### Phase 1 (Programmer + MC/PG groups) — เสร็จแล้ว
1. คนอัปสลิป **ครั้งแรกสำเร็จ** กี่คน (activation) — ได้ 7/7
2. คนที่เคยอัป **กลับมาอัปอีกในวันอื่น** กี่คน ← ตัวชี้เป็นชี้ตาย (retention) — ได้ 1/7
3. เฉลี่ยคนนึงอัปกี่รูป — ได้ 1.5 ใบ (1 active user ดึงค่าเฉลี่ย)

**สรุป Phase 1:** Phase นี้ test ผิด channel — ไม่ใช่ test product (ดู Channel Strategy)

#### Phase 2 (Target ที่ถูก) — Pending
**Channel:** ขายของออนไลน์ + Pantip + community ฟรีแลนซ์ที่ไม่ใช่หางาน

**Decision framework (ตัดสินจาก metric ไม่ใช่ความรู้สึก):**
- ⏰ **Timebox:** 1-2 สัปดาห์หลังเริ่มโพสต์ใน target channel ที่ถูก
- ✅ **ไปต่อ** ถ้า: มี active user ≥ 2 คน (อัปสลิป ≥ 2 วันต่างกัน) โดยไม่ต้อง push
- 🔄 **Pivot** ถ้า: มี user signup แต่ไม่ใช้ซ้ำ → ปรับ positioning/onboarding
- 🛑 **หยุด** ถ้า: 0 user หลัง 2 สัปดาห์ ใน 2-3 channel ที่ target ถูก → product ไม่มีตลาด

**หมายเหตุการอ่านเลข:** ตัวเลข returning users ที่ขึ้น 100% ในช่วง dogfooding (user น้อย/รู้จักกัน) ไม่ใช่ signal จริง รอ user แปลกหน้าเข้ามาก่อน ค่อยอ่านจริงจัง

---

## Known Issues

### General
- **Typhoon OCR free tier latency** — shared compute เหวี่ยงมาก ปกติ 2-10 วิ แต่ช่วง peak อาจถึง 2+ นาที (โดยเฉพาะช่วงเย็นไทย) — ไม่มีทางแก้ที่ free tier paid option คือ self-host บน RunPod หรือเปลี่ยน OCR provider
- **Resize Image ยังขยายรูปเล็กบางใบ** — "Only if Larger" + re-encode เป็น JPEG ทำให้รูปที่เล็กกว่า 1800px บวมขึ้นเล็กน้อย (60-70%) เป็น known trade-off ยังไม่แก้
- n8n env access (`$env.*`) ขึ้น `[ERROR: access to env vars denied]` แม้ตั้ง flag — workaround: ใส่ค่าตรงใน node

### Infrastructure
- Railway ต่อ Supabase ผ่าน direct connection ไม่ได้ (IPv6) → ต้องใช้ pooler เท่านั้น
- SSL cert ของ Supabase pooler เป็น self-signed → SSL mode = Allow/Disable
- `WEBHOOK_URL` ถ้ามี `/webhook` ต่อท้ายจะทำให้ path ซ้อน

### Stripe
- n8n HTTP node ส่ง metadata fields เป็น hash → Stripe reject → workaround: ใช้ `client_reference_id`
- n8n ไม่เก็บ rawBody → verify Stripe signature ใน n8n ไม่ได้ → ต้องผ่าน Next.js

### LIFF / Account Linking
- Connect LINE จาก web user ที่เคยใช้ LIFF → ติด 409 เพราะ LINE account ซ้ำใน DB
- Magic Link มีอายุ 1 ชั่วโมง
- Magic link redirect แสดง `#access_token=...` ใน URL → clear hash หลัง checkSession()
- LIFF fetchAll: `/me` หรือ `/history` ที่ return non-JSON body → `.json()` throw → เข้า catch → โชว์ error ทั้งที่ไม่ใช่ network fail จริง — แก้ด้วย `Promise.allSettled` + `.json().catch(() => null)` หรือเปลี่ยน error message ให้ชัดว่าเป็น network

### LINE Messaging API
- Reply token ใช้ได้ครั้งเดียว หมดอายุใน 1 นาที → ใช้ Push API (`/v2/bot/message/push`) แทน
- LINE batch หลาย events ใน 1 webhook → ต้อง Loop Over Items process ทีละ event
- OA Manager Rich Menu ไม่สามารถ switch ด้วย API ได้ → ต้องสร้างทุกตัวผ่าน Messaging API
- **Follow event** trigger ทุก node ก่อน Loop เหมือนกับ message event → node ที่ทำงานเฉพาะกับ image (เช่น Notify Processing) ต้อง guard ด้วย `status === 'image'` เอง

### n8n Quirks (ที่เคยหลอกแล้วเสียเวลา)
- **Merge node default mode = combine** — รอครบ 2 inputs ก่อน output → ถ้าใช้ branch ที่มีแค่ฝั่งเดียวมา จะค้างตลอดกาล → ตั้ง mode = `append`
- **HTTP Request node** (เช่น Switch Rich Menu) คืน response ของ API ที่ยิงไป ไม่ใช่ data ก่อนหน้า → ถ้าจะใช้ data เดิมต่อ ต้องมี Code node ดึง `$('PreviousNode').first().json` กลับมา
- **Postgres node** ตอน query ไม่เจอ row คืน 1 item เป็น `{}` ไม่ใช่ `[]` → `$input.all().length` หลอกว่ามี 1 row → ต้อง filter `r.id != null`
- **Always Output Data** ปิดโดย default → node ที่ return empty จะทำให้ทั้ง flow หยุดเงียบๆ (ไม่ throw error)

---

## Parse Prompt Rules (Typhoon Parse v11)

Parse prompt ปัจจุบัน (v11) มี logic สำคัญดังนี้:

**receiver_name priority:**
1. ถ้ามีชื่อบุคคล (นาย/นาง/นางสาว หรือ ชื่อ-นามสกุล) → ใช้ชื่อบุคคลก่อนเสมอ แม้จะมี platform name ด้วย
2. ถ้าไม่มีชื่อบุคคล → ใช้ชื่อ platform/ร้านค้า (เดียวกับ bank_to)

**bank_from / bank_to — ใช้ ↓ เป็น separator:**
- เหนือ ↓ = ต้นทาง → bank_from
- ใต้ ↓ = ปลายทาง → bank_to
- ใช้ ↓ เสมอ แม้ชื่อ/ธนาคารจะซ้ำกัน (เช่น โอนหาตัวเอง)

**Blacklist แอปผู้ออกสลิป (ห้ามเป็น bank_to):**
`"K+", "SCB Easy", "KMA", "Krungthai NEXT", "Bangkok Bank Mobile", "KTB netbank", "GSB netbank"`

**amount — edge case เลขล้นบรรทัด:**
- ถ้าเห็นเลขสั้น 1-3 หลักใต้ "จำนวน:" ไม่มีหน่วยบาท → คือส่วนท้ายของเลขรายการที่ล้นบรรทัด
- ให้มองข้ามแล้วหา ตัวเลข+บาท บรรทัดถัดไปแทน
- ตัวอย่าง: `"จำนวน:\n6\nค่าธรรมเนียม:\n25.00 บาท"` → amount = "25.00" (ไม่ใช่ 6)

**Fields ที่ถูกตัดออกแล้ว (ไม่มีใน prompt/response):**
`is_authentic`, `suspicious_signs`, `reject_reason` — เกณฑ์ตรวจสลิปปลอมจาก text ไม่มีประสิทธิภาพ สร้าง false positive บ่อย

**Parse Result node — logic:**
- `!is_slip` → error: not_a_slip (ไม่ตัด credit)
- `!amount` → error: parse_failed (ไม่ตัด credit)
- `confidence === 'low'` → ผ่านได้ (ไม่ reject แล้ว — สลิปจริงบางใบ low confidence)
- credit ถูกตัด **หลัง OCR+Parse สำเร็จเท่านั้น**

---



### `gm identify: No decode delegate for this image format`
- ต้นเหตุ: user อัปไฟล์ที่ไม่ใช่รูปจริง (ปลอม mime type เป็น image/jpeg แต่ข้างใน 60 bytes หรือ format ไม่รองรับ)
- แก้ด้วย **Validate Upload node** ก่อน Resize: เช็ค `buffer.length >= 1024` + mime type whitelist
- Web frontend ก็ validate ก่อนส่งแล้ว (`file.size >= 1024 && allowed.includes(file.type)`)
- HEIC จาก iPhone: LINE compress เป็น JPEG ก่อนส่งอัตโนมัติ แต่ web อาจเจอ HEIC โดยตรง → กันด้วย type whitelist

### LIFF แสดง "เชื่อมต่อไม่ได้" หรือ "-" credits ตอนเปิดครั้งแรก
- ต้นเหตุ 1: `useEffect` ใช้ `accessToken` เป็น dependency แต่ไม่ได้เช็ค `liffReady` → fetch ยิงก่อน LIFF ready → fail
- ต้นเหตุ 2: user ใหม่ยังไม่มีบัญชี → Auth Module คืน non-ok → credits ยัง null → แสดง "-"
- แก้: `if (!accessToken || !liffReady) return` + handle `meRes.status === 401/403/404` → `setCredits(0)` แทนแสดง error

### Query Receipts error: `invalid input syntax for type uuid: "undefined"`
- ต้นเหตุ 1: Auth Module ส่ง user_id กลับเป็น `undefined` → Postgres parse `'undefined'::uuid` แล้วพัง (Liff API)
- ต้นเหตุ 2: Merge node ใน Auth Module ค้าง (default mode = combine รอครบ 2 inputs)
- แก้ Liff API: `WHERE user_id = NULLIF('{{ $json.user_id }}', 'undefined')::uuid`
- แก้ Auth Module: Merge mode = `append`

### Notify Processing ส่งข้อความ "กำลังอ่านข้อมูล" ให้ user ใหม่ที่ยังไม่ได้สมัคร
- ต้นเหตุ: Notify Processing รันก่อน Check User & Credits → ไม่รู้ว่า user มีบัญชีหรือเปล่า
- แก้: เพิ่ม SELECT users ก่อนส่ง push message ถ้าไม่เจอ user → return items ทันทีโดยไม่ส่ง


แก้ `WEBHOOK_URL` ใน Railway ให้เป็น `https://xxx.railway.app` (ไม่มี `/webhook` ต่อท้าย)

### Stripe error: metadata hash
ใช้ `client_reference_id = "user_id|plan"` แทน metadata

### Stripe error: "Module 'crypto' is disallowed"
เพิ่ม env var: `NODE_FUNCTION_ALLOW_BUILTIN=crypto` แล้ว restart Railway

### Auth Module return "unauthorized: invalid line token"
- LINE access token หมดอายุ (default 30 วัน)
- LIFF channel ผิด — ตรวจ `NEXT_PUBLIC_LIFF_ID`

### LINE Message Webhook หยุดกลางทาง (ไม่มี output)
- Get User node ไม่มี Always Output Data → เปิด Settings → Always Output Data → ON

### LINE Reply token ไม่ work
- Reply token หมดอายุหรือถูกใช้แล้ว → เปลี่ยนเป็น Push API ใช้ `line_user_id` แทน

### Query Receipts error: `invalid input syntax for type uuid: "undefined"`
- ต้นเหตุ: Auth Module ส่ง user_id กลับเป็น `undefined` → Postgres parse `'undefined'::uuid` แล้วพัง
- เกิดเพราะ Merge node ใน Auth Module ค้าง (default mode = combine รอครบ 2 inputs) หรือ Switch Rich Menu ส่ง LINE API response ทับ user data
- แก้: เปลี่ยน Merge mode = `append` + เพิ่ม Pass Line Data node คั่นหลัง Switch Rich Menu

### LINE OA ส่ง "กำลังอ่านข้อมูล" ทั้งที่ user ยังไม่ได้อัป
- เกิดตอน user เก่า follow OA ซ้ำ → follow event เข้า Notify Processing → มันส่ง notify เพราะหา line_user_id เจอ
- แก้: filter ด้วย `status === 'image'` ใน Notify Processing:
  ```javascript
  const lineUserId = items.find(
    i => i.json.status === 'image' && i.json.line_user_id
  )?.json.line_user_id;
  ```

### /history แสดง count = 1 ทั้งที่ user ยังไม่มีสลิป
- Postgres node คืน 1 item เป็น `{}` ตอน query ไม่เจอ — ไม่ใช่ `[]`
- แก้ใน Format /history Response code:
  ```javascript
  const receipts = $input.all()
    .map(item => item.json)
    .filter(r => r.id != null)
  ```

### Connect LINE ติด 409
- LINE account นั้นผูกกับ user อื่นใน DB แล้ว
- Workaround: ใช้ Magic Link จาก LIFF เพื่อเข้า web เป็น user เดียวกัน

### `[ERROR: access to env vars denied]` ใน n8n
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` ยังไม่ work — workaround: ใส่ค่าตรงใน node

### Retool stat cards ขึ้น 0 ทั้งหมด
- ตรวจสอบ `runWhenPageLoads` ของ query `getStats` — ต้องเป็น `true` ไม่งั้นต้องกด Refresh ทุกครั้ง

### Retool query error: "trailing junk after numeric literal at or near '494c'"
- UUID ใน `{{ }}` ไม่มี single quote ครอบ → Postgres อ่าน UUID เป็น arithmetic แล้วพัง
- แก้: `WHERE user_id = '{{ table.selectedSourceRow.user_id }}'` (ใส่ `'...'` เสมอ)

### Railway postgres-volume เต็ม / High Volume Usage alert
1. เช็คว่าตารางไหนกินพื้นที่ (รัน query ด้านบนใน Database → Query tab)
2. ถ้า `execution_data` ใหญ่ที่สุด → เป็น n8n execution log สะสม ลบได้ปลอดภัย
3. TRUNCATE แล้ว alert ยังขึ้นอยู่ชั่วคราว → Railway dashboard อัปเดตช้า รอสักพัก
4. ตั้ง `EXECUTIONS_DATA_PRUNE=true` ใน n8n env กันบวมซ้ำ

### Railway Dashboard แสดง Estimated Bill ตั้งแต่ต้นรอบ
- Estimated Bill ≠ ใช้ไปแล้ว — มันคือ **คาดการณ์ทั้งรอบ**
- ดูที่ "Current Usage" แทน ตัวนั้นคือที่ใช้จริง
- ถ้า Current Usage = $0.00 แต่ Estimated Bill = $5.25 = ปกติ (idle ทั้งเดือนประมาณ $5)
