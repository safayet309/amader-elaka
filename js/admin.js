 /* =========================================================
   Amader Elaka - Admin Panel
   Part-6: Final Integrated Admin JavaScript

   IMPORTANT:
   This file contains NO report/category functionality.
   Admin is now used for Dashboard Service Management.
   ========================================================= */


/* =========================================================
   01. CONFIGURATION
   ========================================================= */

const ADMIN_SERVICES_STORAGE_KEY =
    "amaderElaka_admin_services";

const ADMIN_SERVICE_VERSION =
    1;


/* =========================================================
   02. STATE
   ========================================================= */

let adminInitialized = false;

let adminServices = [];

let editingServiceId = null;

let authStateListenerRegistered = false;

let navigationInitialized = false;

let serviceManagementInitialized = false;

let serviceFormEventsInitialized = false;


/* =========================================================
   03. DEFAULT SERVICES
   ========================================================= */

const DEFAULT_ADMIN_SERVICES = [
    {
        id: "government-services",
        title: "সরকারি সেবা",
        description: "বাংলাদেশের গুরুত্বপূর্ণ সরকারি সেবার তথ্য ও প্রয়োজনীয় লিংক।",
        icon: "🏛️",
        url: "government.html",
        active: true,
        order: 1
    },

    {
        id: "emergency-services",
        title: "জরুরি সেবা",
        description: "জরুরি প্রয়োজনে প্রয়োজনীয় নম্বর ও সহায়তার তথ্য।",
        icon: "🚨",
        url: "index.html#emergency",
        active: true,
        order: 2
    }
];


/* =========================================================
   04. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeAdminAuth();
});


/* =========================================================
   05. ADMIN AUTHENTICATION
   ========================================================= */

async function initializeAdminAuth() {

    const loginScreen =
        document.getElementById("adminLoginScreen");

    const loginForm =
        document.getElementById("adminLoginForm");

    if (!loginScreen || !loginForm) {

        console.error(
            "Admin login elements not found."
        );

        return;
    }


    /* -----------------------------------------
       Login Form
    ----------------------------------------- */

    if (!loginForm.dataset.initialized) {

        loginForm.addEventListener(
            "submit",
            handleAdminLogin
        );

        loginForm.dataset.initialized = "true";
    }


    /* -----------------------------------------
       Check Supabase
    ----------------------------------------- */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient?.auth
    ) {

        console.error(
            "Supabase client is not available."
        );

        showLoginError(
            "Admin authentication system পাওয়া যাচ্ছে না।"
        );

        showLoginScreen();

        return;
    }


    /* -----------------------------------------
       Current Session
    ----------------------------------------- */

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {
            throw error;
        }


        if (data?.session) {

            await showAdminPanel();

        } else {

            showLoginScreen();
        }


    } catch (error) {

        console.error(
            "Admin session error:",
            error
        );

        showLoginError(
            "সেশন যাচাই করা যায়নি। আবার লগইন করুন।"
        );

        showLoginScreen();
    }


    /* -----------------------------------------
       Auth State Listener
    ----------------------------------------- */

    if (!authStateListenerRegistered) {

        authStateListenerRegistered = true;

        supabaseClient.auth.onAuthStateChange(
            async (event, session) => {

                if (session) {

                    await showAdminPanel();

                } else {

                    adminInitialized = false;

                    editingServiceId = null;

                    showLoginScreen();
                }
            }
        );
    }
}


/* =========================================================
   06. ADMIN LOGIN
   ========================================================= */

async function handleAdminLogin(event) {

    event.preventDefault();


    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const loginButton =
        document.getElementById("adminLoginButton");


    const email =
        String(emailInput?.value || "")
            .trim();

    const password =
        String(passwordInput?.value || "");


    clearLoginError();


    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    if (!email) {

        showLoginError(
            "ইমেইল ঠিকানা দিন।"
        );

        emailInput?.focus();

        return;
    }


    if (!password) {

        showLoginError(
            "পাসওয়ার্ড দিন।"
        );

        passwordInput?.focus();

        return;
    }


    /* -----------------------------------------
       Loading
    ----------------------------------------- */

    if (loginButton) {

        loginButton.disabled = true;

        loginButton.dataset.originalText =
            loginButton.textContent;

        loginButton.textContent =
            "লগইন হচ্ছে...";
    }


    try {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient?.auth
        ) {
            throw new Error(
                "Authentication system unavailable."
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {
            throw error;
        }


        if (!data?.session) {

            throw new Error(
                "লগইন সেশন তৈরি হয়নি।"
            );
        }


        /* -----------------------------------------
           Clear Form
        ----------------------------------------- */

        if (emailInput) {
            emailInput.value = "";
        }

        if (passwordInput) {
            passwordInput.value = "";
        }


        clearLoginError();


        await showAdminPanel();


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        let message =
            "লগইন করা যায়নি। আবার চেষ্টা করুন।";


        const errorMessage =
            String(error?.message || "")
                .toLowerCase();


        if (
            errorMessage.includes(
                "invalid login credentials"
            )
        ) {

            message =
                "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";

        } else if (
            errorMessage.includes(
                "email not confirmed"
            )
        ) {

            message =
                "এই ইমেইল এখনো যাচাই করা হয়নি।";

        } else if (error?.message) {

            message =
                error.message;
        }


        showLoginError(message);


    } finally {

        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                loginButton.dataset.originalText ||
                "লগইন করুন";
        }
    }
}


