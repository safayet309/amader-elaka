 // =========================================================
// Amader Elaka - Dashboard JavaScript
// Clean Dashboard
// Report functionality removed
// Admin-controlled Services ready
// =========================================================

"use strict";


// =========================================================
// DOM Elements
// =========================================================

const dashboardServices =
    document.getElementById("dashboardServices");

const adminServicesGrid =
    document.getElementById("adminServicesGrid");

const servicesEmptyState =
    document.getElementById("servicesEmptyState");


// =========================================================
// Admin Service Configuration
// =========================================================
//
// ভবিষ্যতে Admin Panel থেকে এই data আসবে।
//
// প্রতিটি service-এর structure:
//
// {
//     id: "service-1",
//     title: "সেবার নাম",
//     description: "সেবার সংক্ষিপ্ত বিবরণ",
//     icon: "🏥",
//     url: "https://example.com",
//     active: true
// }
//
// =========================================================

let adminServices = [];


// =========================================================
// Default Services
// =========================================================

const defaultServices = [
    {
        id: "government-services",
        title: "সরকারি সেবা",
        description: "বিভিন্ন সরকারি সেবার তথ্য ও প্রয়োজনীয় লিংক",
        icon: "🌐",
        url: "government.html",
        active: true
    }
];


// =========================================================
// Utility - Safe Text
// =========================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// Normalize Service
// =========================================================

function normalizeService(service, index = 0) {

    if (!service || typeof service !== "object") {
        return null;
    }

    const title =
        String(service.title || service.name || "").trim();

    if (!title) {
        return null;
    }

    return {

        id:
            service.id ||
            `service-${index + 1}`,

        title,

        description:
            String(
                service.description ||
                service.details ||
                "প্রয়োজনীয় সেবার তথ্য"
            ).trim(),

        icon:
            String(
                service.icon ||
                service.emoji ||
                "✨"
            ).trim(),

        url:
            String(
                service.url ||
                service.link ||
                "#"
            ).trim(),

        active:
            service.active !== false &&
            service.enabled !== false

    };
}


// =========================================================
// Create Service Card
// =========================================================

function createServiceCard(service) {

    const normalized =
        normalizeService(service);

    if (!normalized || !normalized.active) {
        return null;
    }


    const card =
        document.createElement(
            normalized.url &&
            normalized.url !== "#"
                ? "a"
                : "div"
        );


    card.className = "summary-card";

    card.dataset.serviceId =
        normalized.id;


    if (
        normalized.url &&
        normalized.url !== "#"
    ) {

        card.href =
            normalized.url;


        // External link হলে নতুন tab
        if (
            /^https?:\/\//i.test(
                normalized.url
            )
        ) {

            card.target = "_blank";

            card.rel =
                "noopener noreferrer";

        }

    }


    card.innerHTML = `

        <div class="summary-card-top">

            <h3 class="summary-card-title">
                ${escapeHTML(normalized.title)}
            </h3>

            <div
                class="summary-card-icon"
                aria-hidden="true"
            >
                ${escapeHTML(normalized.icon)}
            </div>

        </div>


        <p class="summary-card-value">
            দেখুন
        </p>


        <p class="summary-card-note">
            ${escapeHTML(normalized.description)}
        </p>

    `;


    return card;
}


// =========================================================
// Render Admin Services
// =========================================================

function renderAdminServices(services = []) {

    if (!adminServicesGrid) {
        return;
    }


    // পুরোনো dynamic cards remove
    adminServicesGrid
        .querySelectorAll(
            "[data-admin-service]"
        )
        .forEach(card => {
            card.remove();
        });


    const validServices =
        services
            .map((service, index) =>
                normalizeService(service, index)
            )
            .filter(
                service =>
                    service &&
                    service.active
            );


    // Empty state
    if (!validServices.length) {

        if (servicesEmptyState) {
            servicesEmptyState.hidden = false;
        }

        return;
    }


    if (servicesEmptyState) {
        servicesEmptyState.hidden = true;
    }


    validServices.forEach(service => {

        const card =
            createServiceCard(service);

        if (!card) {
            return;
        }

        card.dataset.adminService = "true";

        adminServicesGrid.appendChild(card);

    });

}


