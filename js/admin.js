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
                    : error.message || "লগইন করা যায়নি।";

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
        title.textContent = "ড্যাশবোর্ড";
        subtitle.textContent =
            "আপনার এলাকার রিপোর্টগুলো পরিচালনা করুন";
    }

    if (section === "reports") {
        title.textContent = "রিপোর্টসমূহ";
        subtitle.textContent =
            "সব রিপোর্ট দেখুন ও পরিচালনা করুন";
    }

    if (section === "categories") {
        title.textContent = "ক্যাটাগরি";
        subtitle.textContent =
            "রিপোর্টের সমস্যা ক্যাটাগরি পরিচালনা করুন";
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
                    ) ===
                    normalizeStatus(
                        status
                    )) &&
                (!category ||
                    String(
                        report.Category ||
                        ""
                    ) === category) &&
                (!division ||
                    String(
                        report.Division ||
                        ""
                    ) === division)
            );
        });

    displayReports(filtered);
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
                কোনো রিপোর্ট পাওয়া যায়নি।
            </div>
        `;

        return;
    }

    let html = `
        <div class="admin-report-row admin-report-header">
            <div>রিপোর্ট</div>
            <div>লোকেশন</div>
            <div>ক্যাটাগরি</div>
            <div>স্ট্যাটাস</div>
            <div>তারিখ</div>
            <div>অ্যাকশন</div>
        </div>
    `;

    reports.forEach(report => {
        html += `
            <div class="admin-report-row">
                <div class="admin-report-cell">
                    <strong>${safe(
                        report.ID ||
                        "N/A"
                    )}</strong>

                    <small>${safe(
                        report.Description ||
                        "কোনো বিবরণ নেই"
                    )}</small>
                </div>

                <div class="admin-report-cell">
                    <strong>${safe(
                        report.Area ||
                        "—"
                    )}</strong>

                    <small>
                        ${safe(
                            report.District ||
                            ""
                        )}
                        ${
                            report.Division
                                ? " • " +
                                  safe(
                                      report.Division
                                  )
                                : ""
                        }
                    </small>
                </div>

                <div class="admin-report-cell">
                    <strong>${safe(
                        report.Category ||
                        "—"
                    )}</strong>
                </div>

                <div class="admin-report-cell">
                    <span class="status-badge ${statusClass(
                        report.Status
                    )}">
                        ${safe(
                            statusLabel(
                                report.Status
                            )
                        )}
                    </span>
                </div>

                <div class="admin-report-cell">
                    <strong>${safe(
                        report.Date ||
                        "—"
                    )}</strong>
                </div>

                <div class="admin-report-actions">
                    <button
                        class="admin-btn admin-btn-secondary edit-report-btn"
                        data-id="${escapeAttribute(
                            report.ID
                        )}"
                    >
                        ✏️
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container
        .querySelectorAll(
            ".edit-report-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const report =
                        allReports.find(
                            item =>
                                String(
                                    item.ID
                                ) ===
                                String(
                                    button.dataset
                                        .id
                                )
                        );

                    if (report) {
                        openReportEditModal(
                            report
                        );
                    }
                }
            );
        });
}

/* =========================
   RECENT REPORTS
========================= */

function displayRecentReports() {
    const container =
        document.getElementById(
            "recentReports"
        );

    if (!container) return;

    const reports =
        [...allReports]
            .reverse()
            .slice(0, 5);

    if (!reports.length) {
        container.innerHTML =
            '<div class="admin-empty">কোনো রিপোর্ট নেই।</div>';

        return;
    }

    container.innerHTML =
        reports
            .map(
                report => `
            <div class="recent-report-item">
                <div class="recent-report-info">
                    <strong>${safe(
                        report.Category ||
                        "রিপোর্ট"
                    )}</strong>

                    <small>
                        ${safe(
                            report.Area ||
                            "লোকেশন নেই"
                        )}
                        ${
                            report.District
                                ? " • " +
                                  safe(
                                      report.District
                                  )
                                : ""
                        }
                    </small>
                </div>

                <span class="status-badge ${statusClass(
                    report.Status
                )}">
                    ${safe(
                        statusLabel(
                            report.Status
                        )
                    )}
                </span>
            </div>
        `
            )
            .join("");
}

