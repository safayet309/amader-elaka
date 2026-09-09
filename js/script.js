// =====================================
// Amader Elaka - Main JavaScript
// =====================================

const REPORT_TABLE = "Reports";
const REPORT_CACHE_KEY = "amaderElaka_reports_cache";
const REPORT_CACHE_TIME = 60 * 1000; // 1 minute

console.log("Amader Elaka loaded successfully.");

// =====================================
// Load Reports for Home Statistics
// =====================================

async function loadHomeStatistics() {
    const cachedReports = getCachedReports();

    if (cachedReports) {
        updateHomeStatistics(cachedReports);
        return;
    }

    try {
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

        const reports = Array.isArray(data) ? data : [];

        saveCachedReports(reports);
        updateHomeStatistics(reports);

    } catch (error) {
        console.error("Home Statistics Error:", error);

        // Try older cache if API is unavailable
        const oldReports = getCachedReports(true);

        if (oldReports) {
            updateHomeStatistics(oldReports);
        } else {
            updateHomeStatistics([]);
        }
    }
}

// =====================================
// Get Cached Reports
// =====================================

function getCachedReports(ignoreExpiry = false) {
    try {
        const cached = localStorage.getItem(REPORT_CACHE_KEY);

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

        const age = Date.now() - Number(data.time);

        if (!ignoreExpiry && age > REPORT_CACHE_TIME) {
            return null;
        }

        return data.reports;

    } catch (error) {
        console.error("Cache Read Error:", error);
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
        console.error("Cache Save Error:", error);
    }
}

// =====================================
// Clear Report Cache
// Can be used by other JS files
// =====================================

function clearReportCache() {
    try {
        localStorage.removeItem(REPORT_CACHE_KEY);
    } catch (error) {
        console.error("Cache Clear Error:", error);
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
        return String(report.Status || "")
            .trim()
            .toLowerCase() === "pending";
    }).length;

    const progress = reports.filter(function (report) {
        const status = String(report.Status || "").trim();

        return (
            status === "কাজ চলছে" ||
            status.toLowerCase() === "in progress" ||
            status.toLowerCase() === "progress"
        );
    }).length;

    const solved = reports.filter(function (report) {
        const status = String(report.Status || "").trim();

        return (
            status === "সমাধান হয়েছে" ||
            status === "সমাধান হয়েছে" ||
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
