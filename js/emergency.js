// =====================================
// Amader Elaka - Emergency JavaScript
// =====================================

(() => {
    "use strict";

    // -------------------------------------
    // DOM Elements
    // -------------------------------------

    const emergencyButton = document.querySelector(
        "#emergencyButton, .emergency-button"
    );

    const emergencyModal = document.getElementById("emergencyModal");

    const emergencyCloseButtons = document.querySelectorAll(
        "#emergencyModal .modal-close, " +
        "#emergencyModal .close-modal, " +
        "#emergencyModal [data-close-modal]"
    );


    // -------------------------------------
    // Open Emergency Modal
    // -------------------------------------

    function openEmergencyModal() {
        if (!emergencyModal) return;

        emergencyModal.classList.add("active");
        emergencyModal.classList.add("show");

        emergencyModal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

        // Prevent background scrolling
        document.body.style.overflow = "hidden";
    }


    // -------------------------------------
    // Close Emergency Modal
    // -------------------------------------

    function closeEmergencyModal() {
        if (!emergencyModal) return;

        emergencyModal.classList.remove("active");
        emergencyModal.classList.remove("show");

        emergencyModal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");

        // Restore scrolling
        document.body.style.overflow = "";
    }


    // -------------------------------------
    // Emergency Button
    // -------------------------------------

    function initEmergencyButton() {
        if (!emergencyButton) return;

        emergencyButton.setAttribute("role", "button");

        emergencyButton.addEventListener("click", (event) => {
            event.preventDefault();
            openEmergencyModal();
        });
    }


    // -------------------------------------
    // Close Buttons
    // -------------------------------------

    function initCloseButtons() {
        if (!emergencyCloseButtons.length) return;

        emergencyCloseButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                closeEmergencyModal();
            });
        });
    }


    // -------------------------------------
    // Close When Clicking Outside
    // -------------------------------------

    function initOutsideClick() {
        if (!emergencyModal) return;

        emergencyModal.addEventListener("click", (event) => {
            if (event.target === emergencyModal) {
                closeEmergencyModal();
            }
        });
    }


    // -------------------------------------
    // Close With Escape Key
    // -------------------------------------

    function initEscapeKey() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeEmergencyModal();
            }
        });
    }


    // -------------------------------------
    // Emergency Phone Links
    // -------------------------------------

    function initPhoneLinks() {
        const phoneLinks = document.querySelectorAll(
            '#emergencyModal a[href^="tel:"]'
        );

        phoneLinks.forEach((link) => {
            link.addEventListener("click", () => {
                link.classList.add("phone-called");

                setTimeout(() => {
                    link.classList.remove("phone-called");
                }, 500);
            });
        });
    }


    // -------------------------------------
    // Accessibility
    // -------------------------------------

    function initAccessibility() {
        if (!emergencyModal) return;

        if (!emergencyModal.hasAttribute("aria-hidden")) {
            emergencyModal.setAttribute("aria-hidden", "true");
        }

        if (emergencyButton) {
            emergencyButton.setAttribute(
                "aria-haspopup",
                "dialog"
            );
        }

        const modalRole = emergencyModal.getAttribute("role");

        if (!modalRole) {
            emergencyModal.setAttribute("role", "dialog");
        }
    }


    // -------------------------------------
    // Initialize
    // -------------------------------------

    function initEmergency() {
        initAccessibility();
        initEmergencyButton();
        initCloseButtons();
        initOutsideClick();
        initEscapeKey();
        initPhoneLinks();
    }


    // -------------------------------------
    // Start
    // -------------------------------------

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initEmergency
        );
    } else {
        initEmergency();
    }

})();
