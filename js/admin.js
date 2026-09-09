const REPORT_TABLE = "Reports";
const CATEGORY_TABLE = "Categories";

const REPORT_CACHE_KEY = "amaderElaka_reports_cache";
const REPORT_CACHE_TIME = 60 * 1000;

const CATEGORY_CACHE_KEY = "amaderElaka_categories_cache";
const CATEGORY_CACHE_TIME = 10 * 60 * 1000;

let allReports = [];
let categories = [];
let editingReport = null;
let editingCategoryIndex = null;
let adminInitialized = false;
let originalBodyDisplays = new Map();

document.addEventListener("DOMContentLoaded", () => {
    initializeAdminAuth();
});

/* =========================
   ADMIN AUTH
========================= */

async function initializeAdminAuth() {
    const loginScreen = document.getElementById("adminLoginScreen");
    const loginForm = document.getElementById("adminLoginForm");

    if (!loginScreen || !loginForm) {
        console.error("Admin login screen not found.");
        return;
    }

    loginForm.addEventListener("submit", handleAdminLogin);

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Auth session error:", error);
        showLoginScreen();
        return;
    }

    if (data?.session) {
        await showAdminPanel();
    } else {
        showLoginScreen();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            showAdminPanel();
        } else {
            adminInitialized = false;
            allReports = [];
            categories = [];
            clearReportCache();
            clearCategoryCache();
            showLoginScreen();
        }
    });
}

async function handleAdminLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const button = document.getElementById("adminLoginButton");
    const errorElement = document.getElementById("adminLoginError");

    const email = String(emailInput?.value || "").trim();
    const password = String(passwordInput?.value || "");

    if (errorElement) {
        errorElement.style.display = "none";
        errorElement.textContent = "";
    }

    if (button) {
        button.disabled = true;
        button.textContent = "লগইন হচ্ছে...";
    }

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        if (!data?.session) {
            throw new Error("লগইন সেশন তৈরি হয়নি।");
        }

        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "";

        clearReportCache();
        clearCategoryCache();

        await showAdminPanel();

    } catch (error) {
        console.error("Admin login error:", error);

        if (errorElement) {
            errorElement.textContent =
                error.message === "Invalid login credentials"
                    ? "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।"
                    : error.message || "লগইন করা যায়নি.";

            errorElement.style.display = "block";
        }
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "লগইন করুন";
        }
    }
}

function showLoginScreen() {
    const loginScreen =
        document.getElementById("adminLoginScreen");

    saveAndHideAdminContent();

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}

async function showAdminPanel() {
    const loginScreen =
        document.getElementById("adminLoginScreen");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    restoreAdminContent();
    setupLogoutButton();

    if (!adminInitialized) {
        adminInitialized = true;

        clearReportCache();
        clearCategoryCache();

        await initializeAdmin(true);
    } else {
        await loadCategories(true);
        await loadReports(true);
    }
}

function saveAndHideAdminContent() {
    const loginScreen =
        document.getElementById("adminLoginScreen");

    document.querySelectorAll("body > *").forEach(element => {
        if (
            element === loginScreen ||
            element.tagName === "SCRIPT"
        ) {
            return;
        }

        if (!originalBodyDisplays.has(element)) {
            originalBodyDisplays.set(
                element,
                element.style.display
            );
        }

        element.style.display = "none";
    });
}

function restoreAdminContent() {
    originalBodyDisplays.forEach((display, element) => {
        if (
            element &&
            element !== document.getElementById("adminLoginScreen")
        ) {
            element.style.display = display;
        }
    });
}

/* =========================
   LOGOUT
========================= */

function setupLogoutButton() {
    const userBox =
        document.querySelector(".admin-user");

    if (!userBox) return;

    let button =
        document.getElementById("adminLogoutBtn");

    if (button) return;

    button = document.createElement("button");

    button.id = "adminLogoutBtn";
    button.type = "button";
    button.textContent = "Logout";

    button.style.marginLeft = "12px";
    button.style.padding = "8px 12px";
    button.style.border = "1px solid #d1d5db";
    button.style.borderRadius = "8px";
    button.style.background = "#fff";
    button.style.color = "#374151";
    button.style.fontSize = "13px";
    button.style.fontWeight = "600";
    button.style.cursor = "pointer";

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Logging out...";

        try {
            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            allReports = [];
            categories = [];
            adminInitialized = false;

            clearReportCache();
            clearCategoryCache();

        } catch (error) {
            console.error("Logout error:", error);

            button.disabled = false;
            button.textContent = "Logout";

            showAdminMessage(
                "সমস্যা হয়েছে",
                error.message || "Logout করা যায়নি।",
                "error"
            );
        }
    });

    userBox.appendChild(button);
}

/* =========================
   ADMIN INITIALIZE
========================= */

async function initializeAdmin(forceRefresh = false) {
    setupNavigation();
    setupReportEvents();
    setupCategoryEvents();

    await loadCategories(forceRefresh);
    await loadReports(forceRefresh);
}

/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
    document.querySelectorAll(".admin-nav-item").forEach(item => {
        item.addEventListener("click", () => {
            switchSection(item.dataset.section);
        });
    });

    document.querySelectorAll("[data-section-target]").forEach(button => {
        button.addEventListener("click", () => {
            switchSection(button.dataset.sectionTarget);
        });
    });
}

function switchSection(section) {
    document.querySelectorAll(".admin-nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.section === section
        );
    });

    document.querySelectorAll(".admin-section").forEach(element => {
        element.classList.remove("active");
    });

    const target =
        document.getElementById(`${section}Section`);

    if (target) {
        target.classList.add("active");
    }

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");

    if (section === "overview") {
        if (title) title.textContent = "ড্যাশবোর্ড";

        if (subtitle) {
            subtitle.textContent =
                "আপনার এলাকার রিপোর্টগুলো পরিচালনা করুন";
        }
    }

    if (section === "reports") {
        if (title) title.textContent = "রিপোর্টসমূহ";

        if (subtitle) {
            subtitle.textContent =
                "সব রিপোর্ট দেখুন ও পরিচালনা করুন";
        }
    }

    if (section === "categories") {
        if (title) title.textContent = "ক্যাটাগরি";

        if (subtitle) {
            subtitle.textContent =
                "রিপোর্টের সমস্যা ক্যাটাগরি পরিচালনা করুন";
        }
    }
}

/* =========================
   REPORT CACHE
========================= */

function getCachedReports(ignoreExpiry = false) {
    try {
        const cached =
            localStorage.getItem(REPORT_CACHE_KEY);

        if (!cached) return null;

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
            "Report Cache Read Error:",
            error
        );

        return null;
    }
}

