// -------------------------------------
    // Install Prompt (Premium Banner)
    // -------------------------------------

    let deferredInstallPrompt = null;

    function injectInstallBannerStyles() {
        if (document.getElementById("ae-install-banner-styles")) return;

        const style = document.createElement("style");
        style.id = "ae-install-banner-styles";
        style.textContent = `
            #ae-install-banner {
                position: fixed;
                left: 16px;
                right: 16px;
                bottom: 16px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                background: #064E3B;
                color: #F8FAFC;
                border-radius: 14px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                font-family: inherit;
                max-width: 480px;
                margin: 0 auto;
                animation: ae-install-slide-up 0.3s ease-out;
            }
            @keyframes ae-install-slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #ae-install-banner p {
                margin: 0;
                font-size: 14px;
                flex: 1;
                line-height: 1.4;
            }
            #ae-install-banner button {
                border: none;
                border-radius: 8px;
                padding: 8px 14px;
                font-size: 13px;
                cursor: pointer;
                font-weight: 600;
            }
            #ae-install-banner .ae-install-btn {
                background: #F8FAFC;
                color: #064E3B;
            }
            #ae-install-banner .ae-dismiss-btn {
                background: transparent;
                color: #F8FAFC;
                opacity: 0.8;
                padding: 8px 10px;
            }
        `;
        document.head.appendChild(style);
    }

    function showInstallBanner() {
        if (!deferredInstallPrompt) return;
        if (document.getElementById("ae-install-banner")) return;

        injectInstallBannerStyles();

        const banner = document.createElement("div");
        banner.id = "ae-install-banner";
        banner.innerHTML = `
            <p>আমাদের এলাকা অ্যাপ হিসেবে ইনস্টল করুন — দ্রুত ও সহজে ব্যবহার করুন।</p>
            <button type="button" class="ae-install-btn">ইনস্টল</button>
            <button type="button" class="ae-dismiss-btn" aria-label="বন্ধ করুন">✕</button>
        `;

        document.body.appendChild(banner);

        banner
            .querySelector(".ae-install-btn")
            .addEventListener("click", async () => {
                hideInstallBanner();

                if (!deferredInstallPrompt) return;

                deferredInstallPrompt.prompt();
                const { outcome } = await deferredInstallPrompt.userChoice;

                console.info("Amader Elaka PWA: install prompt outcome:", outcome);
                deferredInstallPrompt = null;
            });

        banner
            .querySelector(".ae-dismiss-btn")
            .addEventListener("click", () => {
                hideInstallBanner();
                try {
                    sessionStorage.setItem("ae-install-dismissed", "1");
                } catch (e) {
                    // Ignore storage errors (private mode, etc.)
                }
            });
    }

    function hideInstallBanner() {
        const banner = document.getElementById("ae-install-banner");
        if (banner) banner.remove();
    }

    function setupInstallPrompt() {
        window.addEventListener("beforeinstallprompt", (event) => {
            event.preventDefault();
            deferredInstallPrompt = event;

            let dismissed = false;
            try {
                dismissed = sessionStorage.getItem("ae-install-dismissed") === "1";
            } catch (e) {
                // Ignore storage errors
            }

            if (!dismissed) {
                showInstallBanner();
            }
        });

        window.addEventListener("appinstalled", () => {
            deferredInstallPrompt = null;
            hideInstallBanner();
            console.info("Amader Elaka PWA: app installed successfully.");
        });
    }


    // -------------------------------------
    // Initialize PWA
    // -------------------------------------

    function initPWA() {
        registerServiceWorker();
        handleControllerChange();
        setupNetworkStatus();
        setupInstallPrompt();
    }
