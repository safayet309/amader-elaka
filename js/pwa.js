// =====================================
// Amader Elaka - PWA JavaScript
// Custom Install Prompt + Service Worker
// =====================================

(() => {
    "use strict";

    // =====================================
    // Configuration
    // =====================================

    const SERVICE_WORKER_PATH = "./service-worker.js";

    let deferredInstallPrompt = null;
    let installBanner = null;
    let isReloading = false;


    // =====================================
    // Service Worker Registration
    // =====================================

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            console.info(
                "Amader Elaka PWA: Service Worker is not supported."
            );
            return;
        }

        window.addEventListener("load", async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        SERVICE_WORKER_PATH,
                        {
                            scope: "./"
                        }
                    );

                console.info(
                    "Amader Elaka PWA: Service Worker registered.",
                    registration.scope
                );

                setupServiceWorkerUpdates(registration);

            } catch (error) {
                console.warn(
                    "Amader Elaka PWA: Service Worker registration failed.",
                    error
                );
            }
        });
    }


    // =====================================
    // Service Worker Updates
    // =====================================

    function setupServiceWorkerUpdates(registration) {
        if (!registration) return;

        // Check for updates every 60 minutes
        setInterval(() => {
            registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        registration.addEventListener(
            "updatefound",
            () => {
                const newWorker = registration.installing;

                if (!newWorker) return;

                newWorker.addEventListener(
                    "statechange",
                    () => {
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            console.info(
                                "Amader Elaka PWA: New version available."
                            );
                        }
                    }
                );
            }
        );
    }


    // =====================================
    // Controller Change
    // =====================================

    function handleControllerChange() {
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
                if (isReloading) return;

                isReloading = true;

                window.location.reload();
            }
        );
    }


    // =====================================
    // Network Status
    // =====================================

    function setupNetworkStatus() {
        const updateNetworkStatus = () => {
            document.documentElement.classList.toggle(
                "is-offline",
                !navigator.onLine
            );

            document.documentElement.classList.toggle(
                "is-online",
                navigator.onLine
            );
        };

        updateNetworkStatus();

        window.addEventListener(
            "online",
            updateNetworkStatus
        );

        window.addEventListener(
            "offline",
            updateNetworkStatus
        );
    }


    // =====================================
    // Check Installed State
    // =====================================

    function isAppInstalled() {
        // Android / Chrome / Edge
        if (
            window.matchMedia &&
            window.matchMedia(
                "(display-mode: standalone)"
            ).matches
        ) {
            return true;
        }

        // iPhone / iPad Safari
        if (window.navigator.standalone === true) {
            return true;
        }

        return false;
    }


    // =====================================
    // Install Banner CSS
    // =====================================

    function injectInstallStyles() {
        if (
            document.getElementById(
                "amaderElakaInstallStyles"
            )
        ) {
            return;
        }

        const style = document.createElement("style");

        style.id = "amaderElakaInstallStyles";

        style.textContent = `
            #amaderElakaInstallBanner {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 99999;

                width: min(
                    370px,
                    calc(100vw - 30px)
                );

                padding: 17px;

                display: flex;
                align-items: center;
                gap: 13px;

                background: rgba(255,255,255,.97);

                border: 1px solid #dce7e1;
                border-radius: 17px;

                box-shadow:
                    0 18px 50px rgba(15,23,42,.16),
                    0 4px 15px rgba(15,23,42,.07);

                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);

                transform:
                    translateY(30px)
                    scale(.96);

                opacity: 0;

                animation:
                    amaderInstallIn
                    .45s cubic-bezier(
                        .34,
                        1.56,
                        .64,
                        1
                    )
                    forwards;

                font-family:
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    "Noto Sans Bengali",
                    Arial,
                    sans-serif;
            }

            #amaderElakaInstallBanner
            .amader-install-icon {
                width: 48px;
                height: 48px;

                flex: 0 0 48px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 13px;

                background:
                    linear-gradient(
                        135deg,
                        #166534,
                        #0f5132
                    );

                color: #fff;

                font-size: 22px;

                box-shadow:
                    0 7px 18px
                    rgba(22,101,52,.24);
            }

            #amaderElakaInstallBanner
            .amader-install-content {
                min-width: 0;
                flex: 1;
            }

            #amaderElakaInstallBanner
            .amader-install-title {
                margin: 0;

                color: #123b2b;

                font-size: 15px;
                font-weight: 750;

                line-height: 1.45;
            }

            #amaderElakaInstallBanner
            .amader-install-text {
                margin: 3px 0 0;

                color: #64748b;

                font-size: 12.5px;
                line-height: 1.5;
            }

            #amaderElakaInstallBanner
            .amader-install-actions {
                display: flex;
                align-items: center;
                gap: 7px;

                margin-top: 10px;
            }

            #amaderElakaInstallBanner
            .amader-install-button {
                border: 0;
                border-radius: 9px;

                padding: 8px 14px;

                background:
                    linear-gradient(
                        135deg,
                        #1a7a3e,
                        #166534
                    );

                color: #fff;

                font-size: 12.5px;
                font-weight: 700;

                cursor: pointer;

                box-shadow:
                    0 5px 14px
                    rgba(22,101,52,.22);

                transition:
                    transform .2s ease,
                    box-shadow .2s ease;
            }

            #amaderElakaInstallBanner
            .amader-install-button:hover {
                transform: translateY(-1px);

                box-shadow:
                    0 8px 18px
                    rgba(22,101,52,.28);
            }

            #amaderElakaInstallBanner
            .amader-install-button:active {
                transform: scale(.96);
            }

            #amaderElakaInstallBanner
            .amader-install-close {
                border: 1px solid #e5e7eb;

                width: 34px;
                height: 34px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 9px;

                background: #fff;
                color: #64748b;

                font-size: 18px;

                cursor: pointer;

                transition:
                    background .2s ease,
                    color .2s ease,
                    border-color .2s ease;
            }

            #amaderElakaInstallBanner
            .amader-install-close:hover {
                background: #f8fafc;
                color: #111827;
                border-color: #d1d5db;
            }

            @keyframes amaderInstallIn {
                from {
                    opacity: 0;

                    transform:
                        translateY(30px)
                        scale(.96);
                }

                to {
                    opacity: 1;

                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @keyframes amaderInstallOut {
                from {
                    opacity: 1;

                    transform:
                        translateY(0)
                        scale(1);
                }

                to {
                    opacity: 0;

                    transform:
                        translateY(25px)
                        scale(.96);
                }
            }

            #amaderElakaInstallBanner.amader-install-closing {
                animation:
                    amaderInstallOut
                    .25s ease
                    forwards;
            }

            @media (max-width: 600px) {
                #amaderElakaInstallBanner {
                    right: 15px;
                    bottom: 15px;

                    width:
                        calc(100vw - 30px);

                    padding: 15px;

                    border-radius: 15px;
                }

                #amaderElakaInstallBanner
                .amader-install-icon {
                    width: 44px;
                    height: 44px;
                    flex-basis: 44px;

                    font-size: 20px;
                }

                #amaderElakaInstallBanner
                .amader-install-title {
                    font-size: 14px;
                }

                #amaderElakaInstallBanner
                .amader-install-text {
                    font-size: 12px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #amaderElakaInstallBanner {
                    animation: none;

                    opacity: 1;

                    transform: none;
                }
            }
        `;

        document.head.appendChild(style);
    }


    // =====================================
    // Create Install Banner
    // =====================================

    function createInstallBanner() {
        if (installBanner) return;

        if (isAppInstalled()) {
            return;
        }

        injectInstallStyles();

        installBanner =
            document.createElement("div");

        installBanner.id =
            "amaderElakaInstallBanner";

        installBanner.setAttribute(
            "role",
            "dialog"
        );

        installBanner.setAttribute(
            "aria-label",
            "আমাদের এলাকা অ্যাপ ইনস্টল"
        );

        installBanner.innerHTML = `
            <div
                class="amader-install-icon"
                aria-hidden="true"
            >
                📱
            </div>

            <div
                class="amader-install-content"
            >
                <p
                    class="amader-install-title"
                >
                    আমাদের এলাকা App হিসেবে Install করুন
                </p>

                <p
                    class="amader-install-text"
                >
                    দ্রুত ব্যবহার করতে আপনার ডিভাইসে অ্যাপটি যোগ করুন।
                </p>

                <div
                    class="amader-install-actions"
                >
                    <button
                        type="button"
                        class="amader-install-button"
                        id="amaderInstallButton"
                    >
                        Install করুন
                    </button>

                    <button
                        type="button"
                        class="amader-install-close"
                        id="amaderInstallClose"
                        aria-label="বন্ধ করুন"
                    >
                        ×
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            installBanner
        );


        // Install button
        const installButton =
            document.getElementById(
                "amaderInstallButton"
            );

        if (installButton) {
            installButton.addEventListener(
                "click",
                installPWA
            );
        }


        // Close button
        const closeButton =
            document.getElementById(
                "amaderInstallClose"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeInstallBanner
            );
        }
    }


    // =====================================
    // Close Install Banner
    // =====================================

    function closeInstallBanner() {
        if (!installBanner) return;

        installBanner.classList.add(
            "amader-install-closing"
        );

        setTimeout(() => {
            if (installBanner) {
                installBanner.remove();
                installBanner = null;
            }
        }, 250);
    }


    // =====================================
    // Install PWA
    // =====================================

    async function installPWA() {
        if (!deferredInstallPrompt) {
            console.info(
                "Amader Elaka PWA: Install prompt is not available."
            );

            return;
        }

        try {
            // Show real browser install dialog
            deferredInstallPrompt.prompt();

            const result =
                await deferredInstallPrompt.userChoice;

            console.info(
                "Amader Elaka PWA install result:",
                result.outcome
            );

            // Prompt can only be used once
            deferredInstallPrompt = null;

            closeInstallBanner();

        } catch (error) {
            console.warn(
                "Amader Elaka PWA install failed:",
                error
            );
        }
    }


    // =====================================
    // Capture Browser Install Prompt
    // =====================================

    function setupInstallPrompt() {

        // Chrome / Edge / Android
        window.addEventListener(
            "beforeinstallprompt",
            (event) => {

                // Stop browser's automatic mini-infobar
                event.preventDefault();

                // Save real install event
                deferredInstallPrompt = event;

                console.info(
                    "Amader Elaka PWA: Install prompt available."
                );

                // Do not show if already installed
                if (isAppInstalled()) {
                    return;
                }

                // Small delay for better UX
                setTimeout(() => {
                    createInstallBanner();
                }, 900);
            }
        );


        // App successfully installed
        window.addEventListener(
            "appinstalled",
            () => {

                console.info(
                    "Amader Elaka PWA: App installed successfully."
                );

                deferredInstallPrompt = null;

                closeInstallBanner();
            }
        );
    }


    // =====================================
    // Handle Page Visibility
    // =====================================

    function setupDisplayModeListener() {
        if (!window.matchMedia) return;

        const standaloneQuery =
            window.matchMedia(
                "(display-mode: standalone)"
            );

        const handleChange = () => {
            if (standaloneQuery.matches) {
                closeInstallBanner();
            }
        };

        if (
            typeof standaloneQuery.addEventListener ===
            "function"
        ) {
            standaloneQuery.addEventListener(
                "change",
                handleChange
            );
        }
    }


    // =====================================
    // Initialize PWA
    // =====================================

    function initPWA() {
        registerServiceWorker();

        handleControllerChange();

        setupNetworkStatus();

        setupInstallPrompt();

        setupDisplayModeListener();
    }


    // =====================================
    // Start
    // =====================================

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initPWA,
            { once: true }
        );
    } else {
        initPWA();
    }

})();
