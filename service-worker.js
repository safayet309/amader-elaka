আমাদের এলাকা — PWA Integration

নতুন ফাইল:
1. manifest.json
2. service-worker.js
3. js/pwa.js
4. icons/icon-192.png
5. icons/icon-512.png

প্রতিটি HTML page-এর <head>-এর ভিতরে যোগ করুন:
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#064E3B">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="icons/icon-192.png">

</head> এর ঠিক আগে/পরে নয়, <head> এর ভিতরে রাখলেই হবে।

</body> এর ঠিক আগে যোগ করুন:
<script src="js/pwa.js"></script>

এই 2টি integration snippet সব প্রধান page-এ দিন:
index.html
report.html
dashboard.html
government.html
admin.html (যদি admin-ও installable করতে চান)

নোট:
- HTTPS hosting প্রয়োজন; localhost-এ development-এ কাজ করবে।
- Browser install prompt নিজে সিদ্ধান্ত নেয়। pwa.js prompt event এলে premium install banner দেখায়।
- Supabase/API data offline-এ fake করা হবে না; live data-এর জন্য internet প্রয়োজন।
- service worker একই-origin static assets cache করবে এবং page navigation network-first রাখবে।
