// =====================================
// Amader Elaka - Main JavaScript
// =====================================

const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

console.log("Amader Elaka loaded successfully.");


// =====================================
// Load Reports for Home Statistics
// =====================================

async function loadHomeStatistics() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load reports");
        }

        const reports = await response.json();

        updateHomeStatistics(reports);

    } catch (error) {
        console.error("Home Statistics Error:", error);

        // Keep the existing 0 values if API is unavailable
        updateHomeStatistics([]);
    }
}


// =====================================
// Update Home Statistics
// =====================================

function updateHomeStatistics(reports) {

    const totalReports = document.getElementById("totalReports");
    const pendingReports = document.getElementById("pendingReports");
    const progressReports = document.getElementById("progressReports");
    const solvedReports = document.getElementById("solvedReports");

    if (!totalReports) return;

    const total = reports.length;

    const pending = reports.filter(function (report) {
        return String(report.Status || "").trim().toLowerCase() === "pending";
    }).length;

    const progress = reports.filter(function (report) {
        const status = String(report.Status || "").trim();

        return (
            status === "কাজ চলছে" ||
            status.toLowerCase() === "in progress"
        );
    }).length;

    const solved = reports.filter(function (report) {
        const status = String(report.Status || "").trim();

        return (
            status === "সমাধান হয়েছে" ||
            status.toLowerCase() === "solved"
        );
    }).length;


    // =====================================
    // Animate Numbers
    // =====================================

    animateNumber(totalReports, total);
    animateNumber(pendingReports, pending);
    animateNumber(progressReports, progress);
    animateNumber(solvedReports, solved);
}


// =====================================
// Number Animation
// =====================================

function animateNumber(element, target) {

    if (!element) return;

    const start = Number(element.textContent) || 0;

    if (start === target) {
        element.textContent = target;
        return;
    }

    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        const value = Math.floor(
            start + (target - start) * progress
        );

        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}


// =====================================
// Start Home Statistics
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("totalReports")) {
        loadHomeStatistics();
    }

});
