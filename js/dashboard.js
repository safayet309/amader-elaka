// =====================================
// Amader Elaka - Dashboard JavaScript
// =====================================

const REPORT_TABLE = "Reports";
const REPORT_CACHE_KEY = "amaderElaka_reports_cache";
const REPORT_CACHE_TIME = 60 * 1000;

// =====================================
// DOM Elements
// =====================================

const totalReports = document.getElementById("totalReports");
const pendingReports = document.getElementById("pendingReports");
const progressReports = document.getElementById("progressReports");
const solvedReports = document.getElementById("solvedReports");

const reportsContainer = document.getElementById("reportsContainer");
const loading = document.getElementById("loading");
const noReports = document.getElementById("noReports");

const searchInput = document.getElementById("searchInput");
const divisionFilter = document.getElementById("divisionFilter");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

const resetFilters = document.getElementById("resetFilters");
const refreshButton = document.getElementById("refreshButton");

let allReports = [];

// =====================================
// Load Reports
// =====================================

async function loadReports(forceRefresh = false) {

    try {

        if (loading) {
            loading.style.display = "block";
        }

        if (reportsContainer) {
            reportsContainer.innerHTML = "";
        }

        if (noReports) {
            noReports.style.display = "none";
        }

        // =====================================
        // Use Cache First
        // =====================================

        if (!forceRefresh) {

            const cachedReports = getCachedReports();

            if (cachedReports) {

                allReports = cachedReports;

                updateStatistics(allReports);
                createFilterOptions(allReports);
                displayReports(allReports);

                return;
            }
        }

        // =====================================
        // Supabase Request
        // =====================================

        if (typeof supabaseClient === "undefined") {
            throw new Error("Supabase client is not loaded");
        }

        const { data, error } = await supabaseClient
            .from(REPORT_TABLE)
            .select("*")
            .order("Date", { ascending: true });

        if (error) {
            throw error;
        }

        allReports = Array.isArray(data) ? data : [];

        // Save fresh data
        saveCachedReports(allReports);

        updateStatistics(allReports);
        createFilterOptions(allReports);
        displayReports(allReports);

    } catch (error) {

        console.error("Dashboard Error:", error);

        // Try stale cache if Supabase fails
        const cachedReports = getCachedReports(true);

        if (cachedReports) {

            allReports = cachedReports;

            updateStatistics(allReports);
            createFilterOptions(allReports);
            displayReports(allReports);

        } else {

            allReports = [];

            updateStatistics([]);

            if (reportsContainer) {

                reportsContainer.innerHTML = `
                    <div class="no-reports">
                        <h3>রিপোর্ট লোড করা যায়নি</h3>
                        <p>ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
                    </div>
                `;
            }
        }

    } finally {

        if (loading) {
            loading.style.display = "none";
        }
    }
}

// =====================================
// Get Cached Reports
// =====================================

function getCachedReports(ignoreExpiry = false) {

    try {

        const cached =
            localStorage.getItem(REPORT_CACHE_KEY);

        if (!cached) {
            return null;
        }

        const data = JSON.parse(cached);

        if (
            !data ||
            !Array.isArray(data.reports) ||
            !data.time
        ) {
            return null;
        }

        const age =
            Date.now() - Number(data.time);

        if (
            !ignoreExpiry &&
            age > REPORT_CACHE_TIME
        ) {
            return null;
        }

        return data.reports;

    } catch (error) {

        console.error(
            "Dashboard Cache Read Error:",
            error
        );

        return null;
    }
}

// =====================================
// Save Reports to Cache
// =====================================

function saveCachedReports(reports) {

    try {

        localStorage.setItem(
            REPORT_CACHE_KEY,
            JSON.stringify({
                time: Date.now(),
                reports: reports
            })
        );

    } catch (error) {

        console.error(
            "Dashboard Cache Save Error:",
            error
        );
    }
}

// =====================================
// Clear Cache
// =====================================

function clearReportCache() {

    try {

        localStorage.removeItem(
            REPORT_CACHE_KEY
        );

    } catch (error) {

        console.error(
            "Dashboard Cache Clear Error:",
            error
        );
    }
}

// =====================================
// Statistics
// =====================================

function updateStatistics(reports) {

    const total = reports.length;

    const pending = reports.filter(function (report) {

        return String(report.Status || "")
            .trim()
            .toLowerCase() === "pending";

    }).length;

    const progress = reports.filter(function (report) {

        const status =
            String(report.Status || "").trim();

        return (
            status === "কাজ চলছে" ||
            status.toLowerCase() === "in progress" ||
            status.toLowerCase() === "progress"
        );

    }).length;

    const solved = reports.filter(function (report) {

        const status =
            String(report.Status || "").trim();

        return (
            status === "সমাধান হয়েছে" ||
            status === "সমাধান হয়েছে" ||
            status.toLowerCase() === "solved"
        );

    }).length;

    animateNumber(
        totalReports,
        total
    );

    animateNumber(
        pendingReports,
        pending
    );

    animateNumber(
        progressReports,
        progress
    );

    animateNumber(
        solvedReports,
        solved
    );
}