/* =========================
   REPORT EDIT
========================= */

function openReportEditModal(report) {
    editingReport = report;

    const modal =
        document.getElementById(
            "reportEditModal"
        );

    if (!modal) return;

    document.getElementById(
        "editReportId"
    ).value =
        report.ID || "";

    document.getElementById(
        "editId"
    ).value =
        report.ID || "";

    const statusType =
        normalizeStatus(
            report.Status
        );

    document.getElementById(
        "editStatus"
    ).value =
        statusType === "progress"
            ? "কাজ চলছে"
            : statusType === "solved"
            ? "সমাধান হয়েছে"
            : "Pending";

    document.getElementById(
        "editDivision"
    ).value =
        report.Division || "";

    document.getElementById(
        "editDistrict"
    ).value =
        report.District || "";

    document.getElementById(
        "editUpazila"
    ).value =
        report.Upazila || "";

    document.getElementById(
        "editArea"
    ).value =
        report.Area || "";

    document.getElementById(
        "editWard"
    ).value =
        report.Ward || "";

    document.getElementById(
        "editDescription"
    ).value =
        report.Description || "";

    document.getElementById(
        "editAdminNote"
    ).value =
        report.AdminNote || "";

    populateEditCategory(
        report.Category
    );

    modal.classList.add("active");
    document.body.style.overflow =
        "hidden";
}

function populateEditCategory(selected) {
    const select =
        document.getElementById(
            "editCategory"
        );

    if (!select) return;

    select.innerHTML = "";

    categories.forEach(category => {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.Name;

        option.textContent =
            `${category.Icon || "📌"} ${category.Name}`;

        if (
            category.Name ===
            selected
        ) {
            option.selected = true;
        }

        select.appendChild(
            option
        );
    });

    if (
        selected &&
        !categories.some(
            category =>
                category.Name ===
                selected
        )
    ) {
        const oldOption =
            document.createElement(
                "option"
            );

        oldOption.value =
            selected;

        oldOption.textContent =
            selected;

        oldOption.selected =
            true;

        select.appendChild(
            oldOption
        );
    }
}

