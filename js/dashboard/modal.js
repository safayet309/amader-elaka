// =====================================================
// Amader Elaka - Dashboard Report Modal
// File: js/dashboard/modal.js
// =====================================================

(function () {
    "use strict";


    // =====================================
    // Report Details Modal
    // =====================================

    function showReportDetails(report) {

        let modal =
            document.getElementById(
                "reportDetailsModal"
            );


        // ---------------------------------
        // Create Modal
        // ---------------------------------

        if (!modal) {

            modal =
                document.createElement("div");

            modal.id =
                "reportDetailsModal";

            modal.className =
                "report-modal";


            modal.innerHTML = `
                <div class="report-modal-overlay"></div>

                <div class="report-modal-box">

                    <button
                        type="button"
                        class="report-modal-close"
                        aria-label="বন্ধ করুন"
                    >
                        ×
                    </button>

                    <div id="reportModalContent"></div>

                </div>
            `;


            document.body.appendChild(
                modal
            );


            // ---------------------------------
            // Modal Controls
            // ---------------------------------

            const closeButton =
                modal.querySelector(
                    ".report-modal-close"
                );

            const overlay =
                modal.querySelector(
                    ".report-modal-overlay"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeReportModal
                );
            }


            if (overlay) {

                overlay.addEventListener(
                    "click",
                    closeReportModal
                );
            }


            // ---------------------------------
            // Escape Key
            // ---------------------------------

            document.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Escape" &&
                        modal.classList.contains("show")
                    ) {

                        closeReportModal();
                    }

                }
            );
        }


        // ---------------------------------
        // Modal Content
        // ---------------------------------

        const modalContent =
            document.getElementById(
                "reportModalContent"
            );


        if (!modalContent) {
            return;
        }


        // ---------------------------------
        // Report Information
        // ---------------------------------

        modalContent.innerHTML = `

            <div class="modal-category">
                ${escapeHTML(
                    report.Category ||
                    "অন্যান্য"
                )}
            </div>


            <h2>
                রিপোর্টের বিস্তারিত
            </h2>


            <div class="modal-info">

                <div>
                    <strong>
                        রিপোর্ট ID
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.ID ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        স্ট্যাটাস
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Status ||
                            "Pending"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        বিভাগ
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Division ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        জেলা
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.District ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        উপজেলা
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Upazila ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        এলাকা
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Area ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        ওয়ার্ড
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Ward ||
                            "N/A"
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        তারিখ
                    </strong>

                    <span>
                        ${escapeHTML(
                            report.Date ||
                            "N/A"
                        )}
                    </span>
                </div>

            </div>


            <div class="modal-description">

                <strong>
                    সমস্যার বিস্তারিত
                </strong>

                <p>
                    ${escapeHTML(
                        report.Description ||
                        "কোনো বিবরণ দেওয়া হয়নি।"
                    )}
                </p>

            </div>


            ${
                report.AdminNote
                    ? `
                        <div class="modal-description">

                            <strong>
                                কর্তৃপক্ষের মন্তব্য
                            </strong>

                            <p>
                                ${escapeHTML(
                                    report.AdminNote
                                )}
                            </p>

                        </div>
                      `
                    : ""
            }

        `;


        // ---------------------------------
        // Show Modal
        // ---------------------------------

        modal.classList.add(
            "show"
        );

        document.body.style.overflow =
            "hidden";
    }


    // =====================================
    // Close Modal
    // =====================================

    function closeReportModal() {

        const modal =
            document.getElementById(
                "reportDetailsModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";
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

    window.DashboardModal = {

        showReportDetails:
            showReportDetails,

        closeReportModal:
            closeReportModal

    };


    // =====================================
    // Global Bridge
    // =====================================

    window.showReportDetails =
        showReportDetails;

    window.closeReportModal =
        closeReportModal;


})();