function saveCachedReports(reports) {
    try {
        localStorage.setItem(
            REPORT_CACHE_KEY,
            JSON.stringify({
                time: Date.now(),
                reports
            })
        );
    } catch (error) {
        console.error(
            "Report Cache Save Error:",
            error
        );
    }
}

function clearReportCache() {
    try {
        localStorage.removeItem(
            REPORT_CACHE_KEY
        );
    } catch (error) {
        console.error(
            "Report Cache Clear Error:",
            error
        );
    }
}

/* =========================
   CATEGORY CACHE
========================= */

function getCachedCategories(ignoreExpiry = false) {
    try {
        const cached =
            localStorage.getItem(
                CATEGORY_CACHE_KEY
            );

        if (!cached) return null;

        const data = JSON.parse(cached);

        if (
            !data ||
            !Array.isArray(data.categories) ||
            !data.time
        ) {
            return null;
        }

        const age =
            Date.now() - Number(data.time);

        if (
            !ignoreExpiry &&
            age > CATEGORY_CACHE_TIME
        ) {
            return null;
        }

        return data.categories;

    } catch (error) {
        console.error(
            "Category Cache Read Error:",
            error
        );

        return null;
    }
}

function saveCachedCategories(data) {
    try {
        localStorage.setItem(
            CATEGORY_CACHE_KEY,
            JSON.stringify({
                time: Date.now(),
                categories: data
            })
        );
    } catch (error) {
        console.error(
            "Category Cache Save Error:",
            error
        );
    }
}

function clearCategoryCache() {
    try {
        localStorage.removeItem(
            CATEGORY_CACHE_KEY
        );
    } catch (error) {
        console.error(
            "Category Cache Clear Error:",
            error
        );
    }
}

/* =========================
   REPORTS
========================= */

async function loadReports(forceRefresh = false) {
    const table =
        document.getElementById(
            "adminReportsTable"
        );

    const recent =
        document.getElementById(
            "recentReports"
        );

    if (!forceRefresh) {
        const cachedReports =
            getCachedReports();

        if (
            Array.isArray(cachedReports) &&
            cachedReports.length > 0
        ) {
            allReports = cachedReports;

            updateStatistics();
            createFilterOptions();
            displayReports(allReports);
            displayRecentReports();

            return;
        }
    }

    if (table) {
        table.innerHTML =
            '<div class="admin-loading">রিপোর্ট লোড হচ্ছে...</div>';
    }

    if (recent) {
        recent.innerHTML =
            '<div class="admin-loading">রিপোর্ট লোড হচ্ছে...</div>';
    }

    try {
        const { data, error } =
            await supabaseClient
                .from(REPORT_TABLE)
                .select("*")
                .order("Date", {
                    ascending: true
                });

        if (error) {
            throw error;
        }

        allReports =
            Array.isArray(data)
                ? data
                : [];

        saveCachedReports(allReports);

        updateStatistics();
        createFilterOptions();
        displayReports(allReports);
        displayRecentReports();

    } catch (error) {
        console.error(
            "Report loading error:",
            error
        );

        const oldReports =
            getCachedReports(true);

        if (
            Array.isArray(oldReports) &&
            oldReports.length > 0
        ) {
            allReports = oldReports;

            updateStatistics();
            createFilterOptions();
            displayReports(allReports);
            displayRecentReports();

            return;
        }

        allReports = [];

        updateStatistics();

        if (table) {
            table.innerHTML =
                '<div class="admin-empty">⚠️ রিপোর্ট লোড করা যায়নি।</div>';
        }

        if (recent) {
            recent.innerHTML =
                '<div class="admin-empty">⚠️ রিপোর্ট লোড করা যায়নি।</div>';
        }
    }
}

/* =========================
   REPORT STATISTICS
========================= */

function updateStatistics() {
    const total =
        allReports.length;

    const pending =
        allReports.filter(
            report =>
                normalizeStatus(
                    report.Status
                ) === "pending"
        ).length;

    const progress =
        allReports.filter(
            report =>
                normalizeStatus(
                    report.Status
                ) === "progress"
        ).length;

    const solved =
        allReports.filter(
            report =>
                normalizeStatus(
                    report.Status
                ) === "solved"
        ).length;

    setNumber(
        "adminTotalReports",
        total
    );

    setNumber(
        "adminPendingReports",
        pending
    );

    setNumber(
        "adminProgressReports",
        progress
    );

    setNumber(
        "adminSolvedReports",
        solved
    );
}

function setNumber(id, value) {
    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent = value;
}

/* =========================
   STATUS
========================= */

function normalizeStatus(status) {
    const value =
        String(status || "")
            .trim()
            .toLowerCase();

    if (value === "pending") {
        return "pending";
    }

    if (
        value === "কাজ চলছে" ||
        value === "in progress" ||
        value === "progress"
    ) {
        return "progress";
    }

    if (
        value === "সমাধান হয়েছে" ||
        value === "সমাধান হয়েছে" ||
        value === "solved"
    ) {
        return "solved";
    }

    return "other";
}

function statusLabel(status) {
    const type =
        normalizeStatus(status);

    if (type === "pending") {
        return "Pending";
    }

    if (type === "progress") {
        return "কাজ চলছে";
    }

    if (type === "solved") {
        return "সমাধান হয়েছে";
    }

    return status || "Unknown";
}

function statusClass(status) {
    const type =
        normalizeStatus(status);

    if (type === "pending") {
        return "status-pending";
    }

    if (type === "progress") {
        return "status-progress";
    }

    if (type === "solved") {
        return "status-solved";
    }

    return "status-default";
}

/* =========================
   FILTERS
========================= */