/* =========================================================
   07. LOGIN SCREEN
   ========================================================= */

function showLoginScreen() {

    const loginScreen =
        document.getElementById(
            "adminLoginScreen"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "flex";
    }


    const adminApp =
        document.getElementById("adminApp");


    if (adminApp) {

        adminApp.style.display =
            "none";
    }
}


/* =========================================================
   08. SHOW ADMIN PANEL
   ========================================================= */

async function showAdminPanel() {

    const loginScreen =
        document.getElementById(
            "adminLoginScreen"
        );

    const adminApp =
        document.getElementById("adminApp");


    if (loginScreen) {

        loginScreen.style.display =
            "none";
    }


    if (adminApp) {

        adminApp.style.display =
            "flex";
    }


    setupLogoutButton();


    if (!adminInitialized) {

        adminInitialized = true;

        initializeAdmin();

    } else {

        loadAdminServices();

        renderAdminServiceManagement();

        updateAdminStatistics();
    }
}


/* =========================================================
   09. LOGIN ERROR
   ========================================================= */

function showLoginError(message) {

    const errorElement =
        document.getElementById(
            "adminLoginError"
        );


    if (!errorElement) {
        return;
    }


    errorElement.textContent =
        String(message || "একটি সমস্যা হয়েছে।");


    errorElement.style.display =
        "block";


    errorElement.classList.add(
        "show"
    );
}


function clearLoginError() {

    const errorElement =
        document.getElementById(
            "adminLoginError"
        );


    if (!errorElement) {
        return;
    }


    errorElement.textContent = "";

    errorElement.style.display =
        "none";

    errorElement.classList.remove(
        "show"
    );
}


/* =========================================================
   10. ADMIN INITIALIZATION
   ========================================================= */

function initializeAdmin() {

    setupNavigation();

    setupServiceFoundation();

    initializeAdminServiceUI();

    loadAdminServices();

    renderAdminServiceManagement();

    updateAdminStatistics();

    switchSection("overview");
}


/* =========================================================
   11. NAVIGATION
   ========================================================= */

function setupNavigation() {

    if (navigationInitialized) {
        return;
    }


    navigationInitialized = true;


    /* -----------------------------------------
       Sidebar Navigation
    ----------------------------------------- */

    document
        .querySelectorAll(
            ".admin-nav-link[data-section]"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        link.dataset.section;

                    if (section) {
                        switchSection(section);
                    }
                }
            );
        });


    /* -----------------------------------------
       Other Section Buttons
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        button.dataset.sectionTarget;

                    if (section) {
                        switchSection(section);
                    }
                }
            );
        });
}


/* =========================================================
   12. SWITCH SECTION
   ========================================================= */

function switchSection(section) {

    if (!section) {
        return;
    }


    const normalizedSection =
        String(section).trim();


    /* -----------------------------------------
       Navigation Active State
    ----------------------------------------- */

    document
        .querySelectorAll(
            ".admin-nav-link[data-section]"
        )
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.section ===
                    normalizedSection
            );
        });


    /* -----------------------------------------
       Sections
    ----------------------------------------- */

    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(element => {

            element.classList.remove(
                "active"
            );
        });


    const target =
        document.getElementById(
            `${normalizedSection}Section`
        );


    if (target) {

        target.classList.add(
            "active"
        );
    }


    updateAdminPageHeader(
        normalizedSection
    );
}


/* =========================================================
   13. PAGE HEADER
   ========================================================= */

function updateAdminPageHeader(section) {

    const title =
        document.getElementById(
            "pageTitle"
        );

    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


    if (!title || !subtitle) {
        return;
    }


    const headers = {

        overview: {
            title: "ড্যাশবোর্ড",
            subtitle:
                "Dashboard service management overview"
        },

        services: {
            title: "সেবা ব্যবস্থাপনা",
            subtitle:
                "Dashboard-এর সেবা ও বাটন পরিচালনা করুন"
        }
    };


    const data =
        headers[section] ||
        headers.overview;


    title.textContent =
        data.title;

    subtitle.textContent =
        data.subtitle;
}


/* =========================================================
   14. SERVICE FOUNDATION
   ========================================================= */

function setupServiceFoundation() {

    if (!Array.isArray(adminServices)) {

        adminServices = [];
    }


    adminServices =
        adminServices
            .map(normalizeAdminService)
            .filter(Boolean);
}


/* =========================================================
   15. NORMALIZE SERVICE
   ========================================================= */

