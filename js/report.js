 const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";
const CATEGORY_SHEET = "Categories";

const CATEGORY_CACHE_KEY = "amaderElaka_categories_cache";
const CATEGORY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const REPORT_CACHE_KEY = "amaderElaka_reports_cache";

document.addEventListener("DOMContentLoaded", initializeReportForm);

async function initializeReportForm() {
    const division = document.getElementById("division");
    const district = document.getElementById("district");
    const upazila = document.getElementById("upazila");
    const reportForm = document.getElementById("reportForm");
    const category = document.getElementById("category");

    if (!division || !district || !upazila || !reportForm) return;

    district.disabled = true;
    upazila.disabled = true;

    setupLocationDropdowns(division, district, upazila);

    if (category) await loadCategories(category);

    reportForm.addEventListener("submit", handleReportSubmit);
}

/* =========================
   LOCATION
========================= */

function setupLocationDropdowns(division, district, upazila) {
    division.addEventListener("change", () => {
        const selectedDivision = division.value;

        district.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';
        upazila.innerHTML = '<option value="">আগে জেলা নির্বাচন করুন</option>';
        district.disabled = true;
        upazila.disabled = true;

        if (!selectedDivision || typeof locationData === "undefined") return;

        const districts = locationData[selectedDivision];
        if (!districts) return;

        Object.keys(districts).forEach(districtName => {
            const option = document.createElement("option");
            option.value = districtName;
            option.textContent = districtName;
            district.appendChild(option);
        });

        district.disabled = false;
    });

    district.addEventListener("change", () => {
        const selectedDivision = division.value;
        const selectedDistrict = district.value;

        upazila.innerHTML = '<option value="">উপজেলা নির্বাচন করুন</option>';
        upazila.disabled = true;

        if (
            !selectedDivision ||
            !selectedDistrict ||
            typeof locationData === "undefined"
        ) return;

        const upazilas =
            locationData[selectedDivision]?.[selectedDistrict];

        if (!Array.isArray(upazilas)) return;

        upazilas.forEach(upazilaName => {
            const option = document.createElement("option");
            option.value = upazilaName;
            option.textContent = upazilaName;
            upazila.appendChild(option);
        });

        upazila.disabled = false;
    });
}

/* =========================
   CATEGORIES
========================= */

