const REPORT_TABLE = "Reports";
const CATEGORY_TABLE = "Categories";

const CATEGORY_CACHE_KEY = "amaderElaka_categories_cache";
const CATEGORY_CACHE_TIME = 10 * 60 * 1000;
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
        if (typeof supabaseClient === "undefined") {
            throw new Error("Supabase client is not loaded");
        }

        const { data, error } = await supabaseClient
            .from(CATEGORY_TABLE)
            .select("ID, Name, Icon, Active")
            .eq("Active", true)
            .order("ID", { ascending: true });

        if (error) throw error;

        const activeCategories = Array.isArray(data) ? data : [];

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
        const cached =
            localStorage.getItem(CATEGORY_CACHE_KEY);

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
            Date.now() -
            Number(data.time);

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
   REPORT SUBMIT
========================= */

async function handleReportSubmit(event) {
    event.preventDefault();

    const form = event.target;

    const division =
        document.getElementById("division");

    const district =
        document.getElementById("district");

    const upazila =
        document.getElementById("upazila");

    const area =
        document.getElementById("area");

    const ward =
        document.getElementById("ward");

    const category =
        document.getElementById("category");

    const description =
        document.getElementById("description");

    const submitButton =
        form.querySelector(".submit-button");

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

    const reportID =
        generateReportID();

    const formData = {
        ID: reportID,
        Division: division.value.trim(),
        District: district.value.trim(),
        Upazila: upazila.value.trim(),
        Area: area.value.trim(),
        Ward: ward.value.trim(),
        Category: category.value.trim(),
        Description: description.value.trim(),
        Date: new Date()
            .toISOString()
            .split("T")[0],
        Status: "Pending",
        AdminNote: ""
    };

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
            "জমা দেওয়া হচ্ছে...";
    }

    try {
        if (typeof supabaseClient === "undefined") {
            throw new Error("Supabase client is not loaded");
        }

        const { error } = await supabaseClient
            .from(REPORT_TABLE)
            .insert([formData]);

        if (error) throw error;

        /*
         * নতুন রিপোর্টের জন্য পুরনো
         * report cache বাদ দেওয়া হচ্ছে।
         */
        clearReportCache();

        /*
         * Form reset করার আগে popup দেখানো।
         * Popup body-এর উপর থাকবে,
         * তাই form layout নড়বে না।
         */
        showSuccessMessage(reportID);

        form.reset();

        district.innerHTML =
            '<option value="">আগে বিভাগ নির্বাচন করুন</option>';

        upazila.innerHTML =
            '<option value="">আগে জেলা নির্বাচন করুন</option>';

        district.disabled = true;
        upazila.disabled = true;

        /*
         * Category আবার API থেকে load করা হবে না।
         * Cached category আগের মতো থাকবে।
         */

    } catch (error) {
        console.error(
            "Report submit error:",
            error
        );

        showErrorMessage(
            "রিপোর্ট জমা দেওয়া যায়নি। আবার চেষ্টা করুন।"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
                "রিপোর্ট জমা দিন";
        }
    }
}

/* =========================
   REPORT CACHE
========================= */

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
   REPORT ID
========================= */

function generateReportID() {
    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hour =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const second =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );

    return `REP-${year}${month}${day}-${hour}${minute}${second}-${random}`;
}

/* =========================
   SUCCESS POPUP
========================= */