function normalizeAdminService(service, index = 0) {

    if (!service || typeof service !== "object") {
        return null;
    }


    const id =
        String(
            service.id ||
            service.serviceId ||
            `service-${Date.now()}-${index}`
        )
        .trim();


    const title =
        String(
            service.title ||
            service.name ||
            ""
        )
        .trim();


    if (!title) {
        return null;
    }


    const description =
        String(
            service.description ||
            ""
        )
        .trim();


    const icon =
        String(
            service.icon ||
            "🔗"
        )
        .trim();


    const url =
        String(
            service.url ||
            "#"
        )
        .trim();


    let order =
        Number(service.order);


    if (!Number.isFinite(order)) {

        order =
            index + 1;
    }


    return {

        id,

        title,

        description,

        icon,

        url,

        active:
            service.active !== false,

        order
    };
}


/* =========================================================
   16. LOAD SERVICES FROM LOCAL STORAGE
   ========================================================= */

function loadAdminServices() {

    let loadedServices = null;


    try {

        const raw =
            localStorage.getItem(
                ADMIN_SERVICES_STORAGE_KEY
            );


        if (raw) {

            const parsed =
                JSON.parse(raw);


            if (
                parsed &&
                Array.isArray(parsed.services)
            ) {

                loadedServices =
                    parsed.services;
            }
        }

    } catch (error) {

        console.error(
            "Admin services storage read error:",
            error
        );
    }


    /* -----------------------------------------
       First Run
    ----------------------------------------- */

    if (!Array.isArray(loadedServices)) {

        loadedServices =
            DEFAULT_ADMIN_SERVICES.map(
                service => ({
                    ...service
                })
            );


        saveAdminServices(
            loadedServices
        );
    }


    adminServices =
        loadedServices
            .map(normalizeAdminService)
            .filter(Boolean);


    adminServices =
        sortAdminServices(
            adminServices
        );


    return adminServices;
}


/* =========================================================
   17. SAVE SERVICES
   ========================================================= */

function saveAdminServices(
    services = adminServices
) {

    try {

        const normalized =
            (Array.isArray(services)
                ? services
                : []
            )
                .map(normalizeAdminService)
                .filter(Boolean);


        localStorage.setItem(
            ADMIN_SERVICES_STORAGE_KEY,
            JSON.stringify({
                version:
                    ADMIN_SERVICE_VERSION,

                updatedAt:
                    Date.now(),

                services:
                    normalized
            })
        );


        return true;

    } catch (error) {

        console.error(
            "Admin services storage save error:",
            error
        );

        return false;
    }
}


/* =========================================================
   18. GET SERVICES
   ========================================================= */

function getAdminServices() {

    return adminServices.map(
        service => ({
            ...service
        })
    );
}


/* =========================================================
   19. GET ACTIVE SERVICES
   ========================================================= */

function getActiveAdminServices() {

    return adminServices
        .filter(
            service =>
                service.active === true
        )
        .map(
            service => ({
                ...service
            })
        );
}


/* =========================================================
   20. CREATE SERVICE DATA
   ========================================================= */

function createServiceData(data = {}) {

    const service = {

        id:
            String(
                data.id ||
                generateServiceId()
            ).trim(),

        title:
            String(
                data.title ||
                ""
            ).trim(),

        description:
            String(
                data.description ||
                ""
            ).trim(),

        icon:
            String(
                data.icon ||
                "🔗"
            ).trim(),

        url:
            String(
                data.url ||
                "#"
            ).trim(),

        active:
            data.active !== false,

        order:
            Number(
                data.order
            )
    };


    if (!Number.isFinite(service.order)) {

        service.order =
            getNextServiceOrder();
    }


    return service;
}


/* =========================================================
   21. VALIDATE SERVICE
   ========================================================= */

function validateService(service) {

    if (!service) {

        return {
            valid: false,
            message:
                "সেবার তথ্য পাওয়া যায়নি।"
        };
    }


    if (!service.title) {

        return {
            valid: false,
            message:
                "সেবার নাম লিখুন।"
        };
    }


    if (service.title.length > 100) {

        return {
            valid: false,
            message:
                "সেবার নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে।"
        };
    }


    if (service.description.length > 300) {

        return {
            valid: false,
            message:
                "বিবরণ সর্বোচ্চ ৩০০ অক্ষরের হতে পারে।"
        };
    }


    if (!service.url) {

        return {
            valid: false,
            message:
                "সেবার লিংক দিন।"
        };
    }


    if (
        !isValidServiceUrl(
            service.url
        )
    ) {

        return {
            valid: false,
            message:
                "সঠিক URL বা local page link দিন।"
        };
    }


    if (
        !Number.isFinite(
            Number(service.order)
        )
    ) {

        return {
            valid: false,
            message:
                "Service order সঠিক নয়।"
        };
    }


    return {
        valid: true,
        message: ""
    };
}


/* =========================================================
   22. URL VALIDATION
   ========================================================= */

