 // =========================================================
// AMADER ELAKA — MOBILE NAVIGATION
// =========================================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const standardToggle =
        document.querySelector(".mobile-menu-toggle");

    const standardNav =
        document.querySelector(".header .nav");

    const governmentToggle =
        document.getElementById("mobileMenu");

    const governmentNav =
        document.getElementById("govNav");

    const bottomMenu =
        document.getElementById("mobileBottomMenu");

    const bottomSearch =
        document.getElementById("mobileBottomSearch");


    // =====================================================
    // CLOSE NAVIGATION
    // =====================================================

    function closeNav(nav, toggle) {

        if (nav) {

            nav.classList.remove(
                "mobile-nav-open",
                "menu-open",
                "open"
            );
        }

        if (toggle) {

            toggle.classList.remove("menu-open");

            toggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    // =====================================================
    // TOGGLE NAVIGATION
    // =====================================================

    function toggleNav(nav, toggle) {

        if (!nav) {
            return false;
        }

        const isOpen =
            nav.classList.toggle("mobile-nav-open");

        if (toggle) {

            toggle.classList.toggle(
                "menu-open",
                isOpen
            );

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }

        return isOpen;
    }


    // =====================================================
    // NORMAL MOBILE MENU
    // =====================================================

    if (standardToggle && standardNav) {

        standardToggle.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleNav(
                    standardNav,
                    standardToggle
                );
            }
        );
    }


    // =====================================================
    // GOVERNMENT MOBILE MENU
    // =====================================================

    if (governmentToggle && governmentNav) {

        governmentToggle.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleNav(
                    governmentNav,
                    governmentToggle
                );
            }
        );
    }


    // =====================================================
    // BOTTOM MENU BUTTON
    // =====================================================

    if (bottomMenu) {

        bottomMenu.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                const nav =
                    standardNav || governmentNav;

                if (!nav) {
                    return;
                }

                const isOpen =
                    toggleNav(
                        nav,
                        bottomMenu
                    );

                bottomMenu.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

                bottomMenu.setAttribute(
                    "aria-label",
                    isOpen
                        ? "মেনু বন্ধ করুন"
                        : "মেনু খুলুন"
                );
            }
        );
    }


    // =====================================================
    // BOTTOM SEARCH BUTTON
    // =====================================================

    if (bottomSearch) {

        bottomSearch.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                const searchInput =
                    document.getElementById(
                        "serviceSearch"
                    ) ||
                    document.getElementById(
                        "serviceSearchInput"
                    );

                if (searchInput) {

                    searchInput.focus({
                        preventScroll: true
                    });

                    searchInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                } else {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            }
        );
    }


    // =====================================================
    // CLOSE MENU AFTER NAVIGATION
    // =====================================================

    [
        standardNav,
        governmentNav
    ]
    .filter(Boolean)
    .forEach(nav => {

        nav.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        closeNav(
                            nav,
                            standardNav === nav
                                ? standardToggle
                                : governmentToggle
                        );

                        if (bottomMenu) {

                            bottomMenu.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    }
                );
            });
    });


    // =====================================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =====================================================

    document.addEventListener(
        "click",
        event => {

            const navs =
                [
                    standardNav,
                    governmentNav
                ].filter(Boolean);

            const insideNav =
                navs.some(
                    nav =>
                        nav.contains(event.target)
                );

            const insideToggle =

                (
                    standardToggle &&
                    standardToggle.contains(
                        event.target
                    )
                )

                ||

                (
                    governmentToggle &&
                    governmentToggle.contains(
                        event.target
                    )
                )

                ||

                (
                    bottomMenu &&
                    bottomMenu.contains(
                        event.target
                    )
                );


            if (!insideNav && !insideToggle) {

                navs.forEach(nav => {

                    closeNav(
                        nav,
                        standardNav === nav
                            ? standardToggle
                            : governmentToggle
                    );
                });

                if (bottomMenu) {

                    bottomMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            [
                standardNav,
                governmentNav
            ]
            .filter(Boolean)
            .forEach(nav => {

                closeNav(
                    nav,
                    standardNav === nav
                        ? standardToggle
                        : governmentToggle
                );
            });

            if (bottomMenu) {

                bottomMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );


    // =====================================================
    // RESET ON DESKTOP
    // =====================================================

    const desktopQuery =
        window.matchMedia(
            "(min-width: 801px)"
        );


    const resetDesktop =
        event => {

            if (!event.matches) {
                return;
            }

            [
                standardNav,
                governmentNav
            ]
            .filter(Boolean)
            .forEach(nav => {

                closeNav(
                    nav,
                    standardNav === nav
                        ? standardToggle
                        : governmentToggle
                );
            });

            if (bottomMenu) {

                bottomMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        };


    if (desktopQuery.addEventListener) {

        desktopQuery.addEventListener(
            "change",
            resetDesktop
        );

    } else {

        desktopQuery.addListener(
            resetDesktop
        );
    }


    // =====================================================
    // INITIAL STATE
    // =====================================================

    if (standardToggle) {

        standardToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (governmentToggle) {

        governmentToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (bottomMenu) {

        bottomMenu.setAttribute(
            "aria-expanded",
            "false"
        );
    }

});