function setupEditModal() {
    const modal =
        document.getElementById(
            "reportEditModal"
        );

    const close =
        document.getElementById(
            "closeReportModal"
        );

    const cancel =
        document.getElementById(
            "cancelReportEdit"
        );

    const overlay =
        modal?.querySelector(
            ".admin-modal-overlay"
        );

    if (close) {
        close.addEventListener(
            "click",
            closeReportEditModal
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeReportEditModal
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeReportEditModal
        );
    }

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

async function saveReportChanges(event) {
    event.preventDefault();

    if (!editingReport) return;

    const button =
        document.getElementById(
            "saveReportBtn"
        );

    if (button) {
        button.disabled = true;
        button.textContent =
            "সংরক্ষণ হচ্ছে...";
    }

    const id =
        editingReport.ID;

    const updatedData = {
        Division:
            document
                .getElementById(
                    "editDivision"
                )
                .value
                .trim(),

        District:
            document
                .getElementById(
                    "editDistrict"
                )
                .value
                .trim(),

        Upazila:
            document
                .getElementById(
                    "editUpazila"
                )
                .value
                .trim(),

        Area:
            document
                .getElementById(
                    "editArea"
                )
                .value
                .trim(),

        Ward:
            document
                .getElementById(
                    "editWard"
                )
                .value
                .trim(),

        Category:
            document.getElementById(
                "editCategory"
            ).value,

        Description:
            document
                .getElementById(
                    "editDescription"
                )
                .value
                .trim(),

        Status:
            document.getElementById(
                "editStatus"
            ).value,

        AdminNote:
            document
                .getElementById(
                    "editAdminNote"
                )
                .value
                .trim()
    };

    try {
        const { error } =
            await supabaseClient
                .from(REPORT_TABLE)
                .update(updatedData)
                .eq("ID", id);

        if (error) {
            throw error;
        }

        clearReportCache();

        closeReportEditModal();

        showAdminMessage(
            "সফল হয়েছে",
            "রিপোর্টের পরিবর্তন সংরক্ষণ হয়েছে।",
            "success"
        );

        await loadReports(true);

    } catch (error) {
        console.error(
            "Report update error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "রিপোর্ট আপডেট করা যায়নি।",
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                "পরিবর্তন সংরক্ষণ";
        }
    }
}

function closeReportEditModal() {
    const modal =
        document.getElementById(
            "reportEditModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }

    editingReport = null;

    document.body.style.overflow =
        "";
}

/* =========================
   CATEGORIES
========================= */

async function loadCategories(
    forceRefresh = false
) {
    if (!forceRefresh) {
        const cachedCategories =
            getCachedCategories();

        if (
            Array.isArray(
                cachedCategories
            ) &&
            cachedCategories.length > 0
        ) {
            categories =
                cachedCategories;

            renderCategories();
            createFilterOptions();

            return;
        }
    }

    try {
        const { data, error } =
            await supabaseClient
                .from(CATEGORY_TABLE)
                .select(
                    "ID, Name, Icon, Active"
                )
                .eq("Active", true)
                .order("ID", {
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

        const oldCategories =
            getCachedCategories(
                true
            );

        if (
            Array.isArray(
                oldCategories
            ) &&
            oldCategories.length > 0
        ) {
            categories =
                oldCategories;

            renderCategories();
            createFilterOptions();

            return;
        }

        categories = [];

        renderCategories();

        showAdminMessage(
            "সমস্যা",
            "Categories লোড করা যায়নি।",
            "error"
        );
    }
}

/* =========================
   CATEGORY DISPLAY
========================= */

function renderCategories() {
    const container =
        document.getElementById(
            "categoriesList"
        );

    if (!container) return;

    if (!categories.length) {
        container.innerHTML = `
            <div class="admin-empty">
                <div class="admin-empty-icon">🏷️</div>
                কোনো category পাওয়া যায়নি।
            </div>
        `;

        return;
    }

    container.innerHTML =
        categories
            .map(
                (category, index) => `
            <div class="category-admin-item">
                <div class="category-admin-left">
                    <div class="category-admin-icon">
                        ${safe(
                            category.Icon ||
                            "📌"
                        )}
                    </div>

                    <div>
                        <strong>${safe(
                            category.Name
                        )}</strong>
                    </div>
                </div>

                <div class="category-admin-actions">
                    <button
                        class="admin-btn admin-btn-secondary edit-category-btn"
                        data-index="${index}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="admin-btn admin-btn-danger delete-category-btn"
                        data-index="${index}"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `
            )
            .join("");

    container
        .querySelectorAll(
            ".edit-category-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    openCategoryModal(
                        Number(
                            button.dataset
                                .index
                        )
                    );
                }
            );
        });

    container
        .querySelectorAll(
            ".delete-category-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    deleteCategory(
                        Number(
                            button.dataset
                                .index
                        )
                    );
                }
            );
        });
}

/* =========================
   CATEGORY EVENTS
========================= */

function setupCategoryEvents() {
    const add =
        document.getElementById(
            "addCategoryBtn"
        );

    const form =
        document.getElementById(
            "categoryForm"
        );

    const close =
        document.getElementById(
            "closeCategoryModal"
        );

    const cancel =
        document.getElementById(
            "cancelCategory"
        );

    const modal =
        document.getElementById(
            "categoryModal"
        );

    const overlay =
        modal?.querySelector(
            ".admin-modal-overlay"
        );

    if (add) {
        add.addEventListener(
            "click",
            () =>
                openCategoryModal()
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            saveCategory
        );
    }

    if (close) {
        close.addEventListener(
            "click",
            closeCategoryModal
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeCategoryModal
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeCategoryModal
        );
    }

    setupEditModal();
}