function isValidServiceUrl(url) {

    const value =
        String(url || "")
            .trim();


    if (!value) {
        return false;
    }


    /* -----------------------------------------
       Anchor
    ----------------------------------------- */

    if (value.startsWith("#")) {
        return true;
    }


    /* -----------------------------------------
       Relative URL
    ----------------------------------------- */

    if (
        value.startsWith("./") ||
        value.startsWith("../") ||
        value.startsWith("/")
    ) {
        return true;
    }


    /* -----------------------------------------
       Local HTML / PHP / etc.
    ----------------------------------------- */

    if (
        /^[a-zA-Z0-9_\-./]+(\?[^\s]*)?$/.test(
            value
        )
    ) {
        return true;
    }


    /* -----------------------------------------
       Absolute URL
    ----------------------------------------- */

    try {

        const parsed =
            new URL(value);


        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        );

    } catch {

        return false;
    }
}


/* =========================================================
   23. ADD SERVICE
   ========================================================= */

function addAdminService(data) {

    const service =
        createServiceData(data);


    const validation =
        validateService(service);


    if (!validation.valid) {

        showAdminMessage(
            "তথ্য অসম্পূর্ণ",
            validation.message,
            "error"
        );

        return null;
    }


    /* -----------------------------------------
       Unique ID
    ----------------------------------------- */

    if (
        adminServices.some(
            item =>
                item.id === service.id
        )
    ) {

        service.id =
            generateServiceId();
    }


    adminServices.push(
        service
    );


    adminServices =
        sortAdminServices(
            adminServices
        );


    saveAdminServices();


    renderAdminServiceManagement();

    updateAdminStatistics();

    syncServicesToDashboard();


    showAdminMessage(
        "সেবা যোগ হয়েছে",
        `"${service.title}" সফলভাবে যোগ করা হয়েছে।`,
        "success"
    );


    return {
        ...service
    };
}


/* =========================================================
   24. UPDATE SERVICE
   ========================================================= */

function updateAdminService(
    serviceId,
    data
) {

    const id =
        String(serviceId || "")
            .trim();


    const index =
        adminServices.findIndex(
            service =>
                service.id === id
        );


    if (index === -1) {

        showAdminMessage(
            "সেবা পাওয়া যায়নি",
            "যে সেবাটি edit করতে চাচ্ছেন সেটি পাওয়া যায়নি।",
            "error"
        );

        return null;
    }


    const updated =
        createServiceData({
            ...adminServices[index],
            ...data,
            id
        });


    const validation =
        validateService(updated);


    if (!validation.valid) {

        showAdminMessage(
            "তথ্য সঠিক নয়",
            validation.message,
            "error"
        );

        return null;
    }


    adminServices[index] =
        updated;


    adminServices =
        sortAdminServices(
            adminServices
        );


    saveAdminServices();


    renderAdminServiceManagement();

    updateAdminStatistics();

    syncServicesToDashboard();


    showAdminMessage(
        "সেবা আপডেট হয়েছে",
        `"${updated.title}" সফলভাবে আপডেট করা হয়েছে।`,
        "success"
    );


    return {
        ...updated
    };
}


/* =========================================================
   25. DELETE SERVICE
   ========================================================= */

function deleteAdminService(
    serviceId
) {

    const id =
        String(serviceId || "")
            .trim();


    const index =
        adminServices.findIndex(
            service =>
                service.id === id
        );


    if (index === -1) {

        showAdminMessage(
            "সেবা পাওয়া যায়নি",
            "সেবাটি পাওয়া যায়নি।",
            "error"
        );

        return false;
    }


    const service =
        adminServices[index];


    const confirmed =
        window.confirm(
            `"${service.title}" সেবাটি কি মুছে ফেলতে চান?`
        );


    if (!confirmed) {
        return false;
    }


    adminServices.splice(
        index,
        1
    );


    normalizeServiceOrders();


    saveAdminServices();


    renderAdminServiceManagement();

    updateAdminStatistics();

    syncServicesToDashboard();


    showAdminMessage(
        "সেবা মুছে ফেলা হয়েছে",
        `"${service.title}" আর Dashboard-এ থাকবে না।`,
        "success"
    );


    return true;
}


/* =========================================================
   26. TOGGLE SERVICE
   ========================================================= */

function toggleAdminService(
    serviceId
) {

    const id =
        String(serviceId || "")
            .trim();


    const service =
        adminServices.find(
            item =>
                item.id === id
        );


    if (!service) {

        showAdminMessage(
            "সেবা পাওয়া যায়নি",
            "সেবাটি পাওয়া যায়নি।",
            "error"
        );

        return null;
    }


    service.active =
        !service.active;


    saveAdminServices();


    renderAdminServiceManagement();

    updateAdminStatistics();

    syncServicesToDashboard();


    showAdminMessage(
        service.active
            ? "সেবা সক্রিয় হয়েছে"
            : "সেবা নিষ্ক্রিয় হয়েছে",

        service.active
            ? `"${service.title}" এখন Dashboard-এ দেখা যাবে।`
            : `"${service.title}" এখন Dashboard-এ দেখা যাবে না।`,

        "success"
    );


    return {
        ...service
    };
}


