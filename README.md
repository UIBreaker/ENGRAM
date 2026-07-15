<div align="center">

<img src="https://raw.githubusercontent.com/UIBreaker/ENGRAM/main/public/icon-192.png" width="80" alt="ENGRAM Logo" />

# ENGRAM

**English + Memorize** — Ứng dụng học từ vựng tiếng Anh thông minh

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[🚀 Demo Live](#) · [📖 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng) · [⚙️ Cài đặt](#%EF%B8%8F-cài-đặt-và-chạy)

</div>

---

## ✨ Giới thiệu

**ENGRAM** là ứng dụng web học từ vựng tiếng Anh cá nhân, được thiết kế theo triết lý:

> *Biến những gì bạn đọc, nghe, thấy hàng ngày thành kiến thức của riêng bạn — một cách nhanh nhất.*

Ứng dụng kết hợp **thuật toán lặp lại có khoảng cách (Spaced Repetition)**, **hình ảnh minh họa trực quan**, và **AI phân tích bài viết** để tạo ra vòng lặp học tập hiệu quả nhất.

### Tại sao chọn ENGRAM?

| Tính năng | Lợi ích |
|---|---|
| 🃏 Flashcard + hình ảnh | Ghi nhớ từ qua hình ảnh trực quan, không chỉ chữ |
| 🧠 Spaced Repetition (SM-2) | Ôn đúng lúc — không quá sớm, không quá muộn |
| ✍️ AI Writing Corner | Viết nhật ký tiếng Anh, AI sửa lỗi tức thì |
| ☁️ Supabase Cloud | Đồng bộ dữ liệu mọi thiết bị, không mất khi xóa cache |
| 📱 Mobile-first | Tối ưu cho điện thoại — học mọi lúc mọi nơi |

---

## 🖥️ Giao diện

<table>
<tr>
<td><b>Dashboard</b> — Tổng quan tiến độ</td>
<td><b>Kho từ vựng</b> — Quản lý từ</td>
</tr>
<tr>
<td><b>Flashcard</b> — Ôn tập có ảnh</td>
<td><b>Writing Corner</b> — AI phân tích</td>
</tr>
</table>

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- **Styling**: Vanilla CSS với Design System "Aurora"
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Charts**: [Recharts](https://recharts.org)
- **Icons**: [Lucide React](https://lucide.dev)

---

## ⚙️ Cài đặt và chạy

### Yêu cầu

- [Node.js](https://nodejs.org) >= 18
- [npm](https://npmjs.com) >= 9
- Tài khoản [Supabase](https://supabase.com) (miễn phí)

### Bước 1 — Clone repository

```bash
git clone https://github.com/UIBreaker/ENGRAM.git
cd ENGRAM
```

### Bước 2 — Cài đặt dependencies

```bash
npm install
```

### Bước 3 — Tạo Supabase Project

1. Vào **[supabase.com](https://supabase.com)** → Tạo project mới
2. Vào **SQL Editor** → Chạy script tạo bảng:

```sql
CREATE TABLE IF NOT EXISTS words (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word          TEXT NOT NULL,
  phonetics     TEXT DEFAULT '',
  meaning       TEXT NOT NULL,
  example       TEXT DEFAULT '',
  topic         TEXT NOT NULL DEFAULT 'Khác',
  difficulty    INTEGER DEFAULT 0,
  next_review   TIMESTAMPTZ DEFAULT NOW(),
  last_review   TIMESTAMPTZ,
  review_count  INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  ai_feedback TEXT,
  word_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL UNIQUE,
  words_studied INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE words           ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON words           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON study_sessions  FOR ALL USING (true) WITH CHECK (true);
```

3. Vào **Settings → API** → Copy **Project URL** và **anon key**

### Bước 4 — Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Bước 5 — Chạy ứng dụng

```bash
npm run dev
```

Mở **[http://localhost:3000](http://localhost:3000)** — ứng dụng sẽ tự động seed dữ liệu mẫu vào lần đầu chạy.

---

## 📖 Hướng dẫn sử dụng

### 🏠 Dashboard (Trang chủ)

- Xem **streak** học tập hàng ngày (vòng tròn lửa)
- Kiểm tra **số từ cần ôn** hôm nay
- Xem **biểu đồ tiến độ** 7 ngày gần nhất
- Danh sách **từ hay quên nhất** để tập trung ôn

### 📚 Kho từ vựng

**Thêm từ mới:**
1. Bấm nút **"Thêm từ"** (góc trên phải)
2. Điền: từ tiếng Anh, phiên âm, nghĩa tiếng Việt, câu ví dụ
3. Chọn **chủ đề**: Công việc / Lập trình / Đời sống / Du lịch / Học thuật / Khác
4. *(Tùy chọn)* Thêm **URL ảnh** để hiển thị trên flashcard. Nếu để trống, ảnh sẽ tự động tìm trên Unsplash
5. Bấm **"Thêm vào kho từ vựng"**

**Quản lý từ:**
- Click vào hàng bất kỳ để xem chi tiết, chỉnh sửa hoặc xóa
- Dùng thanh **tìm kiếm** để lọc theo tên/nghĩa
- Lọc theo **chủ đề** bằng nút "Lọc chủ đề"
- **Sắp xếp** theo tên, mức độ hoặc ngày thêm

### 🃏 Flashcard — Phòng ôn tập

**Cách dùng:**
1. Bấm vào thẻ (hoặc nhấn `Space`) để **lật xem nghĩa + hình ảnh**
2. Đánh giá mức độ nhớ:
   - ❌ **Quên** — Ôn lại sau 1 ngày
   - ⚡ **Tạm nhớ** — Ôn lại sau 3 ngày
   - ✅ **Rất thuộc** — Ôn lại sau 7 ngày

**Phím tắt (Desktop):**
| Phím | Hành động |
|---|---|
| `Space` | Lật thẻ |
| `1` | Đánh dấu Quên |
| `2` | Đánh dấu Tạm nhớ |
| `3` | Đánh dấu Rất thuộc |

**Trên Mobile:** Vuốt **trái** = Quên, vuốt **phải** = Rất thuộc

### ✍️ AI Writing Corner

1. Viết nhật ký tiếng Anh tự do vào ô soạn thảo (viết về ngày hôm nay, kế hoạch, suy nghĩ...)
2. Bấm **"Check bài bằng AI"**
3. AI sẽ phân tích và trả về:
   - Tổng số từ, câu
   - Các lỗi ngữ pháp phổ biến
   - Gợi ý từ vựng nâng cao
4. Lịch sử bài viết được lưu tự động

---

## 📁 Cấu trúc project

```
ENGRAM/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── vocabulary/       # Kho từ vựng
│   ├── flashcard/        # Phòng ôn tập
│   ├── writing/          # AI Writing Corner
│   ├── globals.css       # Design System "Aurora"
│   └── layout.tsx        # Root layout
├── components/
│   └── layout/
│       ├── Sidebar.tsx   # Navigation (Desktop)
│       ├── BottomNav.tsx # Navigation (Mobile)
│       └── ClientLayout.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── db.ts             # Data layer (CRUD async)
│   ├── storage.ts        # Legacy localStorage (tham khảo)
│   └── types.ts          # TypeScript interfaces
└── public/               # Assets
```

---

## 🗺️ Roadmap

- [ ] Xác thực người dùng (Supabase Auth) — mỗi người có data riêng
- [ ] Import từ vựng từ file CSV / Anki
- [ ] Chế độ học: Đánh máy từ / Multiple choice
- [ ] Thống kê nâng cao (heatmap, accuracy chart)
- [ ] PWA — cài đặt như app native trên điện thoại
- [ ] Tích hợp từ điển Oxford/Cambridge API

---

## 🤝 Đóng góp

Pull request luôn được chào đón! Để đóng góp:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m 'feat: thêm tính năng X'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

---

## 📄 License

MIT © [UIBreaker](https://github.com/UIBreaker)

---

<div align="center">
Made with ❤️ and ☕ — <i>15 phút mỗi ngày &gt; 2 tiếng một lần</i>
</div>
