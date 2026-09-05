// ==========================================
// আমাদের এলাকা — Report Form
// Division → District → Upazila
// SheetDB + Report ID + Copy
// ==========================================

const API_URL =
    "https://sheetdb.io/api/v1/ahhzymfhcwy1u";


document.addEventListener("DOMContentLoaded", function () {


    // ======================================
    // Elements
    // ======================================

    const divisionSelect =
        document.getElementById("division");

    const districtSelect =
        document.getElementById("district");

    const upazilaSelect =
        document.getElementById("upazila");

    const reportForm =
        document.getElementById("reportForm");

    const areaInput =
        document.getElementById("area");

    const wardSelect =
        document.getElementById("ward");

    const categorySelect =
        document.getElementById("category");

    const descriptionInput =
        document.getElementById("description");


    // ======================================
    // Check Elements
    // ======================================

    if (
        !divisionSelect ||
        !districtSelect ||
        !upazilaSelect ||
        !reportForm ||
        !areaInput ||
        !wardSelect ||
        !categorySelect ||
        !descriptionInput
    ) {

        console.error(
            "Report form element missing."
        );

        return;
    }


    // ======================================
    // Check Location Data
    // ======================================

    if (
        !window.locationData ||
        typeof window.locationData !== "object"
    ) {

        console.error(
            "locationData could not be loaded."
        );

        alert(
            "লোকেশন ডাটা লোড হয়নি। পেজটি আবার Refresh করুন।"
        );

        return;
    }


    // ======================================
    // Initial State
    // ======================================

    districtSelect.disabled = true;

    upazilaSelect.disabled = true;


    districtSelect.innerHTML =
        '<option value="">আগে বিভাগ নির্বাচন করুন</option>';


    upazilaSelect.innerHTML =
        '<option value="">আগে জেলা নির্বাচন করুন</option>';


    // ======================================
    // Division → District
    // ======================================

    divisionSelect.addEventListener(
        "change",
        function () {

            const division =
                this.value.trim();


            // Reset district

            districtSelect.innerHTML =
                '<option value="">জেলা নির্বাচন করুন</option>';


            // Reset upazila

            upazilaSelect.innerHTML =
                '<option value="">আগে জেলা নির্বাচন করুন</option>';

            upazilaSelect.disabled = true;


            // No division

            if (!division) {

                districtSelect.disabled = true;

                return;
            }


            // Find division

            const districts =
                window.locationData[division];


            // Division not found

            if (
                !districts ||
                typeof districts !== "object"
            ) {

                console.error(
                    "District data not found:",
                    division
                );

                districtSelect.disabled = true;

                return;
            }


            // Add districts

            Object.keys(districts).forEach(
                function (district) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        district;

                    option.textContent =
                        district;

                    districtSelect.appendChild(
                        option
                    );
                }
            );


            // Enable district

            districtSelect.disabled = false;

        }
    );


    // ======================================
    // District → Upazila
    // ======================================

    districtSelect.addEventListener(
        "change",
        function () {

            const division =
                divisionSelect.value.trim();

            const district =
                this.value.trim();


            // Reset upazila

            upazilaSelect.innerHTML =
                '<option value="">উপজেলা নির্বাচন করুন</option>';


            // No selection

            if (
                !division ||
                !district
            ) {

                upazilaSelect.disabled = true;

                return;
            }


            // Find district

            const upazilas =
                window.locationData?.[division]?.[district];


            // No upazila data

            if (
                !Array.isArray(upazilas)
            ) {

                console.error(
                    "Upazila data not found:",
                    division,
                    district
                );

                upazilaSelect.disabled = true;

                return;
            }


            // Add upazilas

            upazilas.forEach(
                function (upazila) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        upazila;

                    option.textContent =
                        upazila;

                    upazilaSelect.appendChild(
                        option
                    );
                }
            );


            // Enable upazila

            upazilaSelect.disabled = false;

        }
    );


    // ======================================
    // Generate Report ID
    // ======================================

    function generateReportID() {

        const now =
            new Date();


        const datePart =
            now.getFullYear().toString() +
            String(
                now.getMonth() + 1
            ).padStart(2, "0") +
            String(
                now.getDate()
            ).padStart(2, "0");


        const timePart =
            String(
                now.getHours()
            ).padStart(2, "0") +
            String(
                now.getMinutes()
            ).padStart(2, "0") +
            String(
                now.getSeconds()
            ).padStart(2, "0");


        const randomPart =
            Math.floor(
                100 + Math.random() * 900
            );


        return (
            "REP-" +
            datePart +
            "-" +
            timePart +
            "-" +
            randomPart
        );
    }


    // ======================================
    // Escape HTML
    // ======================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ======================================
    // Remove Messages
    // ======================================

    function removeMessages() {

        const success =
            document.getElementById(
                "reportSuccessMessage"
            );

        const error =
            document.getElementById(
                "reportErrorMessage"
            );


        if (success) {
            success.remove();
        }


        if (error) {
            error.remove();
        }
    }


    // ======================================
    // Success Message
    // ======================================

    function showSuccessMessage(reportID) {

        removeMessages();


        const message =
            document.createElement("div");


        message.id =
            "reportSuccessMessage";


        message.innerHTML = `

            <div class="success-icon">
                ✓
            </div>


            <div class="success-content">

                <h3>
                    রিপোর্ট সফলভাবে জমা হয়েছে!
                </h3>


                <p>
                    আপনার রিপোর্টটি সফলভাবে সংরক্ষণ করা হয়েছে।
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


        // Form-এর আগে দেখানো হবে

        reportForm.parentNode.insertBefore(
            message,
            reportForm
        );


        // ==================================
        // Copy Button
        // ==================================

        const copyButton =
            document.getElementById(
                "copyReportID"
            );


        copyButton.addEventListener(
            "click",
            async function () {

                let copied =
                    false;


                // Modern clipboard

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

                        console.log(
                            "Clipboard API failed."
                        );
                    }
                }


                // Fallback copy

                if (!copied) {

                    const textArea =
                        document.createElement(
                            "textarea"
                        );


                    textArea.value =
                        reportID;


                    textArea.style.position =
                        "fixed";

                    textArea.style.left =
                        "-9999px";

                    textArea.style.top =
                        "0";


                    document.body.appendChild(
                        textArea
                    );


                    textArea.focus();

                    textArea.select();


                    try {

                        copied =
                            document.execCommand(
                                "copy"
                            );

                    } catch (error) {

                        copied = false;
                    }


                    textArea.remove();
                }


                // Button feedback

                if (copied) {

                    copyButton.textContent =
                        "✓ কপি হয়েছে";


                    copyButton.classList.add(
                        "copied"
                    );


                    setTimeout(
                        function () {

                            if (
                                copyButton
                            ) {

                                copyButton.textContent =
                                    "📋 Copy";

                                copyButton.classList.remove(
                                    "copied"
                                );
                            }

                        },
                        2500
                    );

                } else {

                    copyButton.textContent =
                        "কপি করা যায়নি";


                    setTimeout(
                        function () {

                            if (
                                copyButton
                            ) {

                                copyButton.textContent =
                                    "📋 Copy";
                            }

                        },
                        2500
                    );
                }

            }
        );


        // ==================================
        // Close
        // ==================================

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


        // ==================================
        // Auto Hide
        // ==================================

        setTimeout(
            function () {

                if (
                    message &&
                    message.parentNode
                ) {

                    message.remove();
                }

            },
            12000
        );

    }


    // ======================================
    // Error Message
    // ======================================

    function showErrorMessage(text) {

        removeMessages();


        const message =
            document.createElement("div");


        message.id =
            "reportErrorMessage";


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
            message.querySelector(
                ".error-close"
            );


        closeButton.addEventListener(
            "click",
            function () {

                message.remove();

            }
        );

    }


    // ======================================
    // Form Submit
    // ======================================

    reportForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            removeMessages();


            const submitButton =
                reportForm.querySelector(
                    "button[type='submit']"
                );


            // ==================================
            // Get Values
            // ==================================

            const division =
                divisionSelect.value.trim();

            const district =
                districtSelect.value.trim();

            const upazila =
                upazilaSelect.value.trim();

            const area =
                areaInput.value.trim();

            const ward =
                wardSelect.value.trim();

            const category =
                categorySelect.value.trim();

            const description =
                descriptionInput.value.trim();


            // ==================================
            // Validation
            // ==================================

            if (!division) {

                showErrorMessage(
                    "দয়া করে বিভাগ নির্বাচন করুন।"
                );

                divisionSelect.focus();

                return;
            }


            if (!district) {

                showErrorMessage(
                    "দয়া করে জেলা নির্বাচন করুন।"
                );

                districtSelect.focus();

                return;
            }


            if (!upazila) {

                showErrorMessage(
                    "দয়া করে উপজেলা নির্বাচন করুন।"
                );

                upazilaSelect.focus();

                return;
            }


            if (!area) {

                showErrorMessage(
                    "দয়া করে গ্রাম / এলাকার নাম লিখুন।"
                );

                areaInput.focus();

                return;
            }


            if (!ward) {

                showErrorMessage(
                    "দয়া করে ওয়ার্ড নির্বাচন করুন।"
                );

                wardSelect.focus();

                return;
            }


            if (!category) {

                showErrorMessage(
                    "দয়া করে সমস্যার ধরন নির্বাচন করুন।"
                );

                categorySelect.focus();

                return;
            }


            if (!description) {

                showErrorMessage(
                    "দয়া করে সমস্যার বিস্তারিত লিখুন।"
                );

                descriptionInput.focus();

                return;
            }


            // ==================================
            // Generate ID
            // ==================================

            const reportID =
                generateReportID();


            // ==================================
            // Data
            // ==================================

            const formData = {

                ID: reportID,

                Division: division,

                District: district,

                Upazila: upazila,

                Area: area,

                Ward: ward,

                Category: category,

                Description: description,

                Date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                Status: "Pending",

                AdminNote: ""

            };


            // ==================================
            // Submit
            // ==================================

            try {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "জমা হচ্ছে...";


                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    data: formData
                                })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "HTTP Error " +
                        response.status
                    );
                }


                const result =
                    await response.json();


                console.log(
                    "Report submitted:",
                    result
                );


                // ==================================
                // Reset Form
                // ==================================

                reportForm.reset();


                districtSelect.innerHTML =
                    '<option value="">আগে বিভাগ নির্বাচন করুন</option>';


                upazilaSelect.innerHTML =
                    '<option value="">আগে জেলা নির্বাচন করুন</option>';


                districtSelect.disabled =
                    true;


                upazilaSelect.disabled =
                    true;


                // ==================================
                // Success
                // ==================================

                showSuccessMessage(
                    reportID
                );

            }


            catch (error) {

                console.error(
                    "Report submission error:",
                    error
                );


                showErrorMessage(
                    "সার্ভারে রিপোর্ট জমা দেওয়া সম্ভব হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।"
                );

            }


            finally {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "রিপোর্ট জমা দিন";

            }

        }
    );

});