/* =========================================================
   27. SORT SERVICES
   ========================================================= */

function sortAdminServices(
    services
) {

    return (
        Array.isArray(services)
            ? [...services]
            : []
    ).sort(
        (a, b) => {

            const orderA =
                Number(a?.order) || 0;

            const orderB =
                Number(b?.order) || 0;


            if (orderA !== orderB) {

                return orderA - orderB;
            }


            return String(
                a?.title || ""
            ).localeCompare(
                String(
                    b?.title || ""
                ),
                "bn"
            );
        }
    );
}


/* =========================================================
   28. NORMALIZE SERVICE ORDERS
   ========================================================= */

function normalizeServiceOrders() {

    adminServices =
        sortAdminServices(
            adminServices
        );


    adminServices.forEach(
        (service, index) => {

            service.order =
                index + 1;
        }
    );
}


/* =========================================================
   29. NEXT ORDER
   ========================================================= */

function getNextServiceOrder() {

    if (!adminServices.length) {
        return 1;
    }


    const orders =
        adminServices
            .map(
                service =>
                    Number(service.order)
            )
            .filter(
                Number.isFinite
            );


    if (!orders.length) {
        return 1;
    }


    return (
        Math.max(...orders) + 1
    );
}


/* =========================================================
   30. GENERATE SERVICE ID
   ========================================================= */

function generateServiceId() {

    const timestamp =
        Date.now()
            .toString(36);


    const random =
        Math.random()
            .toString(36)
            .slice(2, 8);


    return (
        `service-${timestamp}-${random}`
    );
}


/* =========================================================
   31. GET SINGLE SERVICE
   ========================================================= */

function getAdminService(
    serviceId
) {

    const id =
        String(serviceId || "")
            .trim();


    const service =
        adminServices.find(
            item =>
                item.id === id
        );


    return service
        ? {
            ...service
        }
        : null;
}


/* =========================================================
   32. READ SERVICE FORM
   ========================================================= */

function readServiceForm() {

    const title =
        document.getElementById(
            "serviceTitle"
        );

    const description =
        document.getElementById(
            "serviceDescription"
        );

    const icon =
        document.getElementById(
            "serviceIcon"
        );

    const url =
        document.getElementById(
            "serviceUrl"
        );

    const active =
        document.getElementById(
            "serviceActive"
        );

    const order =
        document.getElementById(
            "serviceOrder"
        );

    const serviceId =
        document.getElementById(
            "serviceId"
        );


    return {

        id:
            String(
                serviceId?.value || ""
            ).trim(),

        title:
            String(
                title?.value || ""
            ).trim(),

        description:
            String(
                description?.value || ""
            ).trim(),

        icon:
            String(
                icon?.value || ""
            ).trim(),

        url:
            String(
                url?.value || ""
            ).trim(),

        active:
            active
                ? Boolean(active.checked)
                : true,

        order:
            Number(
                order?.value
            )
    };
}


/* =========================================================
   33. RESET SERVICE FORM
   ========================================================= */

function resetServiceForm() {

    const form =
        document.getElementById(
            "serviceForm"
        );


    if (form) {
        form.reset();
    }


    const serviceId =
        document.getElementById(
            "serviceId"
        );


    if (serviceId) {
        serviceId.value = "";
    }


    const active =
        document.getElementById(
            "serviceActive"
        );


    if (active) {
        active.checked = true;
    }


    const order =
        document.getElementById(
            "serviceOrder"
        );


    if (order) {

        order.value =
            getNextServiceOrder();
    }


    editingServiceId = null;


    if (form) {

        form.classList.remove(
            "is-editing"
        );
    }


    const cancelButton =
        document.getElementById(
            "cancelServiceEdit"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

        cancelButton.classList.remove(
            "is-visible"
        );
    }


    const saveButton =
        document.getElementById(
            "saveServiceButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "সেবা যোগ করুন";
    }
}


/* =========================================================
   34. EDIT SERVICE
   ========================================================= */

function editAdminService(
    serviceId
) {

    const service =
        getAdminService(
            serviceId
        );


    if (!service) {

        showAdminMessage(
            "সেবা পাওয়া যায়নি",
            "সেবাটি পাওয়া যায়নি।",
            "error"
        );

        return;
    }


    const form =
        document.getElementById(
            "serviceForm"
        );


    const idInput =
        document.getElementById(
            "serviceId"
        );

    const titleInput =
        document.getElementById(
            "serviceTitle"
        );

    const descriptionInput =
        document.getElementById(
            "serviceDescription"
        );

    const iconInput =
        document.getElementById(
            "serviceIcon"
        );

    const urlInput =
        document.getElementById(
            "serviceUrl"
        );

    const activeInput =
        document.getElementById(
            "serviceActive"
        );

    const orderInput =
        document.getElementById(
            "serviceOrder"
        );


    if (idInput) {
        idInput.value =
            service.id;
    }

    if (titleInput) {
        titleInput.value =
            service.title;
    }

    if (descriptionInput) {
        descriptionInput.value =
            service.description;
    }

    if (iconInput) {
        iconInput.value =
            service.icon;
    }

    if (urlInput) {
        urlInput.value =
            service.url;
    }

    if (activeInput) {
        activeInput.checked =
            service.active;
    }

    if (orderInput) {
        orderInput.value =
            service.order;
    }


    editingServiceId =
        service.id;


    if (form) {

        form.classList.add(
            "is-editing"
        );
    }


    const cancelButton =
        document.getElementById(
            "cancelServiceEdit"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "inline-flex";

        cancelButton.classList.add(
            "is-visible"
        );
    }


    const saveButton =
        document.getElementById(
            "saveServiceButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "সেবা আপডেট করুন";
    }


    switchSection("services");


    window.setTimeout(
        () => {

            titleInput?.focus();

        },
        50
    );
}