function showSuccessMessage(reportID) {
    removeExistingMessage();

    const overlay =
        document.createElement("div");

    overlay.className =
        "report-success-overlay";

    overlay.setAttribute(
        "role",
        "dialog"
    );

    overlay.setAttribute(
        "aria-modal",
        "true"
    );

    overlay.setAttribute(
        "aria-labelledby",
        "successPopupTitle"
    );

    overlay.innerHTML = `
        <div class="report-success-popup">

            <button
                type="button"
                class="report-success-close-x"
                id="closeSuccessPopupX"
                aria-label="বন্ধ করুন"
            >
                ×
            </button>

            <div class="report-success-icon">
                ✓
            </div>

            <h2 id="successPopupTitle">
                রিপোর্ট সফলভাবে জমা হয়েছে!
            </h2>

            <p class="report-success-subtitle">
                আপনার রিপোর্টটি সফলভাবে সংরক্ষণ করা হয়েছে।
            </p>

            <div class="report-id-box">

                <div class="report-id-label">
                    Report ID
                </div>

                <div class="report-id-value">

                    <strong id="generatedReportID">
                        ${escapeHTML(reportID)}
                    </strong>

                    <button
                        type="button"
                        id="copyReportID"
                        class="copy-report-button"
                    >
                        📋 Copy ID
                    </button>

                </div>

            </div>

            <p
                id="copySuccessText"
                class="copy-success-text"
                aria-live="polite"
            ></p>

            <button
                type="button"
                class="success-close"
                id="closeSuccessMessage"
            >
                ঠিক আছে
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    document.body.style.overflow = "hidden";

    const copyButton =
        document.getElementById(
            "copyReportID"
        );

    const closeButton =
        document.getElementById(
            "closeSuccessMessage"
        );

    const closeX =
        document.getElementById(
            "closeSuccessPopupX"
        );

    const copySuccessText =
        document.getElementById(
            "copySuccessText"
        );

    /*
     * Copy Report ID
     */
    if (copyButton) {
        copyButton.addEventListener(
            "click",
            async () => {
                try {
                    if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                    ) {
                        await navigator.clipboard.writeText(
                            reportID
                        );
                    } else {
                        fallbackCopy(
                            reportID
                        );
                    }

                    copyButton.textContent =
                        "কপি হয়েছে ✓";

                    copyButton.classList.add(
                        "copied"
                    );

                    if (copySuccessText) {
                        copySuccessText.textContent =
                            "Report ID কপি হয়েছে।";
                    }

                    setTimeout(() => {
                        if (
                            copyButton.parentNode
                        ) {
                            copyButton.textContent =
                                "📋 Copy ID";

                            copyButton.classList.remove(
                                "copied"
                            );
                        }

                        if (
                            copySuccessText
                        ) {
                            copySuccessText.textContent =
                                "";
                        }
                    }, 1800);

                } catch (error) {
                    console.error(
                        "Copy Error:",
                        error
                    );

                    fallbackCopy(
                        reportID
                    );

                    copyButton.textContent =
                        "কপি হয়েছে ✓";

                    if (copySuccessText) {
                        copySuccessText.textContent =
                            "Report ID কপি হয়েছে।";
                    }
                }
            }
        );
    }

    /*
     * Close popup
     */
    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeSuccessPopup
        );
    }

    if (closeX) {
        closeX.addEventListener(
            "click",
            closeSuccessPopup
        );
    }

    /*
     * Overlay-এর বাইরে click করলে popup বন্ধ।
     */
    overlay.addEventListener(
        "click",
        event => {
            if (
                event.target === overlay
            ) {
                closeSuccessPopup();
            }
        }
    );

    /*
     * ESC চাপলেও popup বন্ধ।
     */
    overlay._escapeHandler =
        function(event) {
            if (
                event.key === "Escape"
            ) {
                closeSuccessPopup();
            }
        };

    document.addEventListener(
        "keydown",
        overlay._escapeHandler
    );

    /*
     * Popup animation শুরু।
     */
    requestAnimationFrame(() => {
        overlay.classList.add(
            "show"
        );
    });

    /*
     * Close button-এ focus।
     */
    if (closeButton) {
        setTimeout(() => {
            closeButton.focus();
        }, 100);
    }
}

/* =========================
   CLOSE SUCCESS POPUP
========================= */

function closeSuccessPopup() {
    const overlay =
        document.querySelector(
            ".report-success-overlay"
        );

    if (!overlay) return;

    if (overlay._escapeHandler) {
        document.removeEventListener(
            "keydown",
            overlay._escapeHandler
        );
    }

    overlay.classList.remove(
        "show"
    );

    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }

        document.body.style.overflow =
            "";

    }, 220);
}

/* =========================
   ERROR MESSAGE
========================= */

function showErrorMessage(text) {
    removeExistingMessage();

    const message =
        document.createElement("div");

    message.className =
        "report-error-message";

    message.innerHTML = `
        <div class="error-icon">
            !
        </div>

        <div>
            <strong>
                দুঃখিত!
            </strong>

            <p>
                ${escapeHTML(text)}
            </p>
        </div>
    `;

    const form =
        document.getElementById(
            "reportForm"
        );

    if (form) {
        form.parentNode.insertBefore(
            message,
            form
        );
    } else {
        document.body.prepend(
            message
        );
    }

    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 7000);
}

/* =========================
   COPY FALLBACK
========================= */

function fallbackCopy(text) {
    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";

    textarea.style.pointerEvents =
        "none";

    document.body.appendChild(
        textarea
    );

    textarea.focus();
    textarea.select();

    try {
        document.execCommand(
            "copy"
        );

    } catch (error) {
        console.error(
            "Fallback Copy Error:",
            error
        );
    }

    textarea.remove();
}

/* =========================
   HELPERS
========================= */

function escapeHTML(value) {
    return String(value ?? "")
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

function removeExistingMessage() {
    document
        .querySelectorAll(
            ".report-success-overlay, .report-success-message, .report-error-message"
        )
        .forEach(
            element => {
                if (
                    element._escapeHandler
                ) {
                    document.removeEventListener(
                        "keydown",
                        element._escapeHandler
                    );
                }

                element.remove();
            }
        );

    document.body.style.overflow = "";
}

/* =========================
   SUCCESS POPUP CSS
   Injected automatically
   No report.css change needed
========================= */

(function addSuccessPopupStyles() {

    if (
        document.getElementById(
            "reportSuccessPopupStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "reportSuccessPopupStyles";

    style.textContent = `

        .report-success-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.62);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            opacity: 0;
            visibility: hidden;
            transition:
                opacity 0.22s ease,
                visibility 0.22s ease;
        }

        .report-success-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .report-success-popup {
            position: relative;
            width: min(100%, 470px);
            padding: 34px 30px 30px;
            text-align: center;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 22px;
            box-shadow:
                0 25px 70px rgba(0, 0, 0, 0.22);
            transform:
                translateY(18px)
                scale(0.96);
            transition:
                transform 0.28s
                cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .report-success-overlay.show
        .report-success-popup {
            transform:
                translateY(0)
                scale(1);
        }

        .report-success-close-x {
            position: absolute;
            top: 12px;
            right: 14px;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 50%;
            background: #f3f4f6;
            color: #6b7280;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            transition:
                background 0.2s ease,
                color 0.2s ease,
                transform 0.2s ease;
        }

        .report-success-close-x:hover {
            background: #e5e7eb;
            color: #111827;
            transform: rotate(90deg);
        }

        .report-success-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #dcfce7;
            color: #15803d;
            border: 6px solid #f0fdf4;
            font-size: 36px;
            font-weight: 800;
            box-shadow:
                0 8px 24px rgba(22, 101, 52, 0.12);
        }

        .report-success-popup h2 {
            margin: 0;
            color: #166534;
            font-size: 24px;
            line-height: 1.35;
            font-weight: 700;
        }

        .report-success-subtitle {
            margin: 10px 0 22px;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.7;
        }

        .report-id-box {
            padding: 15px;
            text-align: left;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
        }

        .report-id-label {
            margin-bottom: 8px;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
        }

        .report-id-value {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .report-id-value strong {
            flex: 1;
            min-width: 0;
            color: #1e293b;
            font-size: 14px;
            line-height: 1.5;
            word-break: break-all;
        }

        .copy-report-button {
            flex-shrink: 0;
            min-height: 38px;
            padding: 0 13px;
            border: none;
            border-radius: 9px;
            background: #166534;
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition:
                background 0.2s ease,
                transform 0.2s ease;
        }

        .copy-report-button:hover {
            background: #14532d;
            transform: translateY(-1px);
        }

        .copy-report-button.copied {
            background: #15803d;
        }

        .copy-success-text {
            min-height: 20px;
            margin: 8px 0 2px;
            color: #15803d;
            font-size: 13px;
            font-weight: 600;
        }

        .success-close {
            width: 100%;
            min-height: 46px;
            margin-top: 18px;
            border: none;
            border-radius: 11px;
            background: #166534;
            color: #ffffff;
            font: inherit;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition:
                background 0.2s ease,
                transform 0.2s ease;
        }

        .success-close:hover {
            background: #14532d;
            transform: translateY(-1px);
        }

        .success-close:active {
            transform: translateY(0);
        }

        @media (max-width: 520px) {

            .report-success-overlay {
                padding: 15px;
            }

            .report-success-popup {
                padding: 30px 18px 22px;
                border-radius: 18px;
            }

            .report-success-icon {
                width: 62px;
                height: 62px;
                font-size: 31px;
            }

            .report-success-popup h2 {
                font-size: 20px;
            }

            .report-success-subtitle {
                font-size: 13px;
            }

            .report-id-value {
                align-items: stretch;
                flex-direction: column;
            }

            .copy-report-button {
                width: 100%;
            }
        }

        @media (prefers-reduced-motion: reduce) {

            .report-success-overlay,
            .report-success-popup,
            .report-success-close-x,
            .copy-report-button,
            .success-close {
                transition: none;
            }
        }

    `;

    document.head.appendChild(
        style
    );

})();
