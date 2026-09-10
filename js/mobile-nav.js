 // =========================================================
// AMADER ELAKA — MOBILE NAVIGATION
// =========================================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle =
        document.querySelector(".mobile-menu-toggle");

    const nav =
        document.querySelector(".nav");

    if (!menuToggle || !nav) {
        return;
    }


    // =====================================================
    // 01. MOBILE MENU TOGGLE
    // =====================================================

    menuToggle.addEventListener("click", event => {

        event.stopPropagation();

        const isOpen =
            nav.classList.toggle("mobile-nav-open");

        menuToggle.classList.toggle(
            "menu-open",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        document.body.classList.toggle(
            "nav-open",
            isOpen
        );

    });


    // =====================================================
    // 02. CLOSE MENU AFTER NAVIGATION
    // =====================================================

    const navLinks =
        nav.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove(
                "mobile-nav-open"
            );

            menuToggle.classList.remove(
                "menu-open"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove(
                "nav-open"
            );

        });

    });


    // =====================================================
    // 03. CLOSE WHEN CLICKING OUTSIDE
    // =====================================================

    document.addEventListener("click", event => {

        if (
            !nav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            nav.classList.remove(
                "mobile-nav-open"
            );

            menuToggle.classList.remove(
                "menu-open"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove(
                "nav-open"
            );

        }

    });


    // =====================================================
    // 04. ESCAPE KEY
    // =====================================================

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") {
            return;
        }

        nav.classList.remove(
            "mobile-nav-open"
        );

        menuToggle.classList.remove(
            "menu-open"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "nav-open"
        );

    });


    // =====================================================
    // 05. RESET ON DESKTOP
    // =====================================================

    const desktopQuery =
        window.matchMedia("(min-width: 801px)");

    function handleDesktopMode(event) {

        if (!event.matches) {
            return;
        }

        nav.classList.remove(
            "mobile-nav-open"
        );

        menuToggle.classList.remove(
            "menu-open"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "nav-open"
        );

    }

    desktopQuery.addEventListener(
        "change",
        handleDesktopMode
    );


    // =====================================================
    // 06. INITIAL STATE
    // =====================================================

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

});
