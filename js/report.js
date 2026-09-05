// =========================================================
// AMADER ELAKA - REPORT SUBMISSION
// js/report.js
// =========================================================

const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

const divisionSelect = document.getElementById("division");
const districtSelect = document.getElementById("district");
const upazilaSelect = document.getElementById("upazila");
const reportForm = document.getElementById("reportForm");


// =========================================================
// Division → District
// =========================================================

divisionSelect.addEventListener("change", function () {

    const division = this.value;

    districtSelect.innerHTML =
        '<option value="">জেলা নির্বাচন করুন</option>';

    upazilaSelect.innerHTML =
        '<option value="">উপজেলা নির্বাচন করুন</option>';

    if (!division || !locationData[division]) {
        return;
    }

    Object.keys(locationData[division]).forEach(function (district) {

        const option = document.createElement("option");

        option.value = district;
        option.textContent = district;

        districtSelect.appendChild(option);
    });
});


// =========================================================
// District → Upazila
// =========================================================

districtSelect.addEventListener("change", function () {

    const division = divisionSelect.value;
    const district = this.value;

    upazilaSelect.innerHTML =
        '<option value="">উপজেলা নির্বাচন করুন</option>';

    if (
        !division ||
        !district ||
        !locationData[division] ||
        !locationData[division][district]
    ) {
        return;
    }

    locationData[division][district].forEach(function (upazila) {

        const option = document.createElement("option");

        option.value = upazila;
        option.textContent = upazila;

        upazilaSelect.appendChild(option);
    });
});


// =========================================================
// Generate Report ID
// =========================================================

function generateReportID() {

    return (
        "REP-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );
}


// =========================================================
// Escape HTML
// Security protection
// =========================================================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// Success Message
// =========================================================

function showSuccessMessage(reportID) {

    // Remove previous success message
    const oldMessage =
        document.getElementById("reportSuccessMessage");

    if (oldMessage) {
        oldMessage.remove();
    }


    const message = document.createElement("div");

    message.id = "reportSuccessMessage";


    message.innerHTML = `

        <div class="success-icon">
            ✓
        </div>


        <div class="success-content">

            <h3>
                রিপোর্ট সফলভাবে জমা হয়েছে!
            </h3>

            <p>
                আপনার রিপোর্টটি আমাদের সিস্টেমে সংরক্ষণ করা হয়েছে।
            </p>


            <div class="report-id-box">

                <span class="report-id-label">
                    রিপোর্ট ID
                </span>

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


        <button
            type="button"
            class="success-close"
            aria-label="বন্ধ করুন"
        >
            ×
        </button>

    `;


    // Put message before form
    reportForm.parentNode.insertBefore(
        message,
        reportForm
    );


    // =====================================================
    // Close Button
    // =====================================================

    const closeButton =
        message.querySelector(".success-close");

    closeButton.addEventListener("click", function () {

        message.style.opacity = "0";
        message.style.transform =
            "translateY(-8px)";

        setTimeout(function () {

            if (message.parentNode) {
                message.remove();
            }

        }, 300);

    });


    // =====================================================
    // Copy Report ID
    // =====================================================

    const copyButton =
        message.querySelector("#copyReportID");


    copyButton.addEventListener("click", async function () {

        try {

            await navigator.clipboard.writeText(reportID);

            copyButton.textContent =
                "✓ কপি হয়েছে";

            copyButton.classList.add(
                "copied"
            );


            setTimeout(function () {

                copyButton.textContent =
                    "📋 Copy";

                copyButton.classList.remove(
                    "copied"
                );

            }, 2500);


        } catch (error) {

            // Fallback for older browsers

            const tempInput =
                document.createElement("input");

            tempInput.value = reportID;

            document.body.appendChild(
                tempInput
            );

            tempInput.select();

            document.execCommand("copy");

            tempInput.remove();


            copyButton.textContent =
                "✓ কপি হয়েছে";

            copyButton.classList.add(
                "copied"
            );


            setTimeout(function () {

                copyButton.textContent =
                    "📋 Copy";

                copyButton.classList.remove(
                    "copied"
                );

            }, 2500);
        }
    });


    // =====================================================
    // Scroll to Success Message
    // =====================================================

    setTimeout(function () {

        message.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 100);


    // =====================================================
    // Auto Hide
    // =====================================================

    setTimeout(function () {

        if (
            message &&
            message.parentNode
        ) {

            message.style.opacity = "0";

            message.style.transform =
                "translateY(-8px)";


            setTimeout(function () {

                if (
                    message &&
                    message.parentNode
                ) {
                    message.remove();
                }

            }, 300);
        }

    }, 12000);
}


// =========================================================
// Error Message
// =========================================================

function showErrorMessage(text) {

    const oldMessage =
        document.getElementById("reportErrorMessage");

    if (oldMessage) {
        oldMessage.remove();
    }


    const message = document.createElement("div");

    message.id = "reportErrorMessage";


    message.innerHTML = `

        <div class="error-icon">
            !
        </div>


        <div class="error-content">

            <h3>
                রিপোর্ট জমা দেওয়া যায়নি
            </h3>

            <p>
                ${escapeHTML(text)}
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


    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// =========================================================
// Submit Report
// =========================================================

reportForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const submitButton =
            reportForm.querySelector(
                "button[type='submit']"
            );


        // =====================================================
        // Generate ID
        // =====================================================

        const reportID =
            generateReportID();


        // =====================================================
        // Collect Form Data
        // =====================================================

        const formData = {

            ID: reportID,

            Division:
                divisionSelect.value,

            District:
                districtSelect.value,

            Upazila:
                upazilaSelect.value,

            Area:
                document
                    .getElementById("area")
                    .value
                    .trim(),

            Ward:
                document
                    .getElementById("ward")
                    .value,

            Category:
                document
                    .getElementById("category")
                    .value,

            Description:
                document
                    .getElementById("description")
                    .value
                    .trim(),

            Date:
                new Date()
                    .toISOString()
                    .split("T")[0],

            Status:
                "Pending",

            AdminNote:
                ""
        };


        // =====================================================
        // Validation
        // =====================================================

        if (
            !formData.Division ||
            !formData.District ||
            !formData.Upazila ||
            !formData.Area ||
            !formData.Ward ||
            !formData.Category ||
            !formData.Description
        ) {

            showErrorMessage(
                "দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।"
            );

            return;
        }


        // =====================================================
        // Submit to SheetDB
        // =====================================================

        try {

            submitButton.disabled = true;

            submitButton.textContent =
                "রিপোর্ট জমা হচ্ছে...";


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


            // =================================================
            // Check Response
            // =================================================

            if (!response.ok) {

                throw new Error(
                    "Report submission failed"
                );
            }


            const result =
                await response.json();


            console.log(
                "Report submitted successfully:",
                result
            );


            // =================================================
            // Reset Form
            // =================================================

            reportForm.reset();


            districtSelect.innerHTML =
                '<option value="">জেলা নির্বাচন করুন</option>';


            upazilaSelect.innerHTML =
                '<option value="">উপজেলা নির্বাচন করুন</option>';


            // =================================================
            // Show Success Message
            // =================================================

            showSuccessMessage(
                reportID
            );


        } catch (error) {

            console.error(
                "Report submission error:",
                error
            );


            showErrorMessage(
                "সাময়িকভাবে রিপোর্ট জমা দেওয়া সম্ভব হচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"
            );


        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "রিপোর্ট জমা দিন";
        }

    }
);
