// =====================================================
// Amader Elaka - Dashboard Reports Module
// File: js/dashboard/reports.js
// =====================================================

(function () {
    "use strict";


    // =====================================
    // Configuration
    // =====================================

    const REPORT_TABLE = "Reports";


    // =====================================
    // Load Reports from Supabase
    // =====================================

    async function fetchReports() {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {
            throw new Error(
                "Supabase client is not loaded"
            );
        }


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


        return Array.isArray(data)
            ? data
            : [];
    }


    // =====================================
    // Display Reports
    // =====================================

    function displayReports(reports) {

        const reportsContainer =
            document.getElementById(
                "reportsContainer"
            );


        const noReports =
            document.getElementById(
                "noReports"
            );


        // ---------------------------------
        // Safety Check
        // ---------------------------------

        if (!reportsContainer) {
            return;
        }


        // ---------------------------------
        // Clear Previous Reports
        // ---------------------------------

        reportsContainer.innerHTML = "";


        // ---------------------------------
        // No Reports
        // ---------------------------------

        if (
            !Array.isArray(reports) ||
            reports.length === 0
        ) {

            if (noReports) {

                noReports.style.display =
                    "block";

            } else {

                reportsContainer.innerHTML = `
                    <div class="no-reports">

                        <h3>
                            কোনো রিপোর্ট পাওয়া যায়নি
                        </h3>

                        <p>
                            আপনার দেওয়া ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                        </p>

                    </div>
                `;
            }

            return;
        }


        // ---------------------------------
        // Hide No Reports Message
        // ---------------------------------

        if (noReports) {

            noReports.style.display =
                "none";
        }


        // ---------------------------------
        // Latest Reports First
        // ---------------------------------

        const sortedReports =
            [...reports].reverse();


        // =================================
        // Create Report Cards
        // =================================

        sortedReports.forEach(
            function (report) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "report-card";


                // Accessibility
                card.setAttribute(
                    "tabindex",
                    "0"
                );


                // =================================
                // Report Card HTML
                // =================================

                card.innerHTML = `

                    <div class="report-top">

                        <div>

                            <div class="report-category">
                                ${escapeHTML(
                                    report.Category ||
                                    "অন্যান্য"
                                )}
                            </div>


                            <div class="report-id">
                                রিপোর্ট ID:
                                ${escapeHTML(
                                    report.ID ||
                                    "N/A"
                                )}
                            </div>

                        </div>


                        <span class="report-status">
                            ${escapeHTML(
                                report.Status ||
                                "Pending"
                            )}
                        </span>

                    </div>


                    <div class="report-location">

                        📍

                        ${escapeHTML(
                            report.Division ||
                            ""
                        )}

                        ${
                            report.District
                                ? " → " +
                                  escapeHTML(
                                      report.District
                                  )
                                : ""
                        }

                        ${
                            report.Upazila
                                ? " → " +
                                  escapeHTML(
                                      report.Upazila
                                  )
                                : ""
                        }

                        ${
                            report.Area
                                ? " → " +
                                  escapeHTML(
                                      report.Area
                                  )
                                : ""
                        }

                    </div>


                    <div class="report-description">

                        ${escapeHTML(
                            shortenText(
                                report.Description ||
                                "কোনো বিবরণ নেই",
                                150
                            )
                        )}

                    </div>


                    <div class="report-date">

                        📅

                        ${escapeHTML(
                            report.Date ||
                            "তারিখ নেই"
                        )}

                    </div>

                `;


                // =================================
                // Click → Report Details
                // =================================

                card.addEventListener(
                    "click",
                    function () {

                        if (
                            typeof window.showReportDetails ===
                            "function"
                        ) {

                            window.showReportDetails(
                                report
                            );
                        }

                    }
                );


                // =================================
                // Keyboard Accessibility
                // =================================

                card.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();


                            if (
                                typeof window.showReportDetails ===
                                "function"
                            ) {

                                window.showReportDetails(
                                    report
                                );
                            }

                        }

                    }
                );


                // =================================
                // Add Card to Container
                // =================================

                reportsContainer.appendChild(
                    card
                );

            }
        );
    }


    // =====================================
    // Shorten Description
    // =====================================

    function shortenText(
        text,
        maxLength
    ) {

        text =
            String(text || "");


        if (
            text.length <= maxLength
        ) {

            return text;
        }


        return (
            text.substring(
                0,
                maxLength
            ) + "..."
        );
    }


    // =====================================
    // Escape HTML
    // =====================================

    function escapeHTML(value) {

        return String(value)

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


    // =====================================
    // Public API
    // =====================================

    window.DashboardReports = {

        fetchReports:
            fetchReports,

        displayReports:
            displayReports

    };


})();