/* =========================
   CATEGORY MODAL
========================= */

function openCategoryModal(
    index = null
) {
    editingCategoryIndex =
        index;

    const modal =
        document.getElementById(
            "categoryModal"
        );

    const title =
        document.getElementById(
            "categoryModalTitle"
        );

    const name =
        document.getElementById(
            "categoryName"
        );

    const icon =
        document.getElementById(
            "categoryIcon"
        );

    if (!modal) return;

    if (index === null) {
        title.textContent =
            "নতুন ক্যাটাগরি";

        name.value = "";
        icon.value = "";

    } else {
        const category =
            categories[index];

        if (!category) return;

        title.textContent =
            "ক্যাটাগরি সম্পাদনা";

        name.value =
            category.Name || "";

        icon.value =
            category.Icon || "";
    }

    modal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

    setTimeout(() => {
        name.focus();
    }, 100);
}

function closeCategoryModal() {
    const modal =
        document.getElementById(
            "categoryModal"
        );

    if (modal) {
        modal.classList.remove(
            "active"
        );
    }

    editingCategoryIndex =
        null;

    document.body.style.overflow =
        "";
}

/* =========================
   ADD / EDIT CATEGORY
========================= */

async function saveCategory(event) {
    event.preventDefault();

    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();

    const icon =
        document
            .getElementById(
                "categoryIcon"
            )
            .value
            .trim() ||
        "📌";

    if (!name) {
        showAdminMessage(
            "তথ্য প্রয়োজন",
            "ক্যাটাগরির নাম লিখুন।",
            "error"
        );

        return;
    }

    const duplicate =
        categories.some(
            (category, index) =>
                String(
                    category.Name ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                    name.toLowerCase() &&
                index !==
                    editingCategoryIndex
        );

    if (duplicate) {
        showAdminMessage(
            "ইতিমধ্যে আছে",
            "এই ক্যাটাগরিটি আগে থেকেই আছে।",
            "error"
        );

        return;
    }

    try {
        if (
            editingCategoryIndex ===
            null
        ) {
            await createCategory(
                name,
                icon
            );
        } else {
            await updateCategory(
                editingCategoryIndex,
                name,
                icon
            );
        }

        closeCategoryModal();

        clearCategoryCache();

        await loadCategories(
            true
        );

        await loadReports(
            true
        );

        showAdminMessage(
            "সফল হয়েছে",
            "ক্যাটাগরি স্থায়ীভাবে সংরক্ষণ হয়েছে।",
            "success"
        );

    } catch (error) {
        console.error(error);

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "ক্যাটাগরি সংরক্ষণ করা যায়নি।",
            "error"
        );
    }
}

/* =========================
   CREATE CATEGORY
========================= */

async function createCategory(
    name,
    icon
) {
    const id =
        generateCategoryID();

    const { error } =
        await supabaseClient
            .from(CATEGORY_TABLE)
            .insert({
                ID: id,
                Name: name,
                Icon: icon,
                Active: true
            });

    if (error) {
        throw new Error(
            error.message ||
                "নতুন category Supabase-এ save করা যায়নি।"
        );
    }
}

/* =========================
   GENERATE CATEGORY ID
========================= */

function generateCategoryID() {
    let maxNumber = 0;

    categories.forEach(
        category => {
            const id =
                String(
                    category.ID ||
                    ""
                ).trim();

            const match =
                id.match(
                    /^CAT-(\d+)$/i
                );

            if (match) {
                const number =
                    Number(
                        match[1]
                    );

                if (
                    number >
                    maxNumber
                ) {
                    maxNumber =
                        number;
                }
            }
        }
    );

    const nextNumber =
        maxNumber + 1;

    return `CAT-${String(
        nextNumber
    ).padStart(3, "0")}`;
}