/* =========================================================
   35. CANCEL EDIT
   ========================================================= */

function cancelAdminServiceEdit() {

    resetServiceForm();

    showAdminMessage(
        "Edit বাতিল",
        "Service edit mode বন্ধ করা হয়েছে।",
        "info"
    );
}


/* =========================================================
   36. SERVICE FORM SUBMIT
   ========================================================= */

function handleServiceFormSubmit(
    event
) {

    event.preventDefault();


    const data =
        readServiceForm();


    if (editingServiceId) {

        updateAdminService(
            editingServiceId,
            data
        );

    } else {

        addAdminService(
            data
        );
    }


    resetServiceForm();
}


/* =========================================================
   37. SERVICE FORM SETUP
   ========================================================= */

function setupServiceManagement() {

    if (serviceManagementInitialized) {
        return;
    }


    serviceManagementInitialized = true;


    const form =
        document.getElementById(
            "serviceForm"
        );


    if (
        form &&
        !serviceFormEventsInitialized
    ) {

        form.addEventListener(
            "submit",
            handleServiceFormSubmit
        );


        serviceFormEventsInitialized =
            true;
    }


    const cancelButton =
        document.getElementById(
            "cancelServiceEdit"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                cancelAdminServiceEdit();
            }
        );
    }


    const servicesContainer =
        document.getElementById(
            "adminServicesManagement"
        );


    if (servicesContainer) {

        servicesContainer.addEventListener(
            "click",
            handleAdminServiceGridClick
        );
    }


    const overviewContainer =
        document.getElementById(
            "adminOverviewServices"
        );


    if (overviewContainer) {

        overviewContainer.addEventListener(
            "click",
            handleAdminServiceGridClick
        );
    }
}


/* =========================================================
   38. SERVICE UI INITIALIZATION
   ========================================================= */

function initializeAdminServiceUI() {

    setupServiceManagement();

    setupServiceFormStateWatcher();

    resetServiceForm();
}


/* =========================================================
   39. SERVICE FORM STATE WATCHER
   ========================================================= */

function setupServiceFormStateWatcher() {

    const title =
        document.getElementById(
            "serviceTitle"
        );

    const description =
        document.getElementById(
            "serviceDescription"
        );

    const icon =
        document.getElementById(
            "serviceIcon"
        );

    const url =
        document.getElementById(
            "serviceUrl"
        );

    const active =
        document.getElementById(
            "serviceActive"
        );

    const order =
        document.getElementById(
            "serviceOrder"
        );


    [
        title,
        description,
        icon,
        url,
        active,
        order
    ]
        .filter(Boolean)
        .forEach(element => {

            if (
                element.dataset.stateWatcher
            ) {
                return;
            }


            element.dataset.stateWatcher =
                "true";


            element.addEventListener(
                "input",
                updateServiceFormState
            );


            element.addEventListener(
                "change",
                updateServiceFormState
            );
        });
}


/* =========================================================
   40. SERVICE FORM STATE
   ========================================================= */

function updateServiceFormState() {

    const form =
        document.getElementById(
            "serviceForm"
        );


    if (!form) {
        return;
    }


    if (editingServiceId) {

        form.classList.add(
            "is-editing"
        );

    } else {

        form.classList.remove(
            "is-editing"
        );
    }
}


/* =========================================================
   41. CREATE SERVICE CARD
   ========================================================= */

