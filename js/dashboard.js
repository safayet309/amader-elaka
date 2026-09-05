const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

const reportsContainer = document.getElementById("reportsContainer");
const loading = document.getElementById("loading");
const noReports = document.getElementById("noReports");

const totalReports = document.getElementById("totalReports");
const pendingReports = document.getElementById("pendingReports");
const progressReports = document.getElementById("progressReports");
const solvedReports = document.getElementById("solvedReports");

const refreshButton = document.getElementById("refreshButton");


// =========================
// Load Reports
// =========================

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

        updateStatistics(reports);

        displayReports(reports);

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


// =========================
// Update Statistics
// =========================

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


// =========================
// Display Reports
// =========================

function displayReports(reports) {

    if (!reports || reports.length === 0) {

        noReports.style.display = "block";

        return;
    }


    // Newest reports first
    reports.reverse();


    reports.forEach(function (report) {

        const card = document.createElement("div");

        card.className = "report-card";


        card.innerHTML = `

            <div class="report-top">

                <div>

                    <div class="report-category">
                        ${escapeHTML(report.Category || "অন্যান্য")}
                    </div>

                    <div class="report-id">
                        ID: ${escapeHTML(report.ID || "N/A")}
                    </div>

                </div>

                <span class="report-status">
                    ${escapeHTML(report.Status || "Pending")}
                </span>

            </div>


            <div class="report-location">
                📍
                ${escapeHTML(report.Division || "")}
                →
                ${escapeHTML(report.District || "")}
                →
                ${escapeHTML(report.Upazila || "")}
                →
                ${escapeHTML(report.Area || "")}
                ${report.Ward ? "→ ওয়ার্ড " + escapeHTML(report.Ward) : ""}
            </div>


            <div class="report-description">
                ${escapeHTML(report.Description || "")}
            </div>


            <div class="report-date">
                📅 ${escapeHTML(report.Date || "")}
            </div>

        `;


        reportsContainer.appendChild(card);

    });
}


// =========================
// HTML Security
// =========================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================
// Refresh Button
// =========================

refreshButton.addEventListener(
    "click",
    loadReports
);


// =========================
// Initial Load
// =========================

loadReports();
