/* ==========================
   home-search.js
   Homepage report search box logic
   (loads + caches reports, filters, renders results)
========================== */


        const HOME_REPORT_TABLE = "Reports";


        const HOME_REPORT_CACHE_KEY =
            "amaderElaka_reports_cache";


        const HOME_REPORT_CACHE_TIME =
            60 * 1000;


        let homeReports = [];


        function getHomeCachedReports(
            ignoreExpiry = false
        ) {

            try {

                const cached =
                    localStorage.getItem(
                        HOME_REPORT_CACHE_KEY
                    );


                if (!cached) {
                    return null;
                }


                const data =
                    JSON.parse(cached);


                if (
                    !data ||
                    !Array.isArray(
                        data.reports
                    ) ||
                    !data.time
                ) {

                    return null;

                }


                const age =
                    Date.now() -
                    Number(data.time);


                if (
                    !ignoreExpiry &&
                    age > HOME_REPORT_CACHE_TIME
                ) {

                    return null;

                }


                return data.reports;

            } catch (error) {

                console.error(
                    "Home Cache Read Error:",
                    error
                );

                return null;

            }

        }


        async function loadHomeSearchReports() {

            /*
             * Use existing shared cache first.
             * This avoids an unnecessary SheetDB
             * request on Home Page.
             */

            const cachedReports =
                getHomeCachedReports();


            if (cachedReports) {

                homeReports =
                    cachedReports;

                return;

            }


            try {

                if (
                    typeof supabaseClient ===
                    "undefined"
                ) {

                    throw new Error(
                        "Supabase client is not loaded"
                    );

                }


                const { data, error } =
                    await supabaseClient
                        .from(
                            HOME_REPORT_TABLE
                        )
                        .select("*")
                        .order(
                            "Date",
                            { ascending: true }
                        );


                if (error) {

                    throw error;

                }


                homeReports =
                    Array.isArray(data)
                        ? data
                        : [];


                /*
                 * Save to shared cache.
                 */

                try {

                    localStorage.setItem(
                        HOME_REPORT_CACHE_KEY,
                        JSON.stringify({
                            time: Date.now(),
                            reports: homeReports
                        })
                    );

                } catch (cacheError) {

                    console.error(
                        "Home Cache Save Error:",
                        cacheError
                    );

                }

            } catch (error) {

                console.error(
                    "Home Search Error:",
                    error
                );


                /*
                 * Use old cache if API
                 * is temporarily unavailable.
                 */

                const oldReports =
                    getHomeCachedReports(
                        true
                    );


                homeReports =
                    oldReports || [];

            }

        }


        function escapeHomeSearchHTML(
            value
        ) {

            return String(
                value || ""
            )
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


        function searchHomeReports(
            searchValue
        ) {

            const resultsBox =
                document.getElementById(
                    "homeSearchResults"
                );


            if (!resultsBox) {
                return;
            }


            const query =
                String(
                    searchValue || ""
                )
                    .trim()
                    .toLowerCase();


            if (!query) {

                resultsBox.innerHTML =
                    "";

                resultsBox.style.display =
                    "none";

                return;

            }


            const results =
                homeReports
                    .filter(
                        function(report) {

                            const searchableText = [

                                report.ID,
                                report.Area,
                                report.Description,
                                report.Division,
                                report.District,
                                report.Upazila,
                                report.Category,
                                report.Status,
                                report.AdminNote

                            ]
                                .map(
                                    function(value) {

                                        return String(
                                            value || ""
                                        );

                                    }
                                )
                                .join(" ")
                                .toLowerCase();


                            return searchableText
                                .includes(
                                    query
                                );

                        }
                    )
                    .slice(0, 5);


            resultsBox.style.display =
                "block";


            if (!results.length) {

                resultsBox.innerHTML = `
                    <div class="home-search-empty">
                        কোনো রিপোর্ট পাওয়া যায়নি।
                        <br>
                        <small>
                            অন্য এলাকা, বিষয় বা রিপোর্ট ID দিয়ে চেষ্টা করুন।
                        </small>
                    </div>
                `;

                return;

            }


            resultsBox.innerHTML =
                results
                    .map(
                        function(report) {

                            const location = [

                                report.Division,
                                report.District,
                                report.Upazila,
                                report.Area

                            ]
                                .filter(Boolean)
                                .join(" → ");


                            return `
                                <div class="home-search-result">

                                    <strong>
                                        ${escapeHomeSearchHTML(
                                            report.Category ||
                                            "অন্যান্য"
                                        )}
                                    </strong>

                                    <span>
                                        📍
                                        ${escapeHomeSearchHTML(
                                            location ||
                                            "স্থান উল্লেখ নেই"
                                        )}

                                        <br>

                                        🆔
                                        ${escapeHomeSearchHTML(
                                            report.ID ||
                                            "N/A"
                                        )}

                                        &nbsp; | &nbsp;

                                        ${escapeHomeSearchHTML(
                                            report.Status ||
                                            "Pending"
                                        )}
                                    </span>

                                </div>
                            `;

                        }
                    )
                    .join("");

        }


        document.addEventListener(
            "DOMContentLoaded",
            function() {

                loadHomeSearchReports();


                const searchForm =
                    document.getElementById(
                        "homeSearchForm"
                    );


                const searchInput =
                    document.getElementById(
                        "homeSearchInput"
                    );


                if (
                    searchForm &&
                    searchInput
                ) {

                    searchForm.addEventListener(
                        "submit",
                        async function(event) {

                            event.preventDefault();


                            if (
                                !homeReports.length
                            ) {

                                await loadHomeSearchReports();

                            }


                            searchHomeReports(
                                searchInput.value
                            );

                        }
                    );


                    searchInput.addEventListener(
                        "input",
                        function() {

                            if (
                                searchInput.value.trim()
                            ) {

                                searchHomeReports(
                                    searchInput.value
                                );

                            } else {

                                const resultsBox =
                                    document.getElementById(
                                        "homeSearchResults"
                                    );


                                if (resultsBox) {

                                    resultsBox.innerHTML =
                                        "";

                                    resultsBox.style.display =
                                        "none";

                                }

                            }

                        }
                    );

                }

            }
        );

