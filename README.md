# Amader Elaka

**Amader Elaka** ওয়েবসাইটটি মূলত স্থানীয় এলাকার বিভিন্ন সমস্যা রিপোর্ট করার এবং প্রয়োজনীয় সরকারি তথ্য সহজে খুঁজে পাওয়ার একটি প্ল্যাটফর্ম। প্রজেক্টের সমস্ত ফাইল এই ওয়েবসাইটের কাজের সাথে সরাসরি যুক্ত।

## 🎯 Purpose (উদ্দেশ্য)
স্থানীয় এলাকার সমস্যা রিপোর্ট ও তথ্য দেখার ওয়েবসাইট।

## 📄 Pages (পেইজসমূহ)
* **`index.html`** - Homepage (ওয়েবসাইটের মূল পাতা)
* **`report.html`** - Report submission (সমস্যা রিপোর্ট করার পেজ)
* **`dashboard.html`** - Reports dashboard (জমাকৃত রিপোর্টের তালিকা দেখার পেজ)
* **`government.html`** - Government information (সরকারি সেবা ও তথ্যের পেজ)
* **`admin.html`** - Admin panel (ওয়েবসাইট নিয়ন্ত্রণের পেজ)

## ⚙️ Backend (ব্যাকএন্ড)
* **Supabase**

## 📜 Main JavaScript Files
* **`script.js`** - ওয়েবসাইটের মূল স্ক্রিপ্ট ও ক্যাশিং লজিক
* **`report.js`** - রিপোর্ট সাবমিশনের জন্য Supabase ইন্টিগ্রেশন
* **`dashboard.js`** - ড্যাশবোর্ডে রিপোর্ট ডেটা লোড ও দেখানোর কাজ
* **`government.js`** - সরকারি তথ্য ও ইমার্জেন্সি নম্বরের ফাংশনালিটি
* **`admin.js`** - অ্যাডমিন প্যানেলের ফাংশনালিটি
* **`location-data.js`** - লোকেশন বা এলাকার ডেটা পরিচালনা

## 📂 Project Structure (ফাইল স্ট্রাকচার)

    amader-elaka/
    ├── assets/
    │   └── parliament.jpg
    ├── css/
    │   ├── admin.css
    │   ├── dashboard.css
    │   ├── government.css
    │   ├── report.css
    │   └── style.css
    ├── images/
    │   └── slider/
    │       ├── .gitkeep
    │       ├── slide1.webp
    │       ├── slide2.webp
    │       ├── slide3.webp
    │       ├── slide4.webp
    │       ├── slide5.webp
    │       ├── slide6.webp
    │       ├── slide7.webp
    │       ├── slide8.webp
    │       ├── slide9.webp
    │       └── slide10.webp
    ├── js/
    │   ├── admin.js
    │   ├── dashboard.js
    │   ├── government.js
    │   ├── location-data.js
    │   ├── report.js
    │   ├── script.js
    │   └── supabase-config.js
    ├── admin.html
    ├── dashboard.html
    ├── government.html
    ├── index.html
    ├── report.html
    └── README.md
