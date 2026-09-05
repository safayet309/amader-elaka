const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

const reportsContainer = document.getElementById("reportsContainer");
const loading = document.getElementById("loading");
const noReports = document.getElementById("noReports");

const totalReports = document.getElementById("totalReports");
const pendingReports = document.getElementById("pendingReports");
const progressReports = document.getElementById("progressReports");
const solvedReports = document.getElementById("solvedReports");

const refreshButton = document.getElementById("refreshButton");


// ================================
// Filter Elements
// ================================

const searchInput = document.getElementById("searchInput");
const divisionFilter = document.getElementById("divisionFilter");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const resetFilters = document.getElementById("resetFilters");


// All reports will be stored here
let allReports = [];


// ================================
// Load Reports
// ================================

async function loadReports() {

    loading.style.display = "block";
    noReports.style.display = "none";
    reportsContainer.innerHTML = "";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load reports");
        }

        const reports = await response.json();

        console.log("Reports:", reports);

        allReports = reports;

        updateStatistics(allReports);

        createFilterOptions(allReports);

        displayReports(allReports);

    } catch (error) {

        console.error("Error:", error);

        reportsContainer.innerHTML = `
            <div class="no-reports">
                ❌ রিপোর্ট লোড করা যায়নি।
                <br>
                কিছুক্ষণ পর আবার চেষ্টা করুন।
            </div>
        `;

    } finally {

        loading.style.display = "none";

    }
}


// ================================
// Statistics
// ================================

function updateStatistics(reports) {

    const total = reports.length;

    const pending = reports.filter(
        report => report.Status === "Pending"
    ).length;

    const progress = reports.filter(
        report => report.Status === "কাজ চলছে"
    ).length;

    const solved = reports.filter(
        report => report.Status === "সমাধান হয়েছে"
    ).length;


    totalReports.textContent = total;

    pendingReports.textContent = pending;

    progressReports.textContent = progress;

    solvedReports.textContent = solved;
}


// ================================
// Create Filter Options
// ================================

function createFilterOptions(reports) {

    // Save currently selected values
    const selectedDivision = divisionFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;


    // Clear old options
    divisionFilter.innerHTML =
        '<option value="">সব বিভাগ</option>';

    categoryFilter.innerHTML =
        '<option value="">সব সমস্যা</option>';

    statusFilter.innerHTML =
        '<option value="">সব Status</option>';


    // Unique values
    const divisions = [
        ...new Set(
            reports
                .map(report => report.Division)
                .filter(Boolean)
        )
    ];

    const categories = [
        ...new Set(
            reports
                .map(report => report.Category)
                .filter(Boolean)
        )
    ];

    const statuses = [
        ...new Set(
            reports
                .map(report => report.Status)
                .filter(Boolean)
        )
    ];


    // Division options
    divisions.sort().forEach(function (division) {

        const option = document.createElement("option");

        option.value = division;
        option.textContent = division;

        divisionFilter.appendChild(option);

    });


    // Category options
    categories.sort().forEach(function (category) {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });


    // Status options
    statuses.sort().forEach(function (status) {

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        statusFilter.appendChild(option);

    });


    // Restore selected values
    divisionFilter.value = selectedDivision;
    categoryFilter.value = selectedCategory;
    statusFilter.value = selectedStatus;
}


// ================================
// Apply Filters
// ================================

function applyFilters() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedDivision =
        divisionFilter.value;

    const selectedCategory =
        categoryFilter.value;

    const selectedStatus =
        statusFilter.value;


    const filteredReports =
        allReports.filter(function (report) {


            // Search
            const searchableText = (

                (report.Area || "") + " " +
                (report.Description || "") + " " +
                (report.Division || "") + " " +
                (report.District || "") + " " +
                (report.Upazila || "") + " " +
                (report.Category || "")

            ).toLowerCase();


            const matchesSearch =
                !searchText ||
                searchableText.includes(searchText);


            // Division
            const matchesDivision =
                !selectedDivision ||
                report.Division === selectedDivision;


            // Category
            const matchesCategory =
                !selectedCategory ||
                report.Category === selectedCategory;


            // Status
            const matchesStatus =
                !selectedStatus ||
                report.Status === selectedStatus;


            return (
                matchesSearch &&
                matchesDivision &&
                matchesCategory &&
                matchesStatus
            );

        });


    displayReports(filteredReports);
}


// ================================
// Display Reports
// ================================

function displayReports(reports) {

    reportsContainer.innerHTML = "";

    noReports.style.display = "none";


    if (!reports || reports.length === 0) {

        noReports.style.display = "block";

        noReports.textContent =
            "এই ফিল্টারে কোনো রিপোর্ট পাওয়া যায়নি।";

        return;
    }


    // Newest first
    const sortedReports = [...reports].reverse();


    sortedReports.forEach(function (report) {

        const card =
            document.createElement("div");

        card.className = "report-card";


        card.innerHTML = `

            <div class="report-top">

                <div>

                    <div class="report-category">
                        ${escapeHTML(
                            report.Category || "অন্যান্য"
                        )}
                    </div>

                    <div class="report-id">
                        ID:
                        ${escapeHTML(
                            report.ID || "N/A"
                        )}
                    </div>

                </div>


                <span class="report-status">
                    ${escapeHTML(
                        report.Status || "Pending"
                    )}
                </span>

            </div>


            <div class="report-location">

                📍

                ${escapeHTML(
                    report.Division || ""
                )}

                →

                ${escapeHTML(
                    report.District || ""
                )}

                →

                ${escapeHTML(
                    report.Upazila || ""
                )}

                →

                ${escapeHTML(
                    report.Area || ""
                )}

                ${
                    report.Ward
                    ? "→ ওয়ার্ড " +
                      escapeHTML(report.Ward)
                    : ""
                }

            </div>


            <div class="report-description">

                ${escapeHTML(
                    report.Description || ""
                )}

            </div>


            <div class="report-date">

                📅

                ${escapeHTML(
                    report.Date || ""
                )}

            </div>

        `;


        reportsContainer.appendChild(card);

    });
}


// ================================
// HTML Security
// ================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================================
// Search Event
// ================================

searchInput.addEventListener(
    "input",
    applyFilters
);


// ================================
// Division Filter
// ================================

divisionFilter.addEventListener(
    "change",
    applyFilters
);


// ================================
// Category Filter
// ================================

categoryFilter.addEventListener(
    "change",
    applyFilters
);


// ================================
// Status Filter
// ================================

statusFilter.addEventListener(
    "change",
    applyFilters
);


// ================================
// Reset Filters
// ================================

resetFilters.addEventListener(
    "click",
    function () {

        searchInput.value = "";

        divisionFilter.value = "";

        categoryFilter.value = "";

        statusFilter.value = "";

        displayReports(allReports);

    }
);


// ================================
// Refresh
// ================================

refreshButton.addEventListener(
    "click",
    loadReports
);


// ================================
// Start
// ================================

loadReports();