/* =========================
   UPDATE CATEGORY
========================= */

async function updateCategory(
    index,
    newName,
    newIcon
) {
    const category =
        categories[index];

    if (!category) {
        throw new Error(
            "Category পাওয়া যায়নি।"
        );
    }

    const oldName =
        category.Name;

    const id =
        category.ID;

    const { error } =
        await supabaseClient
            .from(CATEGORY_TABLE)
            .update({
                Name: newName,
                Icon: newIcon,
                Active: true
            })
            .eq("ID", id);

    if (error) {
        throw new Error(
            error.message ||
                "Category update করা যায়নি।"
        );
    }

    if (
        oldName !==
        newName
    ) {
        const {
            error: reportError
        } =
            await supabaseClient
                .from(REPORT_TABLE)
                .update({
                    Category:
                        newName
                })
                .eq(
                    "Category",
                    oldName
                );

        if (reportError) {
            throw new Error(
                reportError.message ||
                    "Category নাম বদলেছে, কিন্তু পুরোনো report-গুলো update করা যায়নি।"
            );
        }

        clearReportCache();
    }

    clearCategoryCache();
}

/* =========================
   DELETE CATEGORY
========================= */

async function deleteCategory(
    index
) {
    const category =
        categories[index];

    if (!category) return;

    const used =
        allReports.some(
            report =>
                String(
                    report.Category ||
                    ""
                ).trim() ===
                String(
                    category.Name ||
                    ""
                ).trim()
        );

    if (used) {
        showAdminMessage(
            "Category ব্যবহার হচ্ছে",
            "এই category-তে report আছে। আগে সেই report-গুলোর category পরিবর্তন করুন।",
            "error"
        );

        return;
    }

    const confirmed =
        confirm(
            `"${category.Name}" category-টি permanently delete করতে চান?`
        );

    if (!confirmed) return;

    try {
        const { error } =
            await supabaseClient
                .from(CATEGORY_TABLE)
                .delete()
                .eq(
                    "ID",
                    category.ID
                );

        if (error) {
            throw new Error(
                error.message ||
                    "Category delete করা যায়নি।"
            );
        }

        clearCategoryCache();

        await loadCategories(
            true
        );

        await loadReports(
            true
        );

        showAdminMessage(
            "সফল হয়েছে",
            "Category permanently delete হয়েছে।",
            "success"
        );

    } catch (error) {
        console.error(error);

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "Category delete করা যায়নি।",
            "error"
        );
    }
}

/* =========================
   MESSAGE
========================= */

function showAdminMessage(
    title,
    message,
    type
) {
    const old =
        document.querySelector(
            ".admin-toast"
        );

    if (old) {
        old.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "admin-toast";

    toast.innerHTML = `
        <strong>${safe(
            title
        )}</strong>
        <span>${safe(
            message
        )}</span>
    `;

    toast.style.position =
        "fixed";

    toast.style.right =
        "20px";

    toast.style.bottom =
        "20px";

    toast.style.zIndex =
        "5000";

    toast.style.background =
        "#fff";

    toast.style.border =
        "1px solid #dfe5e1";

    toast.style.borderLeft =
        type === "success"
            ? "4px solid #166534"
            : "4px solid #b91c1c";

    toast.style.borderRadius =
        "10px";

    toast.style.padding =
        "14px 17px";

    toast.style.boxShadow =
        "0 15px 40px rgba(0,0,0,.12)";

    toast.style.display =
        "flex";

    toast.style.flexDirection =
        "column";

    toast.style.gap =
        "2px";

    toast.style.minWidth =
        "250px";

    document.body.appendChild(
        toast
    );

    setTimeout(() => {
        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(8px)";

        toast.style.transition =
            ".3s ease";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}

/* =========================
   HELPERS
========================= */

function safe(value) {
    return escapeHTML(
        String(value ?? "")
    );
}

function escapeHTML(value) {
    return value
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
    return escapeHTML(
        String(value ?? "")
    );
}
