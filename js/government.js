 // =====================================
// Amader Elaka - Government Services
// =====================================

(() => {
    "use strict";

    // -------------------------------------
    // Government Services Data
    // -------------------------------------

    const services = [

        {
            title: "জাতীয় পরিচয়পত্র (NID)",
            description: "জাতীয় পরিচয়পত্রের তথ্য, সংশোধন ও অন্যান্য সেবা।",
            category: "নাগরিক",
            icon: "🪪",
            url: "https://services.nidw.gov.bd/"
        },

        {
            title: "জন্ম ও মৃত্যু নিবন্ধন",
            description: "জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত সরকারি অনলাইন সেবা।",
            category: "নাগরিক",
            icon: "📄",
            url: "https://bdris.gov.bd/"
        },

        {
            title: "ই-পাসপোর্ট",
            description: "ই-পাসপোর্ট আবেদন ও সংশ্লিষ্ট অনলাইন সেবা।",
            category: "নাগরিক",
            icon: "🛂",
            url: "https://www.epassport.gov.bd/"
        },

        {
            title: "বাংলাদেশ পুলিশ",
            description: "বাংলাদেশ পুলিশের অফিসিয়াল ওয়েবসাইট ও নাগরিক তথ্য।",
            category: "অন্যান্য",
            icon: "👮",
            url: "https://www.police.gov.bd/"
        },

        {
            title: "BRTA",
            description: "ড্রাইভিং লাইসেন্স, গাড়ি নিবন্ধন ও পরিবহন সংক্রান্ত সেবা।",
            category: "যাতায়াত",
            icon: "🚗",
            url: "https://bsp.brta.gov.bd/"
        },

        {
            title: "শিক্ষা বোর্ড",
            description: "পরীক্ষার ফলাফল ও শিক্ষা বোর্ডের প্রয়োজনীয় সেবা।",
            category: "শিক্ষা",
            icon: "🎓",
            url: "https://educationboardresults.gov.bd/"
        },

        {
            title: "স্বাস্থ্য সেবা",
            description: "বাংলাদেশ সরকারের স্বাস্থ্য সংক্রান্ত তথ্য ও সেবা।",
            category: "স্বাস্থ্য",
            icon: "🏥",
            url: "https://dghs.gov.bd/"
        },

        {
            title: "ভূমি সেবা",
            description: "ভূমি সংক্রান্ত বিভিন্ন সরকারি অনলাইন সেবা।",
            category: "ভূমি",
            icon: "🏡",
            url: "https://land.gov.bd/"
        },

        {
            title: "ই-নামজারি",
            description: "অনলাইনে নামজারি আবেদন ও সংশ্লিষ্ট ভূমি সেবা।",
            category: "ভূমি",
            icon: "📑",
            url: "https://mutation.land.gov.bd/"
        },

        {
            title: "জাতীয় রাজস্ব বোর্ড",
            description: "কর, আয়কর ও রাজস্ব সংক্রান্ত সরকারি সেবা।",
            category: "অর্থ",
            icon: "💰",
            url: "https://nbr.gov.bd/"
        },

        {
            title: "সরকারি চাকরি",
            description: "সরকারি চাকরির নিয়োগ ও পরীক্ষার প্রয়োজনীয় তথ্য।",
            category: "চাকরি",
            icon: "💼",
            url: "https://bpsc.gov.bd/"
        },

        {
            title: "বাংলাদেশ জাতীয় তথ্য বাতায়ন",
            description: "সরকারের বিভিন্ন মন্ত্রণালয়, বিভাগ ও নাগরিক তথ্য।",
            category: "অন্যান্য",
            icon: "🌐",
            url: "https://bangladesh.gov.bd/"
        }

    ];


    // -------------------------------------
    // DOM Elements
    // -------------------------------------

    const serviceGrid =
        document.getElementById("serviceGrid");

    const serviceSearch =
        document.getElementById("serviceSearch");

    const searchButton =
        document.getElementById("searchButton");

    const noResult =
        document.getElementById("noResult");

    const serviceCount =
        document.getElementById("serviceCount");

    const categoryFilter =
        document.getElementById("categoryFilter");


    // -------------------------------------
    // State
    // -------------------------------------

    let activeCategory = "all";
    let searchTerm = "";


    // -------------------------------------
    // Escape HTML
    // -------------------------------------

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // -------------------------------------
    // Get Filtered Services
    // -------------------------------------

    function getFilteredServices() {

        const query = searchTerm
            .trim()
            .toLowerCase();

        return services.filter((service) => {

            const matchesCategory =
                activeCategory === "all" ||
                service.category === activeCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!query) {
                return true;
            }

            const searchableText = [
                service.title,
                service.description,
                service.category
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);
        });
    }


    // -------------------------------------
    // Render Service Card
    // -------------------------------------

    function createServiceCard(service) {

        const card = document.createElement("article");

        card.className = "service-card";

        card.dataset.category = service.category;


        card.innerHTML = `
            <div class="service-card-top">

                <div class="service-icon" aria-hidden="true">
                    ${escapeHTML(service.icon)}
                </div>

                <span class="service-category">
                    ${escapeHTML(service.category)}
                </span>

            </div>

            <h3>
                ${escapeHTML(service.title)}
            </h3>

            <p>
                ${escapeHTML(service.description)}
            </p>

            <a
                class="service-link"
                href="${escapeHTML(service.url)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="${escapeHTML(service.title)} খুলুন"
            >
                সেবা ভিজিট করুন
                <span aria-hidden="true">↗</span>
            </a>
        `;

        return card;
    }


    // -------------------------------------
    // Render Services
    // -------------------------------------

    function renderServices() {

        if (!serviceGrid) return;

        const filteredServices =
            getFilteredServices();


        serviceGrid.innerHTML = "";


        if (filteredServices.length === 0) {

            if (noResult) {
                noResult.hidden = false;
            }

        } else {

            if (noResult) {
                noResult.hidden = true;
            }

            const fragment =
                document.createDocumentFragment();

            filteredServices.forEach((service) => {
                fragment.appendChild(
                    createServiceCard(service)
                );
            });

            serviceGrid.appendChild(fragment);
        }


        updateServiceCount(
            filteredServices.length
        );
    }


    // -------------------------------------
    // Update Service Count
    // -------------------------------------

    function updateServiceCount(count) {

        if (!serviceCount) return;

        if (count === services.length) {

            serviceCount.textContent =
                `${services.length}টি সেবা`;

            return;
        }

        serviceCount.textContent =
            `${count}টি সেবা পাওয়া গেছে`;
    }


    // -------------------------------------
    // Category Filter
    // -------------------------------------

    function initCategoryFilter() {

        if (!categoryFilter) return;

        const buttons =
            categoryFilter.querySelectorAll(
                ".filter-btn"
            );

        buttons.forEach((button) => {

            button.addEventListener("click", () => {

                activeCategory =
                    button.dataset.category || "all";


                buttons.forEach((item) => {
                    item.classList.remove("active");
                    item.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });


                button.classList.add("active");

                button.setAttribute(
                    "aria-pressed",
                    "true"
                );


                renderServices();
            });
        });
    }


    // -------------------------------------
    // Search
    // -------------------------------------

    function performSearch() {

        if (!serviceSearch) return;

        searchTerm =
            serviceSearch.value || "";

        renderServices();
    }


    function initSearch() {

        if (!serviceSearch) return;


        serviceSearch.addEventListener(
            "input",
            () => {
                searchTerm =
                    serviceSearch.value || "";

                renderServices();
            }
        );


        serviceSearch.addEventListener(
            "search",
            performSearch
        );


        if (searchButton) {

            searchButton.addEventListener(
                "click",
                performSearch
            );
        }


        serviceSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    performSearch();
                }

            }
        );
    }


    // -------------------------------------
    // Emergency Modal
    // -------------------------------------

    const emergencyNumbers = [

        {
            name: "জাতীয় জরুরি সেবা",
            number: "999",
            icon: "🚨",
            description: "পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স"
        },

        {
            name: "ফায়ার সার্ভিস",
            number: "102",
            icon: "🚒",
            description: "অগ্নিকাণ্ড ও উদ্ধার সেবা"
        },

        {
            name: "নারী ও শিশু সহায়তা",
            number: "109",
            icon: "🆘",
            description: "নারী ও শিশু নির্যাতন প্রতিরোধ"
        },

        {
            name: "স্বাস্থ্য বাতায়ন",
            number: "16263",
            icon: "🏥",
            description: "স্বাস্থ্য সংক্রান্ত পরামর্শ"
        }

    ];


    const emergencyButton =
        document.getElementById("emergencyButton");

    const emergencyOverlay =
        document.getElementById("emergencyOverlay");

    const emergencyClose =
        document.getElementById("emergencyClose");

    const emergencyList =
        document.getElementById("emergencyList");


    // -------------------------------------
    // Render Emergency Numbers
    // -------------------------------------

    function renderEmergencyNumbers() {

        if (!emergencyList) return;

        emergencyList.innerHTML =
            emergencyNumbers.map((item) => `

                <div class="emergency-item">

                    <div class="emergency-item-icon">
                        ${escapeHTML(item.icon)}
                    </div>

                    <div class="emergency-item-content">

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        <p>
                            ${escapeHTML(item.description)}
                        </p>

                    </div>

                    <a
                        href="tel:${escapeHTML(item.number)}"
                        class="emergency-call"
                        aria-label="${escapeHTML(item.name)} ${escapeHTML(item.number)}"
                    >
                        <strong>
                            ${escapeHTML(item.number)}
                        </strong>

                        <span>
                            কল করুন
                        </span>
                    </a>

                </div>

            `).join("");
    }


    // -------------------------------------
    // Open Emergency
    // -------------------------------------

    function openEmergency() {

        if (!emergencyOverlay) return;

        emergencyOverlay.classList.add("active");
        emergencyOverlay.classList.add("show");

        emergencyOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        document.body.style.overflow =
            "hidden";


        if (emergencyClose) {
            setTimeout(() => {
                emergencyClose.focus();
            }, 50);
        }
    }


    // -------------------------------------
    // Close Emergency
    // -------------------------------------

    function closeEmergency() {

        if (!emergencyOverlay) return;

        emergencyOverlay.classList.remove("active");
        emergencyOverlay.classList.remove("show");

        emergencyOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        document.body.style.overflow = "";
    }


    // -------------------------------------
    // Emergency Events
    // -------------------------------------

    function initEmergency() {

        if (emergencyButton) {

            emergencyButton.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();
                    openEmergency();

                }
            );
        }


        if (emergencyClose) {

            emergencyClose.addEventListener(
                "click",
                closeEmergency
            );
        }


        if (emergencyOverlay) {

            emergencyOverlay.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        emergencyOverlay
                    ) {
                        closeEmergency();
                    }

                }
            );
        }


        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    emergencyOverlay &&
                    (
                        emergencyOverlay.classList.contains(
                            "active"
                        ) ||
                        emergencyOverlay.classList.contains(
                            "show"
                        )
                    )
                ) {
                    closeEmergency();
                }

            }
        );


        renderEmergencyNumbers();
    }


    // -------------------------------------
    // External Link Protection
    // -------------------------------------

    function initExternalLinks() {

        if (!serviceGrid) return;

        serviceGrid.addEventListener(
            "click",
            (event) => {

                const link =
                    event.target.closest(
                        "a.service-link"
                    );

                if (!link) return;

                link.classList.add(
                    "service-link-clicked"
                );

                setTimeout(() => {
                    link.classList.remove(
                        "service-link-clicked"
                    );
                }, 300);
            }
        );
    }


    // -------------------------------------
    // Initialize
    // -------------------------------------

    function initGovernmentPage() {

        if (serviceGrid) {
            renderServices();
        }

        initSearch();
        initCategoryFilter();
        initEmergency();
        initExternalLinks();
    }


    // -------------------------------------
    // Start
    // -------------------------------------

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initGovernmentPage
        );

    } else {

        initGovernmentPage();

    }

})();
