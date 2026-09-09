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

    renderHomeRecentReports(reports);
}

// =====================================
// Home Recent Reports
// =====================================

function escapeHomeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getHomeStatusMeta(status) {
    const value = String(status || "").trim().toLowerCase();
    if (value === "solved" || value === "সমাধান হয়েছে" || value === "সমাধান হয়েছে") {
        return { label: "সমাধান হয়েছে", className: "solved", icon: "✓" };
    }
    if (value === "কাজ চলছে" || value === "in progress" || value === "progress") {
        return { label: "কাজ চলছে", className: "progress", icon: "◷" };
    }
    return { label: "চলমান", className: "pending", icon: "!" };
}

function getHomeCategoryIcon(category) {
    const icons = {
        "রাস্তা": "🛣️", "ড্রেন ও জলাবদ্ধতা": "🌊", "ড্রেনেজ": "🌊",
        "ময়লা-আবর্জনা": "🗑️", "ময়লা-আবর্জনা": "🗑️", "রাস্তার বাতি": "💡",
        "বিদ্যুৎ": "⚡", "পানি": "💧", "পানির সমস্যা": "💧", "পরিবেশ": "🌳",
        "নিরাপত্তা": "🛡️"
    };
    return icons[category] || "📌";
}

function renderHomeRecentReports(reports) {
    const container = document.getElementById("homeRecentReports");
    if (!container) return;

    const latest = Array.isArray(reports) ? [...reports].reverse().slice(0, 4) : [];
    if (!latest.length) {
        container.innerHTML = '<div class="home-recent-empty">এখনও কোনো রিপোর্ট পাওয়া যায়নি।</div>';
        return;
    }

    container.innerHTML = latest.map(report => {
        const status = getHomeStatusMeta(report.Status);
        const category = report.Category || "অন্যান্য";
        const title = report.Description || category || "নাগরিক সমস্যা";
        const location = [report.Area, report.Upazila, report.District].filter(Boolean).slice(0,2).join(", ") || report.Division || "এলাকা উল্লেখ নেই";
        return `
            <a class="home-recent-card" href="dashboard.html#reports" aria-label="${escapeHomeHTML(title)}">
                <div class="home-recent-icon">${getHomeCategoryIcon(category)}</div>
                <div class="home-recent-content">
                    <div class="home-recent-top"><span class="home-status ${status.className}">${status.icon} ${status.label}</span><span class="home-recent-category">${escapeHomeHTML(category)}</span></div>
                    <h3>${escapeHomeHTML(title).slice(0, 120)}</h3>
                    <p>📍 ${escapeHomeHTML(location)}</p>
                    <small>🕒 ${escapeHomeHTML(report.Date || "তারিখ নেই")}</small>
                </div>
                <span class="home-recent-arrow" aria-hidden="true">→</span>
            </a>`;
    }).join("");
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