function createFilterOptions() {
    const categorySelect =
        document.getElementById(
            "adminCategoryFilter"
        );

    const divisionSelect =
        document.getElementById(
            "adminDivisionFilter"
        );

    if (categorySelect) {
        const currentValue =
            categorySelect.value;

        categorySelect.innerHTML =
            '<option value="">সব ক্যাটাগরি</option>';

        categories.forEach(category => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.Name;

            option.textContent =
                category.Name;

            categorySelect.appendChild(
                option
            );
        });

        if (
            [...categorySelect.options]
                .some(
                    option =>
                        option.value ===
                        currentValue
                )
        ) {
            categorySelect.value =
                currentValue;
        }
    }

    if (divisionSelect) {
        const currentValue =
            divisionSelect.value;

        divisionSelect.innerHTML =
            '<option value="">সব বিভাগ</option>';

        const divisions = [
            ...new Set(
                allReports
                    .map(
                        report =>
                            String(
                                report.Division ||
                                ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ];

        divisions.forEach(division => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                division;

            option.textContent =
                division;

            divisionSelect.appendChild(
                option
            );
        });

        if (
            [...divisionSelect.options]
                .some(
                    option =>
                        option.value ===
                        currentValue
                )
        ) {
            divisionSelect.value =
                currentValue;
        }
    }
}

function setupReportEvents() {
    const search =
        document.getElementById(
            "adminReportSearch"
        );

    const status =
        document.getElementById(
            "adminStatusFilter"
        );

    const category =
        document.getElementById(
            "adminCategoryFilter"
        );

    const division =
        document.getElementById(
            "adminDivisionFilter"
        );

    const reset =
        document.getElementById(
            "resetAdminFilters"
        );

    const refresh =
        document.getElementById(
            "refreshReportsBtn"
        );

    if (search) {
        search.addEventListener(
            "input",
            applyReportFilters
        );
    }

    if (status) {
        status.addEventListener(
            "change",
            applyReportFilters
        );
    }

    if (category) {
        category.addEventListener(
            "change",
            applyReportFilters
        );
    }

    if (division) {
        division.addEventListener(
            "change",
            applyReportFilters
        );
    }

    if (reset) {
        reset.addEventListener(
            "click",
            () => {
                if (search) {
                    search.value = "";
                }

                if (status) {
                    status.value = "";
                }

                if (category) {
                    category.value = "";
                }

                if (division) {
                    division.value = "";
                }

                displayReports(
                    allReports
                );
            }
        );
    }

    if (refresh) {
        refresh.addEventListener(
            "click",
            async () => {
                refresh.disabled = true;

                const oldText =
                    refresh.textContent;

                refresh.textContent =
                    "লোড হচ্ছে...";

                try {
                    clearReportCache();
                    clearCategoryCache();

                    await loadCategories(true);
                    await loadReports(true);

                } finally {
                    refresh.disabled = false;
                    refresh.textContent =
                        oldText;
                }
            }
        );
    }
}

function applyReportFilters() {
    const search =
        String(
            document.getElementById(
                "adminReportSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();

    const status =
        document.getElementById(
            "adminStatusFilter"
        )?.value || "";

    const category =
        document.getElementById(
            "adminCategoryFilter"
        )?.value || "";

    const division =
        document.getElementById(
            "adminDivisionFilter"
        )?.value || "";

    const filtered =
        allReports.filter(report => {
            const searchable = [
                report.ID,
                report.Area,
                report.Description,
                report.District,
                report.Upazila,
                report.Division,
                report.Category,
                report.Ward,
                report.AdminNote
            ]
                .map(
                    value =>
                        String(
                            value || ""
                        ).toLowerCase()
                )
                .join(" ");

            return (
                (!search ||
                    searchable.includes(
                        search
                    )) &&
                (!status ||
                    normalizeStatus(
                        report.Status
                    ) === status) &&
                (!category ||
                    report.Category ===
                        category) &&
                (!division ||
                    report.Division ===
                        division)
            );
        });

    displayReports(filtered);
}
/* =========================
   REPORT DISPLAY
========================= */

function displayReports(reports) {
    const container =
        document.getElementById(
            "adminReportsTable"
        );

    if (!container) return;

    if (
        !Array.isArray(reports) ||
        reports.length === 0
    ) {
        container.innerHTML =
            '<div class="admin-empty">কোনো রিপোর্ট পাওয়া যায়নি।</div>';

        return;
    }

    container.innerHTML = reports
        .map(report => createReportCard(report))
        .join("");

    container
        .querySelectorAll("[data-report-action]")
        .forEach(button => {
            button.addEventListener(
                "click",
                handleReportAction
            );
        });
}

function createReportCard(report) {
    const id =
        escapeHtml(
            report.ID ||
            report.id ||
            "N/A"
        );

    const category =
        escapeHtml(
            report.Category ||
            "অনির্দিষ্ট"
        );

    const area =
        escapeHtml(
            report.Area ||
            "এলাকা উল্লেখ নেই"
        );

    const division =
        escapeHtml(
            report.Division ||
            ""
        );

    const district =
        escapeHtml(
            report.District ||
            ""
        );

    const upazila =
        escapeHtml(
            report.Upazila ||
            ""
        );

    const description =
        escapeHtml(
            report.Description ||
            "কোনো বিবরণ নেই"
        );

    const status =
        report.Status ||
        "Unknown";

    const date =
        formatAdminDate(
            report.Date
        );

    const statusText =
        escapeHtml(
            statusLabel(status)
        );

    const statusCss =
        statusClass(status);

    return `
        <div class="admin-report-card">
            <div class="admin-report-card-header">
                <div>
                    <span class="admin-report-id">
                        #${id}
                    </span>

                    <span class="admin-report-category">
                        ${category}
                    </span>
                </div>

                <span class="admin-status ${statusCss}">
                    ${statusText}
                </span>
            </div>

            <div class="admin-report-card-body">
                <h3>${area}</h3>

                <p class="admin-report-location">
                    ${division}
                    ${district ? ` • ${district}` : ""}
                    ${upazila ? ` • ${upazila}` : ""}
                </p>

                <p class="admin-report-description">
                    ${description}
                </p>
            </div>

            <div class="admin-report-card-footer">
                <span>${date}</span>

                <div class="admin-report-actions">
                    <button
                        type="button"
                        class="admin-action-btn"
                        data-report-action="view"
                        data-report-id="${escapeAttribute(
                            report.ID || report.id || ""
                        )}"
                    >
                        দেখুন
                    </button>

                    <button
                        type="button"
                        class="admin-action-btn"
                        data-report-action="edit"
                        data-report-id="${escapeAttribute(
                            report.ID || report.id || ""
                        )}"
                    >
                        সম্পাদনা
                    </button>

                    <button
                        type="button"
                        class="admin-action-btn danger"
                        data-report-action="delete"
                        data-report-id="${escapeAttribute(
                            report.ID || report.id || ""
                        )}"
                    >
                        মুছুন
                    </button>
                </div>
            </div>
        </div>
    `;
}

function displayRecentReports() {
    const container =
        document.getElementById(
            "recentReports"
        );

    if (!container) return;

    if (
        !Array.isArray(allReports) ||
        allReports.length === 0
    ) {
        container.innerHTML =
            '<div class="admin-empty">কোনো সাম্প্রতিক রিপোর্ট নেই।</div>';

        return;
    }

    const recent =
        [...allReports]
            .sort(
                (a, b) =>
                    new Date(
                        b.Date || 0
                    ) -
                    new Date(
                        a.Date || 0
                    )
            )
            .slice(0, 5);

    container.innerHTML = recent
        .map(report => {
            const id =
                escapeHtml(
                    report.ID ||
                    report.id ||
                    "N/A"
                );

            const area =
                escapeHtml(
                    report.Area ||
                    "এলাকা উল্লেখ নেই"
                );

            const category =
                escapeHtml(
                    report.Category ||
                    "অনির্দিষ্ট"
                );

            const status =
                report.Status ||
                "Unknown";

            return `
                <div class="admin-recent-item">
                    <div class="admin-recent-main">
                        <strong>#${id}</strong>

                        <span>
                            ${area}
                        </span>

                        <small>
                            ${category}
                        </small>
                    </div>

                    <span class="admin-status ${statusClass(status)}">
                        ${escapeHtml(
                            statusLabel(status)
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
}

/* =========================
   REPORT ACTIONS
========================= */

async function handleReportAction(event) {
    const button =
        event.currentTarget;

    const action =
        button.dataset.reportAction;

    const reportId =
        button.dataset.reportId;

    if (!action || !reportId) return;

    const report =
        allReports.find(
            item =>
                String(
                    item.ID ||
                    item.id ||
                    ""
                ) === String(reportId)
        );

    if (!report) {
        showAdminMessage(
            "রিপোর্ট পাওয়া যায়নি",
            "রিপোর্টটি তালিকায় পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    if (action === "view") {
        showReportDetails(report);
        return;
    }

    if (action === "edit") {
        openReportEdit(report);
        return;
    }

    if (action === "delete") {
        await deleteReport(report);
    }
}

function showReportDetails(report) {
    const existing =
        document.getElementById(
            "adminReportDetailsModal"
        );

    if (existing) {
        existing.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "adminReportDetailsModal";

    modal.className =
        "admin-modal";

    modal.innerHTML = `
        <div class="admin-modal-overlay"
             data-close-report-modal></div>

        <div class="admin-modal-content">

            <div class="admin-modal-header">
                <h2>রিপোর্টের বিস্তারিত</h2>

                <button
                    type="button"
                    class="admin-modal-close"
                    data-close-report-modal
                >
                    ×
                </button>
            </div>

            <div class="admin-modal-body">

                <div class="admin-detail-grid">

                    <div>
                        <label>রিপোর্ট ID</label>
                        <p>${escapeHtml(
                            report.ID ||
                            report.id ||
                            "N/A"
                        )}</p>
                    </div>

                    <div>
                        <label>ক্যাটাগরি</label>
                        <p>${escapeHtml(
                            report.Category ||
                            "অনির্দিষ্ট"
                        )}</p>
                    </div>

                    <div>
                        <label>বিভাগ</label>
                        <p>${escapeHtml(
                            report.Division ||
                            "—"
                        )}</p>
                    </div>

                    <div>
                        <label>জেলা</label>
                        <p>${escapeHtml(
                            report.District ||
                            "—"
                        )}</p>
                    </div>

                    <div>
                        <label>উপজেলা</label>
                        <p>${escapeHtml(
                            report.Upazila ||
                            "—"
                        )}</p>
                    </div>

                    <div>
                        <label>ওয়ার্ড</label>
                        <p>${escapeHtml(
                            report.Ward ||
                            "—"
                        )}</p>
                    </div>

                    <div>
                        <label>এলাকা</label>
                        <p>${escapeHtml(
                            report.Area ||
                            "—"
                        )}</p>
                    </div>

                    <div>
                        <label>স্ট্যাটাস</label>
                        <p>
                            <span class="admin-status ${statusClass(
                                report.Status
                            )}">
                                ${escapeHtml(
                                    statusLabel(
                                        report.Status
                                    )
                                )}
                            </span>
                        </p>
                    </div>

                </div>

                <div class="admin-detail-block">
                    <label>বিবরণ</label>
                    <p>
                        ${escapeHtml(
                            report.Description ||
                            "কোনো বিবরণ নেই"
                        )}
                    </p>
                </div>

                <div class="admin-detail-block">
                    <label>Admin Note</label>
                    <p>
                        ${escapeHtml(
                            report.AdminNote ||
                            "কোনো নোট নেই"
                        )}
                    </p>
                </div>

                <div class="admin-detail-block">
                    <label>তারিখ</label>
                    <p>
                        ${escapeHtml(
                            formatAdminDate(
                                report.Date
                            )
                        )}
                    </p>
                </div>

            </div>

            <div class="admin-modal-footer">
                <button
                    type="button"
                    class="admin-btn secondary"
                    data-close-report-modal
                >
                    বন্ধ করুন
                </button>

                <button
                    type="button"
                    class="admin-btn primary"
                    data-edit-report-from-details
                >
                    সম্পাদনা
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    modal
        .querySelectorAll(
            "[data-close-report-modal]"
        )
        .forEach(element => {
            element.addEventListener(
                "click",
                () => {
                    modal.remove();
                }
            );
        });

    const editButton =
        modal.querySelector(
            "[data-edit-report-from-details]"
        );

    if (editButton) {
        editButton.addEventListener(
            "click",
            () => {
                modal.remove();
                openReportEdit(report);
            }
        );
    }

    requestAnimationFrame(() => {
        modal.classList.add("active");
    });
}

/* =========================
   REPORT EDIT
========================= */

function openReportEdit(report) {
    editingReport = report;

    const modal =
        document.getElementById(
            "reportModal"
        );

    if (!modal) {
        showAdminMessage(
            "সম্পাদনা করা যাচ্ছে না",
            "Report modal পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    setFormValue(
        "editReportId",
        report.ID || report.id || ""
    );

    setFormValue(
        "editReportStatus",
        report.Status || ""
    );

    setFormValue(
        "editReportCategory",
        report.Category || ""
    );

    setFormValue(
        "editReportAdminNote",
        report.AdminNote || ""
    );

    modal.classList.add("active");

    if (modal.style) {
        modal.style.display = "flex";
    }
}

function closeReportModal() {
    const modal =
        document.getElementById(
            "reportModal"
        );

    if (!modal) return;

    modal.classList.remove("active");

    if (
        !modal.classList.contains(
            "admin-modal"
        )
    ) {
        modal.style.display = "none";
    }

    editingReport = null;
}

async function saveReportChanges(event) {
    if (event) {
        event.preventDefault();
    }

    if (!editingReport) {
        showAdminMessage(
            "রিপোর্ট নির্বাচন করুন",
            "কোনো রিপোর্ট সম্পাদনার জন্য নির্বাচন করা হয়নি।",
            "error"
        );

        return;
    }

    const id =
        editingReport.ID ||
        editingReport.id;

    const status =
        getFormValue(
            "editReportStatus"
        );

    const category =
        getFormValue(
            "editReportCategory"
        );

    const adminNote =
        getFormValue(
            "editReportAdminNote"
        );

    try {
        const updateData = {
            Status: status,
            Category: category,
            AdminNote: adminNote
        };

        const { error } =
            await supabaseClient
                .from(REPORT_TABLE)
                .update(updateData)
                .eq("ID", id);

        if (error) {
            throw error;
        }

        showAdminMessage(
            "সফল হয়েছে",
            "রিপোর্ট সফলভাবে আপডেট হয়েছে।",
            "success"
        );

        closeReportModal();

        clearReportCache();

        await loadReports(true);

    } catch (error) {
        console.error(
            "Report update error:",
            error
        );

        showAdminMessage(
            "আপডেট ব্যর্থ",
            error.message ||
                "রিপোর্ট আপডেট করা যায়নি।",
            "error"
        );
    }
}

async function deleteReport(report) {
    const id =
        report.ID ||
        report.id;

    const confirmed =
        window.confirm(
            `রিপোর্ট #${id} কি সত্যিই মুছে ফেলতে চান?`
        );

    if (!confirmed) return;

    try {
        const { error } =
            await supabaseClient
                .from(REPORT_TABLE)
                .delete()
                .eq("ID", id);

        if (error) {
            throw error;
        }

        allReports =
            allReports.filter(
                item =>
                    String(
                        item.ID ||
                        item.id ||
                        ""
                    ) !== String(id)
            );

        saveCachedReports(allReports);

        updateStatistics();
        createFilterOptions();
        displayReports(allReports);
        displayRecentReports();

        showAdminMessage(
            "মুছে ফেলা হয়েছে",
            "রিপোর্ট সফলভাবে মুছে ফেলা হয়েছে।",
            "success"
        );

    } catch (error) {
        console.error(
            "Report delete error:",
            error
        );

        showAdminMessage(
            "মুছে ফেলা যায়নি",
            error.message ||
                "রিপোর্ট মুছে ফেলা যায়নি।",
            "error"
        );
    }
}

/* =========================
   CATEGORY LOADING
========================= */

async function loadCategories(forceRefresh = false) {
    if (!forceRefresh) {
        const cached =
            getCachedCategories();

        if (
            Array.isArray(cached)
        ) {
            categories = cached;

            renderCategories();
            createFilterOptions();

            return;
        }
    }

    try {
        const { data, error } =
            await supabaseClient
                .from(CATEGORY_TABLE)
                .select("*")
                .order("Name", {
                    ascending: true
                });

        if (error) {
            throw error;
        }

        categories =
            Array.isArray(data)
                ? data
                : [];

        saveCachedCategories(
            categories
        );

        renderCategories();
        createFilterOptions();

    } catch (error) {
        console.error(
            "Category loading error:",
            error
        );

        const cached =
            getCachedCategories(true);

        if (
            Array.isArray(cached)
        ) {
            categories = cached;

            renderCategories();
            createFilterOptions();

            return;
        }

        categories = [];

        renderCategories();
        createFilterOptions();
    }
}

/* =========================
   CATEGORY EVENTS
========================= */

function setupCategoryEvents() {
    const addButton =
        document.getElementById(
            "addCategoryBtn"
        );

    const refreshButton =
        document.getElementById(
            "refreshCategoriesBtn"
        );

    const form =
        document.getElementById(
            "categoryForm"
        );

    if (addButton) {
        addButton.addEventListener(
            "click",
            () => {
                openCategoryModal();
            }
        );
    }

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            async () => {
                refreshButton.disabled = true;

                const oldText =
                    refreshButton.textContent;

                refreshButton.textContent =
                    "লোড হচ্ছে...";

                try {
                    clearCategoryCache();

                    await loadCategories(
                        true
                    );
                } finally {
                    refreshButton.disabled =
                        false;

                    refreshButton.textContent =
                        oldText;
                }
            }
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            saveCategory
        );
    }
}

function renderCategories() {
    const container =
        document.getElementById(
            "adminCategoriesList"
        );

    if (!container) return;

    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {
        container.innerHTML =
            '<div class="admin-empty">কোনো ক্যাটাগরি পাওয়া যায়নি।</div>';

        return;
    }

    container.innerHTML =
        categories
            .map(
                (category, index) => `
                    <div class="admin-category-item">

                        <div class="admin-category-info">
                            <strong>
                                ${escapeHtml(
                                    category.Name ||
                                    "Unnamed"
                                )}
                            </strong>

                            ${
                                category.Description
                                    ? `
                                        <small>
                                            ${escapeHtml(
                                                category.Description
                                            )}
                                        </small>
                                      `
                                    : ""
                            }
                        </div>

                        <div class="admin-category-actions">

                            <button
                                type="button"
                                class="admin-action-btn"
                                data-category-edit="${index}"
                            >
                                সম্পাদনা
                            </button>

                            <button
                                type="button"
                                class="admin-action-btn danger"
                                data-category-delete="${index}"
                            >
                                মুছুন
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");

    container
        .querySelectorAll(
            "[data-category-edit]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const index =
                        Number(
                            button.dataset
                                .categoryEdit
                        );

                    openCategoryModal(
                        categories[index],
                        index
                    );
                }
            );
        });

    container
        .querySelectorAll(
            "[data-category-delete]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const index =
                        Number(
                            button.dataset
                                .categoryDelete
                        );

                    await deleteCategory(
                        categories[index]
                    );
                }
            );
        });
}

function openCategoryModal(
    category = null,
    index = null
) {
    editingCategoryIndex =
        index;

    const modal =
        document.getElementById(
            "categoryModal"
        );

    const form =
        document.getElementById(
            "categoryForm"
        );

    if (!modal || !form) {
        return;
    }

    const nameInput =
        document.getElementById(
            "categoryName"
        );

    const descriptionInput =
        document.getElementById(
            "categoryDescription"
        );

    if (nameInput) {
        nameInput.value =
            category?.Name || "";
    }

    if (descriptionInput) {
        descriptionInput.value =
            category?.Description || "";
    }

    const title =
        modal.querySelector(
            ".admin-modal-title"
        );

    if (title) {
        title.textContent =
            category
                ? "ক্যাটাগরি সম্পাদনা"
                : "নতুন ক্যাটাগরি";
    }

    modal.classList.add("active");

    modal.style.display =
        "flex";
}

function closeCategoryModal() {
    const modal =
        document.getElementById(
            "categoryModal"
        );

    if (!modal) return;

    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "none";

    editingCategoryIndex =
        null;
}

async function saveCategory(event) {
    if (event) {
        event.preventDefault();
    }

    const name =
        getFormValue(
            "categoryName"
        );

    const description =
        getFormValue(
            "categoryDescription"
        );

    if (!name) {
        showAdminMessage(
            "তথ্য দিন",
            "ক্যাটাগরির নাম লিখুন।",
            "error"
        );

        return;
    }

    try {
        const payload = {
            Name: name,
            Description:
                description || null
        };

        let response;

        if (
            editingCategoryIndex !== null &&
            categories[
                editingCategoryIndex
            ]
        ) {
            const existing =
                categories[
                    editingCategoryIndex
                ];

            const categoryId =
                existing.id ??
                existing.ID;

            response =
                await supabaseClient
                    .from(CATEGORY_TABLE)
                    .update(payload)
                    .eq(
                        "id",
                        categoryId
                    );
        } else {
            response =
                await supabaseClient
                    .from(CATEGORY_TABLE)
                    .insert(
                        payload
                    );
        }

        if (response.error) {
            throw response.error;
        }

        clearCategoryCache();

        closeCategoryModal();

        await loadCategories(
            true
        );

        showAdminMessage(
            "সফল হয়েছে",
            "ক্যাটাগরি সফলভাবে সংরক্ষণ করা হয়েছে।",
            "success"
        );

    } catch (error) {
        console.error(
            "Category save error:",
            error
        );

        showAdminMessage(
            "সংরক্ষণ ব্যর্থ",
            error.message ||
                "ক্যাটাগরি সংরক্ষণ করা যায়নি।",
            "error"
        );
    }
}

async function deleteCategory(category) {
    if (!category) return;

    const categoryName =
        category.Name ||
        "এই ক্যাটাগরি";

    const confirmed =
        window.confirm(
            `"${categoryName}" ক্যাটাগরি মুছে ফেলতে চান?`
        );

    if (!confirmed) return;

    try {
        const categoryId =
            category.id ??
            category.ID;

        const { error } =
            await supabaseClient
                .from(CATEGORY_TABLE)
                .delete()
                .eq(
                    "id",
                    categoryId
                );

        if (error) {
            throw error;
        }

        clearCategoryCache();

        await loadCategories(
            true
        );

        showAdminMessage(
            "মুছে ফেলা হয়েছে",
            "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।",
            "success"
        );

    } catch (error) {
        console.error(
            "Category delete error:",
            error
        );

        showAdminMessage(
            "মুছে ফেলা যায়নি",
            error.message ||
                "ক্যাটাগরি মুছে ফেলা যায়নি।",
            "error"
        );
    }
}

/* =========================
   FORM HELPERS
========================= */

function getFormValue(id) {
    const element =
        document.getElementById(id);

    return String(
        element?.value || ""
    ).trim();
}

function setFormValue(
    id,
    value
) {
    const element =
        document.getElementById(id);

    if (!element) return;

    element.value =
        value ?? "";
}

function formatAdminDate(value) {
    if (!value) {
        return "তারিখ নেই";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "bn-BD",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function escapeHtml(value) {
    return String(
        value ?? ""
    )
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

function escapeAttribute(value) {
    return escapeHtml(value);
}

function showAdminMessage(
    title,
    message,
    type = "info"
) {
    const existing =
        document.getElementById(
            "adminMessagePopup"
        );

    if (existing) {
        existing.remove();
    }

    const popup =
        document.createElement(
            "div"
        );

    popup.id =
        "adminMessagePopup";

    popup.className =
        `admin-message-popup ${type}`;

    popup.innerHTML = `
        <div class="admin-message-inner">

            <button
                type="button"
                class="admin-message-close"
            >
                ×
            </button>

            <strong>
                ${escapeHtml(title)}
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>
    `;

    document.body.appendChild(
        popup
    );

    const close =
        popup.querySelector(
            ".admin-message-close"
        );

    if (close) {
        close.addEventListener(
            "click",
            () => popup.remove()
        );
    }

    setTimeout(() => {
        if (
            document.body.contains(
                popup
            )
        ) {
            popup.remove();
        }
    }, 5000);
}
/* =========================
   DISPLAY REPORTS
========================= */

function displayReports(reports) {
    const container =
        document.getElementById(
            "adminReportsTable"
        );

    if (!container) return;

    if (!reports.length) {
        container.innerHTML = `
            <div class="admin-empty">
                <div class="admin-empty-icon">📭</div>
                <h3>কোনো রিপোর্ট পাওয়া যায়নি</h3>
                <p>আপনার নির্বাচিত ফিল্টার অনুযায়ী কোনো রিপোর্ট নেই।</p>
            </div>
        `;

        return;
    }

    container.innerHTML = reports
        .map(
            report => `
                <div class="admin-report-row">

                    <div class="admin-report-main">

                        <div class="admin-report-top">

                            <span class="admin-report-id">
                                #${escapeHtml(
                                    report.ID ||
                                    report.id ||
                                    "N/A"
                                )}
                            </span>

                            <span class="admin-status ${statusClass(
                                report.Status
                            )}">
                                ${escapeHtml(
                                    statusLabel(
                                        report.Status
                                    )
                                )}
                            </span>

                        </div>

                        <h3>
                            ${escapeHtml(
                                report.Area ||
                                "এলাকা উল্লেখ নেই"
                            )}
                        </h3>

                        <div class="admin-report-meta">

                            <span>
                                📂
                                ${escapeHtml(
                                    report.Category ||
                                    "অনির্দিষ্ট"
                                )}
                            </span>

                            <span>
                                📍
                                ${escapeHtml(
                                    report.District ||
                                    "—"
                                )}
                            </span>

                            <span>
                                🕒
                                ${escapeHtml(
                                    formatAdminDate(
                                        report.Date
                                    )
                                )}
                            </span>

                        </div>

                        <p class="admin-report-description">
                            ${escapeHtml(
                                report.Description ||
                                "কোনো বিবরণ নেই"
                            )}
                        </p>

                    </div>

                    <div class="admin-report-actions">

                        <button
                            type="button"
                            class="admin-action-btn"
                            onclick="showReportDetailsById('${escapeAttribute(
                                report.ID ||
                                report.id ||
                                ""
                            )}')"
                        >
                            👁️ দেখুন
                        </button>

                        <button
                            type="button"
                            class="admin-action-btn"
                            onclick="openReportEditById('${escapeAttribute(
                                report.ID ||
                                report.id ||
                                ""
                            )}')"
                        >
                            ✏️ সম্পাদনা
                        </button>

                        <button
                            type="button"
                            class="admin-action-btn danger"
                            onclick="deleteReportById('${escapeAttribute(
                                report.ID ||
                                report.id ||
                                ""
                            )}')"
                        >
                            🗑️ মুছুন
                        </button>

                    </div>

                </div>
            `
        )
        .join("");
}

function showReportDetailsById(id) {
    const report =
        allReports.find(
            item =>
                String(
                    item.ID ||
                    item.id ||
                    ""
                ) === String(id)
        );

    if (!report) {
        showAdminMessage(
            "রিপোর্ট পাওয়া যায়নি",
            "নির্বাচিত রিপোর্টটি খুঁজে পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    showReportDetails(report);
}

function openReportEditById(id) {
    const report =
        allReports.find(
            item =>
                String(
                    item.ID ||
                    item.id ||
                    ""
                ) === String(id)
        );

    if (!report) {
        showAdminMessage(
            "রিপোর্ট পাওয়া যায়নি",
            "নির্বাচিত রিপোর্টটি খুঁজে পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    openReportEdit(report);
}

async function deleteReportById(id) {
    const report =
        allReports.find(
            item =>
                String(
                    item.ID ||
                    item.id ||
                    ""
                ) === String(id)
        );

    if (!report) {
        showAdminMessage(
            "রিপোর্ট পাওয়া যায়নি",
            "নির্বাচিত রিপোর্টটি খুঁজে পাওয়া যায়নি।",
            "error"
        );

        return;
    }

    await deleteReport(report);
}

/* =========================
   REPORT MODAL EVENTS
========================= */

function setupReportModalEvents() {
    const modal =
        document.getElementById(
            "reportModal"
        );

    if (!modal) return;

    modal
        .querySelectorAll(
            "[data-close-report-modal]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                closeReportModal
            );
        });

    const form =
        document.getElementById(
            "reportEditForm"
        );

    if (form) {
        form.addEventListener(
            "submit",
            saveReportChanges
        );
    }
}

/* =========================
   ADMIN UI HELPERS
========================= */

function normalizeStatus(status) {
    const value =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();

    if (
        value === "pending" ||
        value === "অপেক্ষমাণ" ||
        value === "pending "
    ) {
        return "pending";
    }

    if (
        value === "progress" ||
        value === "in progress" ||
        value === "processing" ||
        value === "চলমান"
    ) {
        return "progress";
    }

    if (
        value === "solved" ||
        value === "resolved" ||
        value === "completed" ||
        value === "সমাধান"
    ) {
        return "solved";
    }

    return value;
}

function statusLabel(status) {
    const normalized =
        normalizeStatus(status);

    if (normalized === "pending") {
        return "অপেক্ষমাণ";
    }

    if (normalized === "progress") {
        return "চলমান";
    }

    if (normalized === "solved") {
        return "সমাধান হয়েছে";
    }

    return status || "অজানা";
}

function statusClass(status) {
    const normalized =
        normalizeStatus(status);

    if (normalized === "pending") {
        return "pending";
    }

    if (normalized === "progress") {
        return "progress";
    }

    if (normalized === "solved") {
        return "solved";
    }

    return "unknown";
}

/* =========================
   KEYBOARD / MODAL SUPPORT
========================= */

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key !== "Escape"
        ) {
            return;
        }

        const categoryModal =
            document.getElementById(
                "categoryModal"
            );

        if (
            categoryModal &&
            categoryModal.classList.contains(
                "active"
            )
        ) {
            closeCategoryModal();
        }

        const reportModal =
            document.getElementById(
                "reportModal"
            );

        if (
            reportModal &&
            reportModal.classList.contains(
                "active"
            )
        ) {
            closeReportModal();
        }

        const detailsModal =
            document.getElementById(
                "adminReportDetailsModal"
            );

        if (detailsModal) {
            detailsModal.remove();
        }
    }
);

/* =========================
   SAFE GLOBAL HELPERS
========================= */

window.showReportDetailsById =
    showReportDetailsById;

window.openReportEditById =
    openReportEditById;

window.deleteReportById =
    deleteReportById;

window.closeReportModal =
    closeReportModal;

window.closeCategoryModal =
    closeCategoryModal;

window.saveReportChanges =
    saveReportChanges;

window.saveCategory =
    saveCategory;
/* =========================
   HEALTHCARE CRUD — PART 4
========================= */

async function saveHospital(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton =
        form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "সংরক্ষণ হচ্ছে...";
    }

    try {
        const id =
            document.getElementById("hospitalId")?.value || "";

        const payload = {
            name:
                document.getElementById("hospitalName")
                    ?.value.trim() || "",

            type:
                document.getElementById("hospitalType")
                    ?.value || "সরকারি",

            division:
                document.getElementById("hospitalDivision")
                    ?.value || "",

            district:
                document.getElementById("hospitalDistrict")
                    ?.value || "",

            upazila:
                document.getElementById("hospitalUpazila")
                    ?.value || "",

            address:
                document.getElementById("hospitalAddress")
                    ?.value.trim() || "",

            phone:
                document.getElementById("hospitalPhone")
                    ?.value.trim() || "",

            emergency_phone:
                document.getElementById(
                    "hospitalEmergencyPhone"
                )?.value.trim() || "",

            emergency_available:
                document.getElementById(
                    "hospitalEmergencyAvailable"
                )?.value === "true",

            departments:
                document.getElementById(
                    "hospitalDepartments"
                )?.value.trim() || "",

            opening_hours:
                document.getElementById(
                    "hospitalOpeningHours"
                )?.value.trim() || "",

            latitude:
                numberOrNull("hospitalLatitude"),

            longitude:
                numberOrNull("hospitalLongitude"),

            map_url:
                document.getElementById("hospitalMapUrl")
                    ?.value.trim() || "",

            website:
                document.getElementById("hospitalWebsite")
                    ?.value.trim() || "",

            source_url:
                document.getElementById("hospitalSourceUrl")
                    ?.value.trim() || "",

            verified_at:
                document.getElementById("hospitalVerifiedAt")
                    ?.value || null,

            active:
                document.getElementById("hospitalActive")
                    ?.value === "true"
        };

        if (!payload.name) {
            throw new Error(
                "হাসপাতালের নাম লিখুন।"
            );
        }

        const response = id
            ? await supabaseClient
                .from("Hospitals")
                .update(payload)
                .eq("id", id)
            : await supabaseClient
                .from("Hospitals")
                .insert(payload);

        if (response.error) {
            throw response.error;
        }

        closeHealthcareModal();

        showAdminMessage(
            "সফল হয়েছে",
            id
                ? "হাসপাতালের তথ্য আপডেট হয়েছে।"
                : "নতুন হাসপাতাল যোগ হয়েছে।",
            "success"
        );

        if (
            typeof loadHealthcareData ===
            "function"
        ) {
            await loadHealthcareData();
        }

    } catch (error) {

        console.error(
            "Hospital save error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "হাসপাতালের তথ্য সংরক্ষণ করা যায়নি।",
            "error"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
                "সংরক্ষণ";
        }
    }
}


/* =========================
   DOCTOR PHOTO PREVIEW
========================= */

function setupDoctorPhotoPreview() {

    const input =
        document.getElementById(
            "doctorPhoto"
        );

    if (!input) return;

    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];

            const oldPreview =
                document.getElementById(
                    "doctorPhotoPreview"
                );

            if (oldPreview) {
                oldPreview.remove();
            }

            if (!file) return;

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                showAdminMessage(
                    "ভুল ফাইল",
                    "শুধু image file নির্বাচন করুন।",
                    "error"
                );

                input.value = "";
                return;
            }

            const preview =
                document.createElement(
                    "img"
                );

            preview.id =
                "doctorPhotoPreview";

            preview.alt =
                "Doctor photo preview";

            preview.style.width =
                "90px";

            preview.style.height =
                "90px";

            preview.style.objectFit =
                "cover";

            preview.style.borderRadius =
                "12px";

            preview.style.marginTop =
                "10px";

            preview.src =
                URL.createObjectURL(
                    file
                );

            input.parentElement
                ?.appendChild(preview);
        }
    );
}


/* =========================
   LOCATION DROPDOWNS
========================= */

function setupHospitalLocationFields() {

    const division =
        document.getElementById(
            "hospitalDivision"
        );

    const district =
        document.getElementById(
            "hospitalDistrict"
        );

    const upazila =
        document.getElementById(
            "hospitalUpazila"
        );

    if (
        !division ||
        !district ||
        !upazila
    ) {
        return;
    }

    const data =
        typeof locationData !==
        "undefined"
            ? locationData
            : null;

    if (!data) {
        console.warn(
            "locationData পাওয়া যায়নি।"
        );
        return;
    }

    const divisions =
        Array.isArray(data)
            ? data
            : Object.keys(data);

    division.innerHTML =
        `<option value="">বিভাগ নির্বাচন করুন</option>`;

    divisions.forEach(
        divisionItem => {

            const option =
                document.createElement(
                    "option"
                );

            if (
                typeof divisionItem ===
                "string"
            ) {
                option.value =
                    divisionItem;

                option.textContent =
                    divisionItem;

            } else {

                option.value =
                    divisionItem.name;

                option.textContent =
                    divisionItem.name;
            }

            division.appendChild(
                option
            );
        }
    );

    division.addEventListener(
        "change",
        () => {

            district.innerHTML =
                `<option value="">জেলা নির্বাচন করুন</option>`;

            upazila.innerHTML =
                `<option value="">উপজেলা নির্বাচন করুন</option>`;

            const selected =
                division.value;

            if (!selected) return;

            let districts = null;

            if (
                !Array.isArray(data) &&
                data[selected]
            ) {
                districts =
                    data[selected];
            }

            if (
                Array.isArray(data)
            ) {

                const item =
                    data.find(
                        x =>
                            x.name ===
                            selected
                    );

                districts =
                    item?.districts ||
                    item?.children ||
                    [];
            }

            if (
                !districts
            ) {
                return;
            }

            if (
                Array.isArray(
                    districts
                )
            ) {

                districts.forEach(
                    districtItem => {

                        const name =
                            typeof districtItem ===
                            "string"
                                ? districtItem
                                : districtItem.name;

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            name;

                        option.textContent =
                            name;

                        district.appendChild(
                            option
                        );
                    }
                );

            } else {

                Object.keys(
                    districts
                ).forEach(
                    name => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            name;

                        option.textContent =
                            name;

                        district.appendChild(
                            option
                        );
                    }
                );
            }
        }
    );

    district.addEventListener(
        "change",
        () => {

            upazila.innerHTML =
                `<option value="">উপজেলা নির্বাচন করুন</option>`;

            const selectedDivision =
                division.value;

            const selectedDistrict =
                district.value;

            if (
                !selectedDivision ||
                !selectedDistrict
            ) {
                return;
            }

            let districts = null;

            if (
                !Array.isArray(data)
            ) {
                districts =
                    data[
                        selectedDivision
                    ];
            }

            if (
                Array.isArray(data)
            ) {

                const item =
                    data.find(
                        x =>
                            x.name ===
                            selectedDivision
                    );

                districts =
                    item?.districts ||
                    item?.children ||
                    [];
            }

            let upazilas = null;

            if (
                Array.isArray(
                    districts
                )
            ) {

                const item =
                    districts.find(
                        x =>
                            (
                                typeof x ===
                                "string"
                                    ? x
                                    : x.name
                            ) ===
                            selectedDistrict
                    );

                upazilas =
                    item?.upazilas ||
                    item?.children ||
                    [];

            } else {

                upazilas =
                    districts?.[
                        selectedDistrict
                    ];
            }

            if (
                !upazilas
            ) {
                return;
            }

            if (
                Array.isArray(
                    upazilas
                )
            ) {

                upazilas.forEach(
                    item => {

                        const name =
                            typeof item ===
                            "string"
                                ? item
                                : item.name;

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            name;

                        option.textContent =
                            name;

                        upazila.appendChild(
                            option
                        );
                    }
                );

            } else {

                Object.keys(
                    upazilas
                ).forEach(
                    name => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            name;

                        option.textContent =
                            name;

                        upazila.appendChild(
                            option
                        );
                    }
                );
            }
        }
    );
}


/* =========================
   INITIALIZE HEALTHCARE FORMS
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupDoctorPhotoPreview();

        setupHospitalLocationFields();

        const hospitalForm =
            document.getElementById(
                "hospitalForm"
            );

        if (hospitalForm) {
            hospitalForm.addEventListener(
                "submit",
                saveHospital
            );
        }

        const doctorForm =
            document.getElementById(
                "doctorForm"
            );

        if (
            doctorForm &&
            typeof saveDoctor ===
                "function"
        ) {
            doctorForm.addEventListener(
                "submit",
                saveDoctor
            );
        }

        const specializationForm =
            document.getElementById(
                "specializationForm"
            );

        if (
            specializationForm &&
            typeof saveSpecialization ===
                "function"
        ) {
            specializationForm.addEventListener(
                "submit",
                saveSpecialization
            );
        }

    }
);


/* =========================
   FINAL GLOBAL EXPORTS
========================= */

window.saveHospital =
    saveHospital;

window.saveDoctor =
    saveDoctor;

window.saveSpecialization =
    saveSpecialization;

window.setupDoctorPhotoPreview =
    setupDoctorPhotoPreview;

window.setupHospitalLocationFields =
    setupHospitalLocationFields;