// =====================================
// Number Animation
// =====================================

function animateNumber(element, target) {

    if (!element) return;

    const start =
        Number(element.textContent) || 0;

    if (start === target) {

        element.textContent = target;

        return;
    }

    const duration = 500;

    const startTime =
        performance.now();

    function update(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                    duration,
                1
            );

        const value =
            Math.floor(
                start +
                (target - start) *
                    progress
            );

        element.textContent = value;

        if (progress < 1) {

            requestAnimationFrame(update);

        } else {

            element.textContent =
                target;
        }
    }

    requestAnimationFrame(update);
}

// =====================================
// Filter Options
// =====================================

function createFilterOptions(reports) {

    if (
        !divisionFilter ||
        !categoryFilter ||
        !statusFilter
    ) {
        return;
    }

    const divisions = [
        ...new Set(
            reports
                .map(report =>
                    String(
                        report.Division || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    const categories = [
        ...new Set(
            reports
                .map(report =>
                    String(
                        report.Category || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    const statuses = [
        ...new Set(
            reports
                .map(report =>
                    String(
                        report.Status || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    const currentDivision =
        divisionFilter.value;

    const currentCategory =
        categoryFilter.value;

    const currentStatus =
        statusFilter.value;

    divisionFilter.innerHTML =
        '<option value="">সব বিভাগ</option>';

    categoryFilter.innerHTML =
        '<option value="">সব বিষয়</option>';

    statusFilter.innerHTML =
        '<option value="">সব স্ট্যাটাস</option>';

    divisions.forEach(function (division) {

        const option =
            document.createElement("option");

        option.value = division;
        option.textContent = division;

        divisionFilter.appendChild(
            option
        );
    });

    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(
            option
        );
    });

    statuses.forEach(function (status) {

        const option =
            document.createElement("option");

        option.value = status;
        option.textContent = status;

        statusFilter.appendChild(
            option
        );
    });

    if (divisions.includes(currentDivision)) {
        divisionFilter.value =
            currentDivision;
    }

    if (categories.includes(currentCategory)) {
        categoryFilter.value =
            currentCategory;
    }

    if (statuses.includes(currentStatus)) {
        statusFilter.value =
            currentStatus;
    }
}

// =====================================
// Apply Filters
// =====================================

function applyFilters() {

    const searchValue = searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";

    const selectedDivision =
        divisionFilter
            ? divisionFilter.value
            : "";

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";

    const filteredReports =
        allReports.filter(function (report) {

            const searchableText = [
                report.ID,
                report.Area,
                report.Description,
                report.Division,
                report.District,
                report.Upazila,
                report.Category,
                report.Status,
                report.Ward,
                report.AdminNote
            ]
                .map(value =>
                    String(value || "")
                )
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            const matchesDivision =
                !selectedDivision ||
                report.Division ===
                    selectedDivision;

            const matchesCategory =
                !selectedCategory ||
                report.Category ===
                    selectedCategory;

            const matchesStatus =
                !selectedStatus ||
                report.Status ===
                    selectedStatus;

            return (
                matchesSearch &&
                matchesDivision &&
                matchesCategory &&
                matchesStatus
            );
        });

    displayReports(
        filteredReports
    );
}

// =====================================
// Display Reports
// =====================================

function displayReports(reports) {

    if (!reportsContainer) {
        return;
    }

    reportsContainer.innerHTML = "";

    if (!reports.length) {

        if (noReports) {

            noReports.style.display =
                "block";

        } else {

            reportsContainer.innerHTML = `
                <div class="no-reports">
                    <h3>কোনো রিপোর্ট পাওয়া যায়নি</h3>
                    <p>আপনার দেওয়া ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                </div>
            `;
        }

        return;
    }

    if (noReports) {
        noReports.style.display =
            "none";
    }

    // Latest reports first
    const sortedReports =
        [...reports].reverse();

    sortedReports.forEach(function (report) {

        const card =
            document.createElement("article");

        card.className =
            "report-card";

        card.setAttribute(
            "tabindex",
            "0"
        );

        card.innerHTML = `

            <div class="report-top">

                <div>

                    <div class="report-category">
                        ${escapeHTML(
                            report.Category ||
                            "অন্যান্য"
                        )}
                    </div>

                    <div class="report-id">
                        রিপোর্ট ID:
                        ${escapeHTML(
                            report.ID ||
                            "N/A"
                        )}
                    </div>

                </div>

                <span class="report-status">
                    ${escapeHTML(
                        report.Status ||
                        "Pending"
                    )}
                </span>

            </div>

            <div class="report-location">
                📍
                ${escapeHTML(
                    report.Division ||
                    ""
                )}

                ${
                    report.District
                        ? " → " +
                          escapeHTML(
                              report.District
                          )
                        : ""
                }

                ${
                    report.Upazila
                        ? " → " +
                          escapeHTML(
                              report.Upazila
                          )
                        : ""
                }

                ${
                    report.Area
                        ? " → " +
                          escapeHTML(
                              report.Area
                          )
                        : ""
                }
            </div>

            <div class="report-description">
                ${escapeHTML(
                    shortenText(
                        report.Description ||
                            "কোনো বিবরণ নেই",
                        150
                    )
                )}
            </div>

            <div class="report-date">
                📅
                ${escapeHTML(
                    report.Date ||
                    "তারিখ নেই"
                )}
            </div>
        `;

        // Click → Details
        card.addEventListener(
            "click",
            function () {
                showReportDetails(
                    report
                );
            }
        );

        // Keyboard accessibility
        card.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    showReportDetails(
                        report
                    );
                }
            }
        );

        reportsContainer.appendChild(
            card
        );
    });
}

// =====================================
// Shorten Description
// =====================================

function shortenText(
    text,
    maxLength
) {

    if (
        text.length <=
        maxLength
    ) {
        return text;
    }

    return (
        text.substring(
            0,
            maxLength
        ) + "..."
    );
}

// =====================================
// Report Details Modal
// =====================================

function showReportDetails(
    report
) {

    let modal =
        document.getElementById(
            "reportDetailsModal"
        );

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "reportDetailsModal";

        modal.className =
            "report-modal";

        modal.innerHTML = `

            <div class="report-modal-overlay"></div>

            <div class="report-modal-box">

                <button
                    type="button"
                    class="report-modal-close"
                    aria-label="বন্ধ করুন"
                >
                    ×
                </button>

                <div id="reportModalContent"></div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        const closeButton =
            modal.querySelector(
                ".report-modal-close"
            );

        const overlay =
            modal.querySelector(
                ".report-modal-overlay"
            );

        closeButton.addEventListener(
            "click",
            closeReportModal
        );

        overlay.addEventListener(
            "click",
            closeReportModal
        );

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    modal.classList.contains(
                        "show"
                    )
                ) {
                    closeReportModal();
                }
            }
        );
    }

    const modalContent =
        document.getElementById(
            "reportModalContent"
        );

    modalContent.innerHTML = `

        <div class="modal-category">
            ${escapeHTML(
                report.Category ||
                "অন্যান্য"
            )}
        </div>

        <h2>
            রিপোর্টের বিস্তারিত
        </h2>

        <div class="modal-info">

            <div>
                <strong>রিপোর্ট ID</strong>
                <span>
                    ${escapeHTML(
                        report.ID ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>স্ট্যাটাস</strong>
                <span>
                    ${escapeHTML(
                        report.Status ||
                        "Pending"
                    )}
                </span>
            </div>

            <div>
                <strong>বিভাগ</strong>
                <span>
                    ${escapeHTML(
                        report.Division ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>জেলা</strong>
                <span>
                    ${escapeHTML(
                        report.District ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>উপজেলা</strong>
                <span>
                    ${escapeHTML(
                        report.Upazila ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>এলাকা</strong>
                <span>
                    ${escapeHTML(
                        report.Area ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>ওয়ার্ড</strong>
                <span>
                    ${escapeHTML(
                        report.Ward ||
                        "N/A"
                    )}
                </span>
            </div>

            <div>
                <strong>তারিখ</strong>
                <span>
                    ${escapeHTML(
                        report.Date ||
                        "N/A"
                    )}
                </span>
            </div>

        </div>

        <div class="modal-description">

            <strong>
                সমস্যার বিস্তারিত
            </strong>

            <p>
                ${escapeHTML(
                    report.Description ||
                    "কোনো বিবরণ দেওয়া হয়নি।"
                )}
            </p>

        </div>

        ${
            report.AdminNote
                ? `
                    <div class="modal-description">

                        <strong>
                            কর্তৃপক্ষের মন্তব্য
                        </strong>

                        <p>
                            ${escapeHTML(
                                report.AdminNote
                            )}
                        </p>

                    </div>
                  `
                : ""
        }
    `;

    modal.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";
}

// =====================================
// Close Modal
// =====================================

function closeReportModal() {

    const modal =
        document.getElementById(
            "reportDetailsModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";
}

// =====================================
// Escape HTML
// =====================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

// =====================================
// Search / Filter Events
// =====================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );
}

if (divisionFilter) {

    divisionFilter.addEventListener(
        "change",
        applyFilters
    );
}

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );
}

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );
}

// =====================================
// Reset Filters
// =====================================

if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (divisionFilter) {
                divisionFilter.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }

            displayReports(
                allReports
            );
        }
    );
}

// =====================================
// Refresh
// =====================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        function () {

            refreshButton.disabled =
                true;

            const oldText =
                refreshButton.textContent;

            refreshButton.textContent =
                "লোড হচ্ছে...";

            // Force fresh Supabase request
            loadReports(true)
                .finally(
                    function () {

                        refreshButton.disabled =
                            false;

                        refreshButton.textContent =
                            oldText;
                    }
                );
        }
    );
}

// =====================================
// Start Dashboard
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadReports(false);

    }
);