function createAdminServiceManagementCard(
    service,
    options = {}
) {

    if (!service) {
        return "";
    }


    const escape =
        escapeAdminHTML;


    const isOverview =
        options.overview === true;


    const statusClass =
        service.active
            ? "active"
            : "inactive";


    const statusText =
        service.active
            ? "সক্রিয়"
            : "নিষ্ক্রিয়";


    const actionButtons =
        isOverview
            ? ""
            : `
                <div class="admin-service-actions">

                    <button
                        type="button"
                        class="admin-service-action"
                        data-action="edit"
                        data-service-id="${escape(service.id)}"
                    >
                        ✏️ এডিট
                    </button>

                    <button
                        type="button"
                        class="admin-service-action"
                        data-action="toggle"
                        data-service-id="${escape(service.id)}"
                    >
                        ${service.active ? "⏸️ নিষ্ক্রিয়" : "▶️ সক্রিয়"}
                    </button>

                    <button
                        type="button"
                        class="admin-service-action"
                        data-action="delete"
                        data-service-id="${escape(service.id)}"
                    >
                        🗑️ ডিলিট
                    </button>

                </div>
            `;


    return `

        <article
            class="admin-service-card"
            data-service-id="${escape(service.id)}"
        >

            <div class="admin-service-card-header">

                <div class="admin-service-icon">
                    ${escape(service.icon)}
                </div>

                <div class="admin-service-info">

                    <div class="admin-service-title">
                        ${escape(service.title)}
                    </div>

                    <div class="admin-service-description">
                        ${escape(
                            service.description ||
                            "কোনো বিবরণ দেওয়া হয়নি।"
                        )}
                    </div>

                </div>

                <span
                    class="admin-service-status ${statusClass}"
                >
                    ${statusText}
                </span>

            </div>


            <div class="admin-service-meta">

                <span class="admin-service-meta-item">
                    🔢 Order: ${escape(service.order)}
                </span>

                <span class="admin-service-meta-item">
                    🔗 ${escape(service.url)}
                </span>

            </div>


            ${actionButtons}

        </article>

    `;
}


/* =========================================================
   42. ESCAPE HTML
   ========================================================= */

