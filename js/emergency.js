// ==========================================
// Amader Elaka - Emergency System
// Step-1: All Emergency Buttons
// ==========================================

(function () {
    "use strict";

    const emergencyNumbers = [
        {
            name: "জাতীয় জরুরি সেবা",
            number: "999",
            icon: "🚨",
            important: true
        },
        {
            name: "সরকারি তথ্য ও সেবা",
            number: "333",
            icon: "📞"
        },
        {
            name: "ফায়ার সার্ভিস",
            number: "102",
            icon: "🚒"
        },
        {
            name: "নারী ও শিশু সহায়তা",
            number: "109",
            icon: "👩"
        },
        {
            name: "শিশু সহায়তা",
            number: "1098",
            icon: "👶"
        },
        {
            name: "স্বাস্থ্য বাতায়ন",
            number: "16263",
            icon: "🏥"
        },
        {
            name: "কৃষি কল সেন্টার",
            number: "16123",
            icon: "🌾"
        },
        {
            name: "সরকারি আইনি সহায়তা",
            number: "16430",
            icon: "⚖️"
        },
        {
            name: "দুর্নীতি দমন কমিশন",
            number: "106",
            icon: "🔍"
        },
        {
            name: "দুর্যোগ পূর্বাভাস",
            number: "1090",
            icon: "🌪️"
        },
        {
            name: "বাংলাদেশ রেলওয়ে",
            number: "131",
            icon: "🚂"
        },
        {
            name: "ঢাকা ওয়াসা",
            number: "16162",
            icon: "💧"
        }
    ];

    // ==========================================
    // Elements
    // ==========================================

    const overlay =
        document.getElementById("emergencyOverlay");

    const closeButton =
        document.getElementById("emergencyClose");

    const emergencyList =
        document.getElementById("emergencyList");

    // ==========================================
    // All Emergency Buttons
    // ==========================================

    const emergencyButtons = [
        document.getElementById("emergencyButton"),
        document.getElementById("mobileEmergencyButton"),
        document.getElementById("homeEmergencyCard"),
        document.getElementById("footerEmergencyButton")
    ].filter(Boolean);

    // ==========================================
    // Render Emergency Numbers
    // ==========================================

    function renderEmergencyNumbers() {

        if (!emergencyList) {
            return;
        }

        emergencyList.innerHTML =
            emergencyNumbers
                .map(function (service) {

                    return `
                        <div class="emergency-card ${
                            service.important
                                ? "important"
                                : ""
                        }">

                            <div class="emergency-card-info">

                                <div class="emergency-card-icon">
                                    ${service.icon}
                                </div>

                                <div>
                                    <h3>
                                        ${service.name}
                                    </h3>

                                    <strong>
                                        ${service.number}
                                    </strong>
                                </div>

                            </div>

                            <div class="emergency-card-actions">

                                <a
                                    href="tel:${service.number}"
                                    class="emergency-call"
                                >
                                    📞 কল করুন
                                </a>

                                <button
                                    type="button"
                                    class="emergency-copy"
                                    data-number="${service.number}"
                                >
                                    📋 কপি
                                </button>

                            </div>

                        </div>
                    `;
                })
                .join("");
    }

    // ==========================================
    // Open
    // ==========================================

    function openEmergency() {

        if (!overlay) {
            return;
        }

        overlay.classList.add("show");

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }

    // ==========================================
    // Close
    // ==========================================

    function closeEmergency() {

        if (!overlay) {
            return;
        }

        overlay.classList.remove("show");

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }

    // ==========================================
    // Attach ALL Emergency Buttons
    // ==========================================

    emergencyButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openEmergency();
            }
        );
    });

    // ==========================================
    // Close Button
    // ==========================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEmergency
        );
    }

    // ==========================================
    // Outside Click
    // ==========================================

    if (overlay) {

        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === overlay
                ) {
                    closeEmergency();
                }
            }
        );
    }

    // ==========================================
    // ESC
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {
                closeEmergency();
            }
        }
    );

    // ==========================================
    // Copy Emergency Number
    // ==========================================

    async function copyNumber(
        number,
        button
    ) {

        try {

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                await navigator.clipboard.writeText(
                    number
                );

            } else {

                const textarea =
                    document.createElement("textarea");

                textarea.value = number;

                textarea.style.position =
                    "fixed";

                textarea.style.opacity = "0";

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand("copy");

                textarea.remove();
            }

        } catch (error) {

            console.error(
                "Emergency copy error:",
                error
            );
        }

        const oldText =
            button.textContent;

        button.textContent =
            "✓ কপি হয়েছে";

        setTimeout(
            function () {

                button.textContent =
                    oldText;

            },
            1500
        );
    }

    // ==========================================
    // Copy Button Delegation
    // ==========================================

    if (emergencyList) {

        emergencyList.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".emergency-copy"
                    );

                if (!button) {
                    return;
                }

                const number =
                    button.dataset.number;

                if (!number) {
                    return;
                }

                copyNumber(
                    number,
                    button
                );
            }
        );
    }

    // ==========================================
    // Initial Render
    // ==========================================

    renderEmergencyNumbers();

})();
