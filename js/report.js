// ==========================================
// আমাদের এলাকা — Report Form JavaScript
// Division → District → Upazila
// SheetDB + Report ID + Copy Button
// ==========================================

const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // Get Elements
    // ==============================

    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");
    const upazilaSelect = document.getElementById("upazila");
    const reportForm = document.getElementById("reportForm");

    const areaInput = document.getElementById("area");
    const wardSelect = document.getElementById("ward");
    const categorySelect = document.getElementById("category");
    const descriptionInput = document.getElementById("description");

    // ==============================
    // Safety Check
    // ==============================

    if (
        !divisionSelect ||
        !districtSelect ||
        !upazilaSelect ||
        !reportForm
    ) {
        console.error("Report form elements not found.");
        return;
    }

    // ==============================
    // Initial State
    // ==============================

    districtSelect.disabled = true;
    upazilaSelect.disabled = true;

    districtSelect.innerHTML =
        '<option value="">আগে বিভাগ নির্বাচন করুন</option>';

    upazilaSelect.innerHTML =
        '<option value="">আগে জেলা নির্বাচন করুন</option>';

    // ==============================
    // Division → District
    // ==============================

    divisionSelect.addEventListener("change", function () {

        const division = this.value;

        // Reset district
        districtSelect.innerHTML =
            '<option value="">জেলা নির্বাচন করুন</option>';

        // Reset upazila
        upazilaSelect.innerHTML =
            '<option value="">আগে জেলা নির্বাচন করুন</option>';

        upazilaSelect.disabled = true;

        // No division selected
        if (!division) {
            districtSelect.disabled = true;
            return;
        }

        // Check location data
        if (
            typeof locationData === "undefined" ||
            !locationData[division]
        ) {
            console.error(
                "Location data not found for division:",
                division
            );

            districtSelect.disabled = true;
            return;
        }

        const districts = locationData[division];

        // Add districts
        Object.keys(districts).forEach(function (district) {

            const option = document.createElement("option");

            option.value = district;
            option.textContent = district;

            districtSelect.appendChild(option);
        });

        districtSelect.disabled = false;
    });

    // ==============================
    // District → Upazila
    // ==============================

    districtSelect.addEventListener("change", function () {

        const division = divisionSelect.value;
        const district = this.value;

        // Reset upazila
        upazilaSelect.innerHTML =
            '<option value="">উপজেলা নির্বাচন করুন</option>';

        // No district
        if (!division || !district) {
            upazilaSelect.disabled = true;
            return;
        }

        // Check data
        if (
            typeof locationData === "undefined" ||
            !locationData[division] ||
            !locationData[division][district]
        ) {
            console.error(
                "Upazila data not found:",
                division,
                district
            );

            upazilaSelect.disabled = true;
            return;
        }

        const upazilas = locationData[division][district];

        // Add upazilas
        upazilas.forEach(function (upazila) {

            const option = document.createElement("option");

            option.value = upazila;
            option.textContent = upazila;

            upazilaSelect.appendChild(option);
        });

        upazilaSelect.disabled = false;
    });

    // ==============================
    // Generate Report ID
    // ==============================

    function generateReportID() {

        const now = new Date();

        const datePart =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0");

        const timePart =
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");

        const randomPart =
            Math.floor(100 + Math.random() * 900);

        return "REP-" + datePart + "-" + timePart + "-" + randomPart;
    }

    // ==============================
    // Escape HTML
    // ==============================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==============================
    // Success Message
    // ==============================

    function showSuccessMessage(reportID) {

        // Remove previous messages
        const oldSuccess =
            document.getElementById("reportSuccessMessage");

        const oldError =
            document.getElementById("reportErrorMessage");

        if (oldSuccess) oldSuccess.remove();
        if (oldError) oldError.remove();

        const message = document.createElement("div");

        message.id = "reportSuccessMessage";

        message.innerHTML = `
            <div class="success-icon">
                ✓
            </div>

            <div class="success-content">

                <h3>রিপোর্ট সফলভাবে জমা হয়েছে!</h3>

                <p>
                    আপনার রিপোর্টটি সফলভাবে সংরক্ষণ করা হয়েছে।
                    নিচে আপনার Report ID দেওয়া হলো।
                </p>

                <div class="report-id-box">

                    <span class="report-id-label">
                        আপনার Report ID
                    </span>

                    <div class="report-id-row">

                        <strong
                            id="generatedReportID"
                            class="report-id-value"
                        >
                            ${escapeHTML(reportID)}
                        </strong>

                        <button
                            type="button"
                            id="copyReportID"
                            class="copy-report-button"
                        >
                            📋 Copy
                        </button>

                    </div>

                </div>

            </div>

            <button
                type="button"
                class="success-close"
                id="successCloseButton"
                aria-label="বন্ধ করুন"
            >
                ×
            </button>
        `;

        // Form-এর আগে message দেখাবে
        reportForm.parentNode.insertBefore(
            message,
            reportForm
        );

        // ==============================
        // Copy Button
        // ==============================

        const copyButton =
            document.getElementById("copyReportID");

        copyButton.addEventListener("click", async function () {

            let copied = false;

            // Modern browser
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                try {

                    await navigator.clipboard.writeText(
                        reportID
                    );

                    copied = true;

                } catch (error) {

                    console.warn(
                        "Clipboard API failed:",
                        error
                    );
                }
            }

            // Fallback
            if (!copied) {

                const textArea =
                    document.createElement("textarea");

                textArea.value = reportID;

                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";

                document.body.appendChild(textArea);

                textArea.focus();
                textArea.select();

                try {
                    copied =
                        document.execCommand("copy");
                } catch (error) {
                    copied = false;
                }

                textArea.remove();
            }

            // Button feedback
            if (copied) {

                copyButton.textContent =
                    "✓ কপি হয়েছে";

                copyButton.classList.add("copied");

                setTimeout(function () {

                    copyButton.textContent =
                        "📋 Copy";

                    copyButton.classList.remove(
                        "copied"
                    );

                }, 2500);

            } else {

                copyButton.textContent =
                    "কপি করা যায়নি";

                setTimeout(function () {

                    copyButton.textContent =
                        "📋 Copy";

                }, 2500);
            }
        });

        // ==============================
        // Close Button
        // ==============================

        const closeButton =
            document.getElementById(
                "successCloseButton"
            );

        closeButton.addEventListener(
            "click",
            function () {

                message.remove();
            }
        );

        // ==============================
        // Auto Hide
        // ==============================

        setTimeout(function () {

            if (message.parentNode) {
                message.remove();
            }

        }, 12000);
    }

    // ==============================
    // Error Message
    // ==============================

    function showErrorMessage(messageText) {

        const oldSuccess =
            document.getElementById(
                "reportSuccessMessage"
            );

        const oldError =
            document.getElementById(
                "reportErrorMessage"
            );

        if (oldSuccess) oldSuccess.remove();
        if (oldError) oldError.remove();

        const message =
            document.createElement("div");

        message.id = "reportErrorMessage";

        message.innerHTML = `
            <div class="error-icon">
                !
            </div>

            <div class="error-content">

                <h3>রিপোর্ট জমা দেওয়া যায়নি</h3>

                <p>
                    ${escapeHTML(messageText)}
                </p>

            </div>

            <button
                type="button"
                class="error-close"
                aria-label="বন্ধ করুন"
            >
                ×
            </button>
        `;

        reportForm.parentNode.insertBefore(
            message,
            reportForm
        );

        const closeButton =
            message.querySelector(".error-close");

        closeButton.addEventListener(
            "click",
            function () {
                message.remove();
            }
        );
    }

    // ==============================
    // Form Submit
    // ==============================

    reportForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const submitButton =
                reportForm.querySelector(
                    "button[type='submit']"
                );

            // ==============================
            // Remove old messages
            // ==============================

            const oldSuccess =
                document.getElementById(
                    "reportSuccessMessage"
                );

            const oldError =
                document.getElementById(
                    "reportErrorMessage"
                );

            if (oldSuccess) oldSuccess.remove();
            if (oldError) oldError.remove();

            // ==============================
            // Generate ID
            // ==============================

            const reportID =
                generateReportID();

            // ==============================
            // Form Data
            // ==============================

            const formData = {

                ID: reportID,

                Division:
                    divisionSelect.value.trim(),

                District:
                    districtSelect.value.trim(),

                Upazila:
                    upazilaSelect.value.trim(),

                Area:
                    areaInput.value.trim(),

                Ward:
                    wardSelect.value.trim(),

                Category:
                    categorySelect.value.trim(),

                Description:
                    descriptionInput.value.trim(),

                Date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                Status:
                    "Pending",

                AdminNote:
                    ""
            };

            // ==============================
            // Validation
            // ==============================

            if (!formData.Division) {
                showErrorMessage(
                    "দয়া করে বিভাগ নির্বাচন করুন।"
                );
                divisionSelect.focus();
                return;
            }

            if (!formData.District) {
                showErrorMessage(
                    "দয়া করে জেলা নির্বাচন করুন।"
                );
                districtSelect.focus();
                return;
            }

            if (!formData.Upazila) {
                showErrorMessage(
                    "দয়া করে উপজেলা নির্বাচন করুন।"
                );
                upazilaSelect.focus();
                return;
            }

            if (!formData.Area) {
                showErrorMessage(
                    "দয়া করে গ্রাম / এলাকার নাম লিখুন।"
                );
                areaInput.focus();
                return;
            }

            if (!formData.Ward) {
                showErrorMessage(
                    "দয়া করে ওয়ার্ড নির্বাচন করুন।"
                );
                wardSelect.focus();
                return;
            }

            if (!formData.Category) {
                showErrorMessage(
                    "দয়া করে সমস্যার ধরন নির্বাচন করুন।"
                );
                categorySelect.focus();
                return;
            }

            if (!formData.Description) {
                showErrorMessage(
                    "দয়া করে সমস্যার বিস্তারিত লিখুন।"
                );
                descriptionInput.focus();
                return;
            }

            // ==============================
            // Submit
            // ==============================

            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "জমা হচ্ছে...";

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            data: formData
                        })
                    });

                if (!response.ok) {

                    throw new Error(
                        "Server response: " +
                        response.status
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "Report submitted:",
                    result
                );

                // ==============================
                // Reset Form
                // ==============================

                reportForm.reset();

                districtSelect.innerHTML =
                    '<option value="">আগে বিভাগ নির্বাচন করুন</option>';

                upazilaSelect.innerHTML =
                    '<option value="">আগে জেলা নির্বাচন করুন</option>';

                districtSelect.disabled = true;
                upazilaSelect.disabled = true;

                // ==============================
                // Show Success
                // ==============================

                showSuccessMessage(
                    reportID
                );

            } catch (error) {

                console.error(
                    "Report submission error:",
                    error
                );

                showErrorMessage(
                    "সার্ভারে রিপোর্ট জমা দেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।"
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "রিপোর্ট জমা দিন";
            }
        }
    );

});
