// =========================================================
// AMADER ELAKA — MAIN JAVASCRIPT
// Clean Home Page Logic
// =========================================================

"use strict";


// =========================================================
// 01. DOM READY
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    initNavigation();
    initSmoothScroll();
    initButtons();

});


// =========================================================
// 02. NAVIGATION
// =========================================================

function initNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase() || "index.html";

    const navLinks =
        document.querySelectorAll(
            ".nav a[href], .mobile-bottom-nav a[href]"
        );

    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");

        if (!href || href.startsWith("#")) {
            return;
        }

        const linkPage =
            href.split("/").pop().toLowerCase();

        if (
            linkPage === currentPage ||
            (
                currentPage === "" &&
                linkPage === "index.html"
            )
        ) {
            link.classList.add("active");
        }

    });

}


// =========================================================
// 03. SMOOTH SCROLL
// =========================================================

function initSmoothScroll() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

}


// =========================================================
// 04. BUTTON INTERACTION
// =========================================================

function initButtons() {

    const buttons =
        document.querySelectorAll(
            ".btn"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                button.classList.add(
                    "button-clicked"
                );

                setTimeout(() => {

                    button.classList.remove(
                        "button-clicked"
                    );

                }, 180);

            }
        );

    });

}


// =========================================================
// 05. PAGE VISIBILITY
// =========================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {
            return;
        }

        // Page became active again.
        // No API/report refresh is required.

    }
);


// =========================================================
// 06. GLOBAL ERROR HANDLING
// =========================================================

window.addEventListener(
    "error",
    event => {

        console.warn(
            "Amader Elaka:",
            event.message
        );

    }
);


// =========================================================
// END OF MAIN JAVASCRIPT
// =========================================================
