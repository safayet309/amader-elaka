 // js/report.js

const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

const divisionSelect = document.getElementById("division");
const districtSelect = document.getElementById("district");
const upazilaSelect = document.getElementById("upazila");
const reportForm = document.getElementById("reportForm");


// =========================
// Division → District
// =========================
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


// =========================
// District → Upazila
// =========================
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


// =========================
// Report ID
// =========================
function generateReportID() {
    return (
        "REP-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );
}


// =========================
// Success Message
// =========================
function showSuccessMessage(reportID) {
    // পুরোনো message থাকলে সরিয়ে দিন
    const oldMessage = document.getElementById("reportSuccessMessage");

    if (oldMessage) {
        oldMessage.remove();
    }

    const message = document.createElement("div");

    message.id = "reportSuccessMessage";

    message.innerHTML = `
        <div class="success-icon">✓</div>

        <div class="success-content">
            <h3>রিপোর্ট সফলভাবে জমা হয়েছে!</h3>
            <p>
                আপনার রিপোর্টটি আমাদের সিস্টেমে সংরক্ষণ করা হয়েছে।
            </p>
            <span>
                রিপোর্ট ID: <strong>${reportID}</strong>
            </span>
        </div>

        <button type="button" class="success-close" aria-label="বন্ধ করুন">
            ×
        </button>
    `;

    reportForm.parentNode.insertBefore(
        message,
        reportForm
    );

    // Close button
    const closeButton =
        message.querySelector(".success-close");

    closeButton.addEventListener("click", function () {
        message.remove();
    });

    // সুন্দরভাবে দেখানোর জন্য উপরে scroll
    setTimeout(function () {
        message.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);

    // 8 সেকেন্ড পর নিজে থেকে চলে যাবে
    setTimeout(function () {
        if (message && message.parentNode) {
            message.style.opacity = "0";
            message.style.transform = "translateY(-8px)";

            setTimeout(function () {
                if (message && message.parentNode) {
                    message.remove();
                }
            }, 300);
        }
    }, 8000);
}


// =========================
// Error Message
// =========================
function showErrorMessage(text) {
    const oldMessage =
        document.getElementById("reportErrorMessage");

    if (oldMessage) {
        oldMessage.remove();
    }

    const message = document.createElement("div");

    message.id = "reportErrorMessage";

    message.innerHTML = `
        <div class="error-icon">!</div>

        <div class="error-content">
            <h3>রিপোর্ট জমা দেওয়া যায়নি</h3>
            <p>${text}</p>
        </div>

        <button type="button" class="error-close">
            ×
        </button>
    `;

    reportForm.parentNode.insertBefore(
        message,
        reportForm
    );

    message
        .querySelector(".error-close")
        .addEventListener("click", function () {
            message.remove();
        });

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// =========================
// Submit Report
// =========================
reportForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton =
        reportForm.querySelector("button[type='submit']");

    const formData = {
        ID: generateReportID(),

        Division: divisionSelect.value,

        District: districtSelect.value,

        Upazila: upazilaSelect.value,

        Area:
            document
                .getElementById("area")
                .value
                .trim(),

        Ward:
            document.getElementById("ward").value,

        Category:
            document.getElementById("category").value,

        Description:
            document
                .getElementById("description")
                .value
                .trim(),

        Date:
            new Date()
                .toISOString()
                .split("T")[0],

        Status: "Pending",

        AdminNote: ""
    };


    // =========================
    // Validation
    // =========================
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


    try {
        submitButton.disabled = true;

        submitButton.textContent =
            "রিপোর্ট জমা হচ্ছে...";


        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                data: formData
            })
        });


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


        // =========================
        // Form Reset
        // =========================
        reportForm.reset();

        districtSelect.innerHTML =
            '<option value="">জেলা নির্বাচন করুন</option>';

        upazilaSelect.innerHTML =
            '<option value="">উপজেলা নির্বাচন করুন</option>';


        // =========================
        // সুন্দর Success Message
        // =========================
        showSuccessMessage(
            formData.ID
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
});
