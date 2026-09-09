(() => {
  "use strict";

  let deferredInstallPrompt = null;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
           window.navigator.standalone === true;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .catch(error => console.warn("PWA service worker registration failed:", error));
    });
  }

  function createInstallUI() {
    if (isStandalone() || document.getElementById("pwaInstallPrompt")) return;

    const style = document.createElement("style");
    style.textContent = `
      #pwaInstallPrompt {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: calc(84px + env(safe-area-inset-bottom));
        z-index: 99999;
        display: none;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        border: 1px solid rgba(5,150,105,.18);
        border-radius: 16px;
        background: rgba(255,255,255,.96);
        box-shadow: 0 14px 40px rgba(15,23,42,.16);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        font-family: inherit;
      }
      #pwaInstallPrompt.show { display: flex; }
      #pwaInstallPrompt .pwa-icon {
        width: 42px; height: 42px; flex: 0 0 42px;
        display: grid; place-items: center;
        border-radius: 12px;
        background: #ECFDF5;
        color: #064E3B;
        font-size: 21px;
      }
      #pwaInstallPrompt .pwa-copy { min-width: 0; flex: 1; }
      #pwaInstallPrompt .pwa-title {
        margin: 0 0 2px;
        color: #0F172A;
        font-size: 14px;
        font-weight: 800;
      }
      #pwaInstallPrompt .pwa-text {
        margin: 0;
        color: #64748B;
        font-size: 12px;
        line-height: 1.45;
      }
      #pwaInstallPrompt button {
        border: 0;
        min-height: 38px;
        padding: 0 13px;
        border-radius: 10px;
        background: #059669;
        color: #fff;
        font: inherit;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
      }
      #pwaInstallPrompt .pwa-close {
        min-height: 34px;
        width: 34px;
        padding: 0;
        border-radius: 9px;
        background: #F1F5F9;
        color: #475569;
      }
      @media (min-width: 769px) {
        #pwaInstallPrompt { left: auto; width: 390px; right: 24px; bottom: 24px; }
      }
      @media (max-width: 380px) {
        #pwaInstallPrompt { left: 10px; right: 10px; bottom: calc(78px + env(safe-area-inset-bottom)); }
        #pwaInstallPrompt button { padding: 0 10px; }
      }
    `;
    document.head.appendChild(style);

    const box = document.createElement("div");
    box.id = "pwaInstallPrompt";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "আমাদের এলাকা অ্যাপ ইনস্টল");
    box.innerHTML = `
      <div class="pwa-icon" aria-hidden="true">📱</div>
      <div class="pwa-copy">
        <p class="pwa-title">আমাদের এলাকা অ্যাপ ইনস্টল করুন</p>
        <p class="pwa-text">হোম স্ক্রিন থেকে দ্রুত ব্যবহার করুন।</p>
      </div>
      <button type="button" id="pwaInstallButton">ইনস্টল</button>
      <button type="button" class="pwa-close" id="pwaInstallClose" aria-label="বন্ধ করুন">×</button>
    `;
    document.body.appendChild(box);

    document.getElementById("pwaInstallButton").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const result = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      box.classList.remove("show");
      if (result.outcome === "accepted") {
        console.info("PWA install accepted");
      }
    });

    document.getElementById("pwaInstallClose").addEventListener("click", () => {
      box.classList.remove("show");
      sessionStorage.setItem("pwaInstallDismissed", "1");
    });
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;

    if (sessionStorage.getItem("pwaInstallDismissed") === "1") return;

    createInstallUI();
    requestAnimationFrame(() => {
      const box = document.getElementById("pwaInstallPrompt");
      if (box) box.classList.add("show");
    });
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const box = document.getElementById("pwaInstallPrompt");
    if (box) box.classList.remove("show");
  });

  registerServiceWorker();
})();
