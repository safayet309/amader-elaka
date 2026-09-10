// =====================================
// Amader Elaka - Dashboard Statistics
// File: js/dashboard/stats.js
// =====================================

(function () {
    "use strict";

    function updateStatistics(reports) {

        if (!Array.isArray(reports)) {
            reports = [];
        }

        const total = reports.length;

        const pending = reports.filter(function (report) {

            return String(report.Status || "")
                .trim()
                .toLowerCase() === "pending";

        }).length;

        const progress = reports.filter(function (report) {

            const status =
                String(report.Status || "").trim();

            return (
                status === "কাজ চলছে" ||
                status.toLowerCase() === "in progress" ||
                status.toLowerCase() === "progress"
            );

        }).length;

        const solved = reports.filter(function (report) {

            const status =
                String(report.Status || "").trim();

            return (
                status === "সমাধান হয়েছে" ||
                status === "সমাধান হয়েছে" ||
                status.toLowerCase() === "solved"
            );

        }).length;

        animateNumber(
            document.getElementById("totalReports"),
            total
        );

        animateNumber(
            document.getElementById("pendingReports"),
            pending
        );

        animateNumber(
            document.getElementById("progressReports"),
            progress
        );

        animateNumber(
            document.getElementById("solvedReports"),
            solved
        );
    }


    // =====================================
    // Number Animation
    // =====================================

    function animateNumber(element, target) {

        if (!element) return;

        const start =
            Number(element.textContent) || 0;

        if (start === target) {

            element.textContent = target;

            return;
        }

        const duration = 500;

        const startTime =
            performance.now();

        function update(currentTime) {

            const progress =
                Math.min(
                    (currentTime - startTime) /
                        duration,
                    1
                );

            const value =
                Math.floor(
                    start +
                    (target - start) *
                        progress
                );

            element.textContent = value;

            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                element.textContent =
                    target;
            }
        }

        requestAnimationFrame(update);
    }


    // =====================================
    // Public API
    // =====================================

    window.DashboardStats = {
        updateStatistics: updateStatistics
    };

})();
