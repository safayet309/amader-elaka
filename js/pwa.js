// =====================================
// Amader Elaka - PWA JavaScript
// =====================================

(() => {
    "use strict";

    // -------------------------------------
    // PWA Configuration
    // -------------------------------------

    const SERVICE_WORKER_PATH = "./service-worker.js";


    // -------------------------------------
    // Register Service Worker
    // -------------------------------------

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            console.info("Service Worker is not supported by this browser.");
            return;
        }

        window.addEventListener("load", async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(SERVICE_WORKER_PATH);

                console.info(
                    "Amader Elaka PWA: Service Worker registered successfully.",
                    registration.scope
                );

                // Check for updates periodically
                setupServiceWorkerUpdates(registration);

            } catch (error) {
                console.warn(
                    "Amader Elaka PWA: Service Worker registration failed.",
                    error
                );
            }
        });
    }


    // -------------------------------------
    // Service Worker Update Check
    // -------------------------------------

    function setupServiceWorkerUpdates(registration) {
        if (!registration) return;

        // Check for a new service worker every 60 minutes
        setInterval(() => {
            registration.update().catch(() => {
                // Ignore update errors silently
            });
        }, 60 * 60 * 1000);

        // Detect a new service worker
        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
                if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                ) {
                    console.info(
                        "Amader Elaka PWA: A new version is available."
                    );
                }
            });
        });
    }


    // -------------------------------------
    // Handle Controller Changes
    // -------------------------------------

    function handleControllerChange() {
        if (!("serviceWorker" in navigator)) return;

        let refreshing = false;

        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
                if (refreshing) return;

                refreshing = true;

                // Reload once when a new service worker takes control
                window.location.reload();
            }
        );
    }


    // -------------------------------------
    // Online / Offline Status
    // -------------------------------------

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

        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);
    }


    // -------------------------------------
    // Initialize PWA
    // -------------------------------------

    function initPWA() {
        registerServiceWorker();
        handleControllerChange();
        setupNetworkStatus();
    }


    // -------------------------------------
    // Start
    // -------------------------------------

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPWA);
    } else {
        initPWA();
    }

})();
