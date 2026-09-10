/* =========================================================
   Amader Elaka - Shared Navigation Controller
   Part 1: Stable navigation + automatic active state
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. Current Page Detection
       ===================================================== */

    const currentFile =
      window.location.pathname.split("/").pop().toLowerCase() || "index.html";


    /* =====================================================
       2. Desktop / Header Navigation
       ===================================================== */

    const mainNav = document.querySelector(".nav");

    if (mainNav) {

      const navLinks = mainNav.querySelectorAll("a");

      navLinks.forEach(function (link) {

        /* -----------------------------------------------
           Remove existing hard-coded active class
           ----------------------------------------------- */

        link.classList.remove("active");


        /* -----------------------------------------------
           Get destination
           ----------------------------------------------- */

        let href = link.getAttribute("href") || "";

        /*
          Example:
          dashboard.html#reports
          becomes:
          dashboard.html
        */

        const cleanHref = href.split("#")[0].toLowerCase();

        const destination =
          cleanHref === "" ? "index.html" : cleanHref;


        /* -----------------------------------------------
           Remove #reports from HEADER navigation only

           This is important because clicking the header
           "রিপোর্ট" button should NOT jump down the page.
           ----------------------------------------------- */

        if (href === "dashboard.html#reports") {
          link.setAttribute("href", "dashboard.html");
        }


        /* -----------------------------------------------
           Active page detection
           ----------------------------------------------- */

        let isActive = false;

        if (destination === currentFile) {
          isActive = true;
        }

        /*
          Root URL / empty path = Home
        */

        if (
          currentFile === "" &&
          destination === "index.html"
        ) {
          isActive = true;
        }


        /* -----------------------------------------------
           Apply active state
           ----------------------------------------------- */

        if (isActive) {
          link.classList.add("active");
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }

      });
    }


    /* =====================================================
       3. Mobile Menu Toggle
       ===================================================== */

    const nav = document.querySelector(".nav");
    const toggle = document.getElementById("mobileMenuToggle");

    function openMenu() {
      if (!nav || !toggle) return;

      nav.classList.add("mobile-open");
      document.body.classList.add("mobile-menu-active");

      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "মেনু বন্ধ করুন");
    }

    function closeMenu() {
      if (!nav || !toggle) return;

      nav.classList.remove("mobile-open");
      document.body.classList.remove("mobile-menu-active");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "মেনু খুলুন");
    }


    if (toggle && nav) {

      toggle.addEventListener("click", function () {

        if (nav.classList.contains("mobile-open")) {
          closeMenu();
        } else {
          openMenu();
        }

      });


      /* -----------------------------------------------
         Close mobile menu after normal navigation
         ----------------------------------------------- */

      nav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {
          closeMenu();
        });

      });

    }


    /* =====================================================
       4. Mobile Bottom Navigation
       ===================================================== */

    function injectBottomNav() {

      /*
        Don't create duplicate bottom navigation
      */

      if (document.querySelector(".mobile-bottom-nav")) {
        return;
      }


      const path = currentFile;


      function active(page) {

        if (path === page) {
          return "active";
        }

        if (
          page === "index.html" &&
          (path === "" || path === "index.html")
        ) {
          return "active";
        }

        return "";
      }


      const bottomNav = document.createElement("nav");

      bottomNav.className = "mobile-bottom-nav";
      bottomNav.setAttribute(
        "aria-label",
        "মোবাইল নেভিগেশন"
      );


      bottomNav.innerHTML = `
        <a
          class="${active("index.html")}"
          href="index.html"
          aria-label="হোম"
        >
          <span>⌂</span>
          <span>হোম</span>
        </a>

        <a
          class="${active("report.html")}"
          href="report.html"
          aria-label="রিপোর্ট"
        >
          <span>▣</span>
          <span>রিপোর্ট</span>
        </a>

        <a
          class="${active("dashboard.html")}"
          href="dashboard.html"
          aria-label="ড্যাশবোর্ড"
        >
          <span>◫</span>
          <span>ড্যাশবোর্ড</span>
        </a>

        <a
          class="${active("government.html")}"
          href="government.html"
          aria-label="সরকারি সেবা"
        >
          <span>◎</span>
          <span>সেবা</span>
        </a>

        <button
          class="danger"
          type="button"
          aria-label="জরুরি নম্বর"
        >
          <span>🚨</span>
          <span>জরুরি</span>
        </button>
      `;


      document.body.appendChild(bottomNav);


      /* ===================================================
         Emergency Button
         =================================================== */

      const emergencyButton =
        bottomNav.querySelector("button");

      if (emergencyButton) {

        emergencyButton.addEventListener("click", function () {

          const originalButton =
            document.getElementById("emergencyButton");

          if (originalButton) {

            originalButton.click();

          }

        });

      }

    }


    /* =====================================================
       5. Floating Report CTA
       ===================================================== */

    function injectFloatingReportButton() {

      /*
        Only show floating report button on mobile.
        Don't duplicate it.
      */

      if (
        document.querySelector(".floating-report-cta") ||
        currentFile === "report.html"
      ) {
        return;
      }


      const cta = document.createElement("a");

      cta.className = "floating-report-cta";
      cta.href = "report.html";
      cta.setAttribute(
        "aria-label",
        "সমস্যা রিপোর্ট করুন"
      );

      cta.innerHTML = "📝 রিপোর্ট করুন";


      document.body.appendChild(cta);

    }


    /* =====================================================
       6. Initialize
       ===================================================== */

    injectBottomNav();
    injectFloatingReportButton();


    /* =====================================================
       7. Prevent Accidental Hash Jump From Header Nav
       ===================================================== */

    if (mainNav) {

      mainNav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function (event) {

          const href = link.getAttribute("href") || "";

          /*
            Header navigation should never jump to
            #reports or another internal section.
          */

          if (href.includes("#")) {

            const cleanHref = href.split("#")[0];

            if (cleanHref) {
              link.setAttribute("href", cleanHref);
            }

          }

        });

      });

    }


    /* =====================================================
       8. Close Menu With Escape
       ===================================================== */

    document.addEventListener("keydown", function (event) {

      if (event.key === "Escape") {
        closeMenu();
      }

    });

  });

})();