async function loadCategories(selectElement) {
    selectElement.innerHTML =
        '<option value="">ক্যাটাগরি লোড হচ্ছে...</option>';

    const cachedCategories = getCachedCategories();

    if (cachedCategories) {
        renderCategories(selectElement, cachedCategories);
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}?sheet=${encodeURIComponent(CATEGORY_SHEET)}`
        );

        if (!response.ok) throw new Error("Category API failed");

        const data = await response.json();

        const activeCategories = Array.isArray(data)
            ? data.filter(item =>
                String(item.Active || "")
                    .trim()
                    .toLowerCase() === "true"
            )
            : [];

        saveCachedCategories(activeCategories);
        renderCategories(selectElement, activeCategories);

    } catch (error) {
        console.error("Category loading error:", error);

        const oldCategories = getCachedCategories(true);

        if (oldCategories) {
            renderCategories(selectElement, oldCategories);
        } else {
            selectElement.innerHTML =
                '<option value="">ক্যাটাগরি লোড করা যায়নি</option>';

            showErrorMessage(
                "ক্যাটাগরি লোড করা যায়নি। পেজটি Refresh করে আবার চেষ্টা করুন।"
            );
        }
    }
}

function renderCategories(selectElement, categories) {
    selectElement.innerHTML =
        '<option value="">সমস্যার ধরন নির্বাচন করুন</option>';

    if (!categories.length) {
        selectElement.innerHTML =
            '<option value="">কোনো ক্যাটাগরি পাওয়া যায়নি</option>';
        return;
    }

    categories.forEach(item => {
        const option = document.createElement("option");

        option.value = String(item.Name || "").trim();
        option.textContent =
            `${item.Icon || "📌"} ${item.Name || ""}`;

        selectElement.appendChild(option);
    });
}

function getCachedCategories(ignoreExpiry = false) {
    try {
        const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
        if (!cached) return null;

        const data = JSON.parse(cached);

        if (
            !data ||
            !Array.isArray(data.categories) ||
            !data.time
        ) return null;

        const age = Date.now() - Number(data.time);

        if (!ignoreExpiry && age > CATEGORY_CACHE_TIME) return null;

        return data.categories;
    } catch (error) {
        console.error("Category Cache Read Error:", error);
        return null;
    }
}

function saveCachedCategories(categories) {
    try {
        localStorage.setItem(
            CATEGORY_CACHE_KEY,
            JSON.stringify({
                time: Date.now(),
                categories
            })
        );
    } catch (error) {
        console.error("Category Cache Save Error:", error);
    }
}

function clearCategoryCache() {
    try {
        localStorage.removeItem(CATEGORY_CACHE_KEY);
    } catch (error) {
        console.error("Category Cache Clear Error:", error);
    }
}

/* =========================
   REPORT SUBMIT
========================= */

async function handleReportSubmit(event) {
    event.preventDefault();

    const form = event.target;

    const division = document.getElementById("division");
    const district = document.getElementById("district");
    const upazila = document.getElementById("upazila");
    const area = document.getElementById("area");
    const ward = document.getElementById("ward");
    const category = document.getElementById("category");
    const description = document.getElementById("description");
    const submitButton = form.querySelector(".submit-button");

    if (
        !division.value ||
        !district.value ||
        !upazila.value ||
        !area.value.trim() ||
        !ward.value ||
        !category.value ||
        !description.value.trim()
    ) {
        showErrorMessage(
            "দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।"
        );
        return;
    }

    const reportID = generateReportID();

    const formData = {
        ID: reportID,
        Division: division.value.trim(),
        District: district.value.trim(),
        Upazila: upazila.value.trim(),
        Area: area.value.trim(),
        Ward: ward.value.trim(),
        Category: category.value.trim(),
        Description: description.value.trim(),
        Date: new Date().toISOString().split("T")[0],
        Status: "Pending",
        AdminNote: ""
    };

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "জমা দেওয়া হচ্ছে...";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [formData]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        await response.json();

        // নতুন রিপোর্টের জন্য পুরনো report cache বাদ
        clearReportCache();

        showSuccessMessage(reportID);

        form.reset();

        district.innerHTML =
            '<option value="">আগে বিভাগ নির্বাচন করুন</option>';

        upazila.innerHTML =
            '<option value="">আগে জেলা নির্বাচন করুন</option>';

        district.disabled = true;
        upazila.disabled = true;

        // Category আবার API থেকে load করা হবে না।
        // Cached category select-এ আগের মতোই থাকবে।

    } catch (error) {
        console.error("Report submit error:", error);

        showErrorMessage(
            "রিপোর্ট জমা দেওয়া যায়নি। আবার চেষ্টা করুন।"
        );
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "রিপোর্ট জমা দিন";
        }
    }
}

/* =========================
   CACHE
========================= */

function clearReportCache() {
    try {
        localStorage.removeItem(REPORT_CACHE_KEY);
    } catch (error) {
        console.error("Report Cache Clear Error:", error);
    }
}

/* =========================
   REPORT ID
========================= */

function generateReportID() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    const random = Math.floor(100 + Math.random() * 900);

    return `REP-${year}${month}${day}-${hour}${minute}${second}-${random}`;
}

/* =========================
   SUCCESS MESSAGE
========================= */

function showSuccessMessage(reportID) {
    removeExistingMessage();

    const message = document.createElement("div");

    message.className = "report-success-message";

    message.innerHTML = `
        <div class="success-icon">✓</div>
        <div class="success-content">
            <h3>রিপোর্ট সফলভাবে জমা হয়েছে!</h3>
            <p>আপনার রিপোর্টটি সংরক্ষণ করা হয়েছে।</p>

            <div class="report-id-box">
                <span>Report ID</span>
                <strong id="generatedReportID">
                    ${escapeHTML(reportID)}
                </strong>
                <button type="button" id="copyReportID">
                    Copy
                </button>
            </div>

            <button
                type="button"
                class="success-close"
                id="closeSuccessMessage"
            >
                বন্ধ করুন
            </button>
        </div>
    `;

    const form = document.getElementById("reportForm");

    if (form) {
        form.parentNode.insertBefore(message, form);
    } else {
        document.body.prepend(message);
    }

    const copyButton = document.getElementById("copyReportID");
    const closeButton =
        document.getElementById("closeSuccessMessage");

    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(reportID);
                copyButton.textContent = "Copied ✓";

                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1800);

            } catch {
                fallbackCopy(reportID);
                copyButton.textContent = "Copied ✓";
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            message.remove();
        });
    }

    setTimeout(() => {
        if (message.parentNode) message.remove();
    }, 12000);
}

/* =========================
   ERROR MESSAGE
========================= */

function showErrorMessage(text) {
    removeExistingMessage();

    const message = document.createElement("div");

    message.className = "report-error-message";

    message.innerHTML = `
        <div class="error-icon">!</div>
        <div>
            <strong>দুঃখিত!</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    const form = document.getElementById("reportForm");

    if (form) {
        form.parentNode.insertBefore(message, form);
    } else {
        document.body.prepend(message);
    }

    setTimeout(() => {
        if (message.parentNode) message.remove();
    }, 7000);
}

/* =========================
   COPY FALLBACK
========================= */

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {
        document.execCommand("copy");
    } catch (error) {
        console.error(error);
    }

    textarea.remove();
}

/* =========================
   HELPERS
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function removeExistingMessage() {
    document
        .querySelectorAll(
            ".report-success-message, .report-error-message"
        )
        .forEach(element => element.remove());
        }
