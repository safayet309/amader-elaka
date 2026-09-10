// =====================================================
// Amader Elaka - Dashboard Reports Module
// File: js/dashboard/reports.js
// =====================================================

(function () {
    "use strict";

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
    // Public API
    // =====================================

    window.DashboardReports = {
        fetchReports: fetchReports
    };

})();