function escapeAdminHTML(value) {

    return String(value ?? "")
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


/* =========================================================
   43. RENDER SERVICE MANAGEMENT
   ========================================================= */

function renderAdminServiceManagement() {

    const container =
        document.getElementById(
            "adminServicesManagement"
        );


    const emptyState =
        document.getElementById(
            "adminServicesEmpty"
        );


    if (!container) {
        return;
    }


    const sortedServices =
        sortAdminServices(
            adminServices
        );


    if (!sortedServices.length) {

        container.innerHTML = "";


        if (emptyState) {

            emptyState.style.display =
                "block";

            emptyState.classList.add(
                "is-visible"
            );
        }


        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";

        emptyState.classList.remove(
            "is-visible"
        );
    }


    container.innerHTML =
        sortedServices
            .map(
                service =>
                    createAdminServiceManagementCard(
                        service
                    )
            )
            .join("");
}


/* =========================================================
   44. RENDER OVERVIEW SERVICES
   ========================================================= */

function renderAdminOverviewServices() {

    const container =
        document.getElementById(
            "adminOverviewServices"
        );


    if (!container) {
        return;
    }


    const activeServices =
        getActiveAdminServices();


    if (!activeServices.length) {

        container.innerHTML = `

            <div class="admin-empty-state">

                <div class="admin-empty-icon">
                    🔗
                </div>

                <h3>
                    কোনো সক্রিয় সেবা নেই
                </h3>

                <p>
                    Service Management থেকে
                    নতুন সেবা যোগ করুন।
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        activeServices
            .map(
                service =>
                    createAdminServiceManagementCard(
                        service,
                        {
                            overview: true
                        }
                    )
            )
            .join("");
}


/* =========================================================
   45. RENDER ALL ADMIN SERVICE UI
   ========================================================= */

function refreshAdminServiceUI() {

    loadAdminServices();

    renderAdminServiceManagement();

    renderAdminOverviewServices();

    updateAdminStatistics();
}


/* =========================================================
   46. SERVICE GRID CLICK
   ========================================================= */

function handleAdminServiceGridClick(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;


    const serviceId =
        button.dataset.serviceId;


    if (!serviceId) {
        return;
    }


    if (action === "edit") {

        editAdminService(
            serviceId
        );

        return;
    }


    if (action === "toggle") {

        toggleAdminService(
            serviceId
        );

        return;
    }


    if (action === "delete") {

        deleteAdminService(
            serviceId
        );
    }
}


/* =========================================================
   47. STATISTICS
   ========================================================= */

function updateAdminStatistics() {

    const total =
        adminServices.length;


    const active =
        adminServices.filter(
            service =>
                service.active === true
        ).length;


    const inactive =
        adminServices.filter(
            service =>
                service.active !== true
        ).length;


    const totalElement =
        document.getElementById(
            "adminTotalServices"
        );

    const activeElement =
        document.getElementById(
            "adminActiveServices"
        );

    const inactiveElement =
        document.getElementById(
            "adminInactiveServices"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (activeElement) {

        activeElement.textContent =
            active;
    }


    if (inactiveElement) {

        inactiveElement.textContent =
            inactive;
    }


    renderAdminOverviewServices();
}


/* =========================================================
   48. SYNC SERVICES TO DASHBOARD
   ========================================================= */

function syncServicesToDashboard() {

    const activeServices =
        getActiveAdminServices();


    /*
     * Global variable
     * Dashboard JavaScript can read this.
     */

    window.AMADER_ELAKA_SERVICES =
        activeServices.map(
            service => ({
                ...service
            })
        );


    /*
     * Public event
     * Dashboard can listen for live updates.
     */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "amaderElakaServicesUpdated",
                {
                    detail: {
                        services:
                            activeServices
                    }
                }
            )
        );

    } catch (error) {

        console.warn(
            "Dashboard service event could not be dispatched:",
            error
        );
    }
}


/* =========================================================
   49. LOGOUT
   ========================================================= */

function setupLogoutButton() {

    const userBox =
        document.querySelector(
            ".admin-user"
        );


    if (!userBox) {
        return;
    }


    let logoutButton =
        document.getElementById(
            "adminLogoutBtn"
        );


    if (logoutButton) {
        return;
    }


    logoutButton =
        document.createElement(
            "button"
        );


    logoutButton.id =
        "adminLogoutBtn";

    logoutButton.type =
        "button";

    logoutButton.className =
        "admin-btn admin-btn-secondary";

    logoutButton.textContent =
        "Logout";


    logoutButton.addEventListener(
        "click",
        handleAdminLogout
    );


    userBox.appendChild(
        logoutButton
    );
}


/* =========================================================
   50. LOGOUT ACTION
   ========================================================= */

async function handleAdminLogout() {

    const logoutButton =
        document.getElementById(
            "adminLogoutBtn"
        );


    if (logoutButton) {

        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Logout হচ্ছে...";
    }


    try {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient?.auth
        ) {

            throw new Error(
                "Authentication system unavailable."
            );
        }


        const {
            error
        } =
            await supabaseClient.auth
                .signOut();


        if (error) {
            throw error;
        }


        adminInitialized =
            false;

        editingServiceId =
            null;


        showLoginScreen();


    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );


        showAdminMessage(
            "Logout সমস্যা",
            error?.message ||
                "Logout করা যায়নি।",
            "error"
        );


    } finally {

        if (logoutButton) {

            logoutButton.disabled =
                false;

            logoutButton.textContent =
                "Logout";
        }
    }
}


/* =========================================================
   51. ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(
    title,
    text,
    type = "info"
) {

    const message =
        document.getElementById(
            "adminMessage"
        );


    const icon =
        document.getElementById(
            "adminMessageIcon"
        );

    const titleElement =
        document.getElementById(
            "adminMessageTitle"
        );

    const textElement =
        document.getElementById(
            "adminMessageText"
        );


    if (!message) {
        return;
    }


    if (titleElement) {

        titleElement.textContent =
            title || "Message";
    }


    if (textElement) {

        textElement.textContent =
            text || "";
    }


    if (icon) {

        const icons = {

            success: "✓",

            error: "!",

            warning: "⚠",

            info: "i"
        };


        icon.textContent =
            icons[type] ||
            icons.info;
    }


    message.dataset.type =
        type;


    message.classList.add(
        "show"
    );


    if (
        message._hideTimer
    ) {

        clearTimeout(
            message._hideTimer
        );
    }


    message._hideTimer =
        setTimeout(
            () => {

                message.classList.remove(
                    "show"
                );

            },
            3500
        );
}


/* =========================================================
   52. PUBLIC ADMIN API
   ========================================================= */

window.AmaderElakaAdmin = {

    getServices() {

        return getAdminServices();
    },


    getActiveServices() {

        return getActiveAdminServices();
    },


    setServices(services) {

        if (!Array.isArray(services)) {
            return false;
        }


        adminServices =
            services
                .map(normalizeAdminService)
                .filter(Boolean);


        normalizeServiceOrders();

        saveAdminServices();

        renderAdminServiceManagement();

        updateAdminStatistics();

        syncServicesToDashboard();


        return true;
    },


    refresh() {

        refreshAdminServiceUI();

        syncServicesToDashboard();
    }
};


/* =========================================================
   53. PUBLIC SERVICE MANAGEMENT API
   ========================================================= */

window.AmaderElakaAdminServices = {

    add(data) {

        return addAdminService(
            data
        );
    },


    update(id, data) {

        return updateAdminService(
            id,
            data
        );
    },


    remove(id) {

        return deleteAdminService(
            id
        );
    },


    toggle(id) {

        return toggleAdminService(
            id
        );
    },


    get(id) {

        return getAdminService(
            id
        );
    },


    getAll() {

        return getAdminServices();
    },


    getActive() {

        return getActiveAdminServices();
    },


    refresh() {

        refreshAdminServiceUI();

        syncServicesToDashboard();
    }
};


/* =========================================================
   54. INITIAL DASHBOARD SYNC
   ========================================================= */

function initializeDashboardServiceSync() {

    loadAdminServices();

    syncServicesToDashboard();
}


/* =========================================================
   55. FINAL INITIALIZATION HOOK
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * This runs after the main initialization
         * and makes sure the Dashboard global
         * service data is available.
         */

        window.setTimeout(
            () => {

                if (
                    adminServices.length
                ) {

                    syncServicesToDashboard();
                }

            },
            100
        );
    }
);


/* =========================================================
   END OF ADMIN.JS
   ========================================================= */