// =========================================================
// Load Admin Services
// =========================================================
//
// এখন local configuration থেকে load হচ্ছে।
//
// পরে Admin integration করার সময় শুধু এই function-এর
// data source পরিবর্তন করলেই হবে।
//
// Dashboard-এর HTML পরিবর্তন করার প্রয়োজন হবে না।
//
// =========================================================

function loadAdminServices() {

    try {

        /*
         * ভবিষ্যতে এখানে Admin API / database / storage
         * থেকে service data নেওয়া যাবে।
         *
         * Example:
         *
         * const response = await fetch(...);
         * const data = await response.json();
         * adminServices = data;
         */


        adminServices =
            Array.isArray(window.AMADER_ELAKA_SERVICES)
                ? window.AMADER_ELAKA_SERVICES
                : [];


        renderAdminServices(
            adminServices
        );

    } catch (error) {

        console.warn(
            "Dashboard services could not be loaded:",
            error
        );

        adminServices = [];

        renderAdminServices([]);

    }

}


// =========================================================
// Dashboard Default Service Setup
// =========================================================

function setupDefaultServices() {

    if (!dashboardServices) {
        return;
    }


    // Government service already exists in HTML.
    // এখানে শুধু future dynamic services-এর জায়গা রাখা হচ্ছে।

}


// =========================================================
// Dashboard Navigation
// =========================================================

function setupDashboardNavigation() {

    const dashboardLinks =
        document.querySelectorAll(
            ".dashboard a"
        );


    dashboardLinks.forEach(link => {

        link.addEventListener(
            "click",
            function () {

                this.classList.add(
                    "button-clicked"
                );


                setTimeout(() => {

                    this.classList.remove(
                        "button-clicked"
                    );

                }, 250);

            }
        );

    });

}


// =========================================================
// Emergency Bridge
// =========================================================
//
// dashboard.html-এর বিভিন্ন emergency button
// emergency.js-এর মূল button-এ bridge করা হচ্ছে।
//
// =========================================================

function setupEmergencyButtons() {

    const mainEmergencyButton =
        document.getElementById(
            "emergencyButton"
        );


    if (!mainEmergencyButton) {
        return;
    }


    const emergencyButtons = [

        document.getElementById(
            "dashboardEmergencyButton"
        ),

        document.getElementById(
            "serviceEmergencyButton"
        ),

        document.getElementById(
            "dashboardEmergencyListButton"
        ),

        document.getElementById(
            "footerEmergencyButton"
        )

    ].filter(Boolean);


    emergencyButtons.forEach(button => {

        if (
            button === mainEmergencyButton
        ) {
            return;
        }


        button.addEventListener(
            "click",
            function (event) {

                if (
                    this.tagName === "A" &&
                    this.getAttribute("href") === "#"
                ) {
                    event.preventDefault();
                }


                mainEmergencyButton.click();

            }
        );

    });

}


// =========================================================
// Keyboard Accessibility
// =========================================================

function setupAccessibility() {

    const cards =
        document.querySelectorAll(
            ".summary-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    this.tagName !== "A"
                ) {

                    this.click();

                }

            }
        );

    });

}


// =========================================================
// Dashboard Initialization
// =========================================================

function initializeDashboard() {

    setupDefaultServices();

    loadAdminServices();

    setupDashboardNavigation();

    setupEmergencyButtons();

    setupAccessibility();

}


// =========================================================
// DOM Ready
// =========================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();

}


// =========================================================
// Global API
// =========================================================
//
// ভবিষ্যতে Admin Panel থেকে Dashboard-এ service
// update করার সময় এই functions ব্যবহার করা যাবে।
//
// Example:
//
// window.AmaderElakaDashboard.setServices([...]);
//
// =========================================================

window.AmaderElakaDashboard = {

    setServices(services) {

        if (!Array.isArray(services)) {

            console.warn(
                "Dashboard services must be an array."
            );

            return;
        }


        adminServices =
            services;


        renderAdminServices(
            adminServices
        );

    },


    getServices() {

        return [
            ...adminServices
        ];

    },


    refresh() {

        loadAdminServices();

    }

};


// =========================================================
// End of Dashboard JavaScript
// =========================================================
