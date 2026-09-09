/* =========================================================
   STEP 4 — HEALTHCARE MANAGEMENT
   Hospital + Doctor + Specialization
   ========================================================= */

const HEALTHCARE_TABLES = {
    hospitals: "Hospitals",
    doctors: "Doctors",
    specializations: "Specializations"
};

let healthcareHospitals = [];
let healthcareDoctors = [];
let healthcareSpecializations = [];

let healthcareInitialized = false;
let healthcareCurrentEdit = null;


/* =========================================================
   HEALTHCARE INITIALIZATION
   ========================================================= */

const originalInitializeAdmin = initializeAdmin;

initializeAdmin = async function (forceRefresh = false) {

    await originalInitializeAdmin(forceRefresh);

    await initializeHealthcareAdmin(forceRefresh);
};


async function initializeHealthcareAdmin(forceRefresh = false) {

    if (!document.getElementById("healthcareSection")) {
        return;
    }

    if (!healthcareInitialized) {
        healthcareInitialized = true;

        setupHealthcareEvents();
        setupHealthcareLocationFields();
    }

    await loadHealthcareData();
}


/* =========================================================
   HEALTHCARE DATA LOAD
   ========================================================= */

async function loadHealthcareData() {

    const container =
        document.getElementById("healthcareHospitalsList");

    if (container) {
        container.innerHTML =
            '<div class="admin-loading">Healthcare data লোড হচ্ছে...</div>';
    }

    try {

        const [
            hospitalsResponse,
            doctorsResponse,
            specializationsResponse
        ] = await Promise.all([

            supabaseClient
                .from(HEALTHCARE_TABLES.hospitals)
                .select("*")
                .order("name", { ascending: true }),

            supabaseClient
                .from(HEALTHCARE_TABLES.doctors)
                .select("*")
                .order("name", { ascending: true }),

            supabaseClient
                .from(HEALTHCARE_TABLES.specializations)
                .select("*")
                .order("name", { ascending: true })
        ]);


        if (hospitalsResponse.error) {
            throw hospitalsResponse.error;
        }

        if (doctorsResponse.error) {
            throw doctorsResponse.error;
        }

        if (specializationsResponse.error) {
            throw specializationsResponse.error;
        }


        healthcareHospitals =
            Array.isArray(hospitalsResponse.data)
                ? hospitalsResponse.data
                : [];


        healthcareDoctors =
            Array.isArray(doctorsResponse.data)
                ? doctorsResponse.data
                : [];


        healthcareSpecializations =
            Array.isArray(specializationsResponse.data)
                ? specializationsResponse.data
                : [];


        populateHealthcareSelects();
        renderHealthcareList();

    } catch (error) {

        console.error(
            "Healthcare loading error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty-icon">⚠️</div>
                    Healthcare data লোড করা যায়নি।
                    <br>
                    <small>${safe(error.message || "")}</small>
                </div>
            `;
        }
    }
}


/* =========================================================
   HEALTHCARE EVENTS
   ========================================================= */

function setupHealthcareEvents() {

    const search =
        document.getElementById("healthcareSearch");

    const typeFilter =
        document.getElementById("healthcareTypeFilter");

    const statusFilter =
        document.getElementById("healthcareStatusFilter");

    const refresh =
        document.getElementById("refreshHealthcareBtn");

    const addHospital =
        document.getElementById("addHospitalBtn");

    const addDoctor =
        document.getElementById("addDoctorBtn");

    const addSpecialization =
        document.getElementById("addSpecializationBtn");


    if (search) {
        search.addEventListener(
            "input",
            renderHealthcareList
        );
    }

    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            renderHealthcareList
        );
    }

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            renderHealthcareList
        );
    }


    if (refresh) {

        refresh.addEventListener(
            "click",
            async () => {

                refresh.disabled = true;

                const oldText =
                    refresh.textContent;

                refresh.textContent =
                    "লোড হচ্ছে...";

                try {

                    await loadHealthcareData();

                } finally {

                    refresh.disabled = false;
                    refresh.textContent =
                        oldText;
                }
            }
        );
    }


    if (addHospital) {

        addHospital.addEventListener(
            "click",
            () => openHealthcareModal("hospital")
        );
    }


    if (addDoctor) {

        addDoctor.addEventListener(
            "click",
            () => openHealthcareModal("doctor")
        );
    }


    if (addSpecialization) {

        addSpecialization.addEventListener(
            "click",
            () => openHealthcareModal("specialization")
        );
    }


    setupHealthcareModalEvents();
}


/* =========================================================
   HEALTHCARE LOCATION DROPDOWNS
   ========================================================= */

function setupHealthcareLocationFields() {

    const division =
        document.getElementById("hospitalDivision");

    const district =
        document.getElementById("hospitalDistrict");

    const upazila =
        document.getElementById("hospitalUpazila");


    if (!division || !district || !upazila) {
        return;
    }


    division.innerHTML =
        '<option value="">বিভাগ নির্বাচন করুন</option>';


    if (typeof locationData !== "undefined") {

        Object.keys(locationData).forEach(
            divisionName => {

                const option =
                    document.createElement("option");

                option.value =
                    divisionName;

                option.textContent =
                    divisionName;

                division.appendChild(option);
            }
        );
    }


    division.addEventListener(
        "change",
        () => {

            district.innerHTML =
                '<option value="">জেলা নির্বাচন করুন</option>';

            upazila.innerHTML =
                '<option value="">উপজেলা নির্বাচন করুন</option>';


            const selectedDivision =
                division.value;

            if (
                !selectedDivision ||
                typeof locationData === "undefined"
            ) {
                return;
            }


            const districts =
                locationData[selectedDivision];


            Object.keys(districts || {}).forEach(
                districtName => {

                    const option =
                        document.createElement("option");

                    option.value =
                        districtName;

                    option.textContent =
                        districtName;

                    district.appendChild(option);
                }
            );
        }
    );


    district.addEventListener(
        "change",
        () => {

            upazila.innerHTML =
                '<option value="">উপজেলা নির্বাচন করুন</option>';

            const selectedDivision =
                division.value;

            const selectedDistrict =
                district.value;


            if (
                !selectedDivision ||
                !selectedDistrict ||
                typeof locationData === "undefined"
            ) {
                return;
            }


            const upazilas =
                locationData[
                    selectedDivision
                ]?.[
                    selectedDistrict
                ] || [];


            upazilas.forEach(
                upazilaName => {

                    const option =
                        document.createElement("option");

                    option.value =
                        upazilaName;

                    option.textContent =
                        upazilaName;

                    upazila.appendChild(option);
                }
            );
        }
    );
}


/* =========================================================
   POPULATE SELECTS
   ========================================================= */

function populateHealthcareSelects() {

    const hospitalSelect =
        document.getElementById("doctorHospital");

    const specializationSelect =
        document.getElementById("doctorSpecialization");


    if (hospitalSelect) {

        const current =
            hospitalSelect.value;

        hospitalSelect.innerHTML =
            '<option value="">হাসপাতাল নির্বাচন করুন</option>';


        healthcareHospitals
            .filter(hospital => hospital.active !== false)
            .forEach(hospital => {

                const option =
                    document.createElement("option");

                option.value =
                    hospital.id;

                option.textContent =
                    hospital.name;

                hospitalSelect.appendChild(option);
            });


        if (current) {
            hospitalSelect.value =
                current;
        }
    }


    if (specializationSelect) {

        const current =
            specializationSelect.value;

        specializationSelect.innerHTML =
            '<option value="">Specialization নির্বাচন করুন</option>';


        healthcareSpecializations
            .filter(item => item.active !== false)
            .forEach(item => {

                const option =
                    document.createElement("option");

                option.value =
                    item.id;

                option.textContent =
                    `${item.icon || "🩺"} ${item.name}`;

                specializationSelect.appendChild(
                    option
                );
            });


        if (current) {
            specializationSelect.value =
                current;
        }
    }
}


/* =========================================================
   HEALTHCARE LIST
   ========================================================= */

function renderHealthcareList() {

    const container =
        document.getElementById(
            "healthcareHospitalsList"
        );

    if (!container) return;


    const search =
        String(
            document.getElementById(
                "healthcareSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const type =
        document.getElementById(
            "healthcareTypeFilter"
        )?.value || "";


    const status =
        document.getElementById(
            "healthcareStatusFilter"
        )?.value || "";


    let hospitals =
        healthcareHospitals.filter(
            hospital => {

                const searchable = [
                    hospital.name,
                    hospital.division,
                    hospital.district,
                    hospital.upazila,
                    hospital.address,
                    hospital.phone
                ]
                    .map(
                        value =>
                            String(
                                value || ""
                            ).toLowerCase()
                    )
                    .join(" ");


                return (
                    (!search ||
                        searchable.includes(search)) &&

                    (!type ||
                        String(
                            hospital.type || ""
                        ) === type) &&

                    (
                        status === "" ||
                        String(
                            hospital.active !== false
                        ) === status
                    )
                );
            }
        );


    if (!hospitals.length) {

        container.innerHTML = `
            <div class="admin-empty">
                <div class="admin-empty-icon">🏥</div>
                কোনো হাসপাতাল পাওয়া যায়নি।
            </div>
        `;

        return;
    }


    container.innerHTML =
        hospitals
            .map(hospital => {

                const doctors =
                    healthcareDoctors.filter(
                        doctor =>
                            Number(
                                doctor.hospital_id
                            ) ===
                            Number(
                                hospital.id
                            )
                    );


                return `
                    <div class="category-admin-item"
                         style="display:block;margin-bottom:14px;">

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            align-items:flex-start;
                            flex-wrap:wrap;
                        ">

                            <div class="category-admin-left">

                                <div class="category-admin-icon">
                                    🏥
                                </div>

                                <div>

                                    <strong>
                                        ${safe(
                                            hospital.name ||
                                            "নাম নেই"
                                        )}
                                    </strong>

                                    <div style="
                                        margin-top:5px;
                                        color:#6b7280;
                                        font-size:13px;
                                    ">
                                        ${safe(
                                            hospital.type ||
                                            ""
                                        )}

                                        ${
                                            hospital.district
                                                ? " • " +
                                                  safe(
                                                      hospital.district
                                                  )
                                                : ""
                                        }

                                        ${
                                            hospital.upazila
                                                ? " • " +
                                                  safe(
                                                      hospital.upazila
                                                  )
                                                : ""
                                        }
                                    </div>

                                    ${
                                        hospital.phone
                                            ? `
                                                <div style="
                                                    margin-top:5px;
                                                    font-size:13px;
                                                ">
                                                    📞 ${safe(
                                                        hospital.phone
                                                    )}
                                                </div>
                                              `
                                            : ""
                                    }

                                    <div style="
                                        margin-top:6px;
                                        font-size:12px;
                                        color:#6b7280;
                                    ">
                                        Doctor:
                                        ${doctors.length}
                                        •
                                        ${
                                            hospital.active !== false
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    </div>

                                </div>

                            </div>


                            <div class="category-admin-actions">

                                <button
                                    type="button"
                                    class="admin-btn admin-btn-secondary"
                                    onclick="openHealthcareModal('hospital', ${Number(hospital.id)})"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="admin-btn admin-btn-secondary"
                                    onclick="toggleHospitalActive(${Number(hospital.id)})"
                                >
                                    ${
                                        hospital.active !== false
                                            ? "⏸️ Inactive"
                                            : "▶️ Active"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="admin-btn admin-btn-danger"
                                    onclick="deleteHospital(${Number(hospital.id)})"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>


                        ${
                            doctors.length
                                ? `
                                    <div style="
                                        margin-top:15px;
                                        padding-top:12px;
                                        border-top:1px solid #e5e7eb;
                                    ">

                                        <strong style="
                                            display:block;
                                            margin-bottom:8px;
                                            font-size:14px;
                                        ">
                                            👨‍⚕️ Doctors (${doctors.length})
                                        </strong>

                                        ${doctors
                                            .map(
                                                doctor => {

                                                    const specialization =
                                                        healthcareSpecializations.find(
                                                            item =>
                                                                Number(
                                                                    item.id
                                                                ) ===
                                                                Number(
                                                                    doctor.specialization_id
                                                                )
                                                        );


                                                    return `
                                                        <div style="
                                                            display:flex;
                                                            justify-content:space-between;
                                                            gap:12px;
                                                            align-items:center;
                                                            padding:9px 0;
                                                            border-top:1px solid #f1f5f9;
                                                            flex-wrap:wrap;
                                                        ">

                                                            <div>

                                                                <strong>
                                                                    ${safe(
                                                                        doctor.name
                                                                    )}
                                                                </strong>

                                                                <small style="
                                                                    display:block;
                                                                    color:#6b7280;
                                                                    margin-top:3px;
                                                                ">

                                                                    ${
                                                                        specialization
                                                                            ? safe(
                                                                                specialization.name
                                                                            )
                                                                            : "Specialization নেই"
                                                                    }

                                                                    ${
                                                                        doctor.designation
                                                                            ? " • " +
                                                                              safe(
                                                                                  doctor.designation
                                                                              )
                                                                            : ""
                                                                    }

                                                                </small>

                                                            </div>

                                                            <div class="category-admin-actions">

                                                                <button
                                                                    type="button"
                                                                    class="admin-btn admin-btn-secondary"
                                                                    onclick="openHealthcareModal('doctor', ${Number(doctor.id)})"
                                                                >
                                                                    ✏️
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    class="admin-btn admin-btn-secondary"
                                                                    onclick="toggleDoctorActive(${Number(doctor.id)})"
                                                                >
                                                                    ${
                                                                        doctor.active !== false
                                                                            ? "⏸️"
                                                                            : "▶️"
                                                                    }
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    class="admin-btn admin-btn-danger"
                                                                    onclick="deleteDoctor(${Number(doctor.id)})"
                                                                >
                                                                    🗑️
                                                                </button>

                                                            </div>

                                                        </div>
                                                    `;
                                                }
                                            )
                                            .join("")}

                                    </div>
                                `
                                : `
                                    <div style="
                                        margin-top:12px;
                                        color:#9ca3af;
                                        font-size:13px;
                                    ">
                                        এই হাসপাতালে এখনো কোনো Doctor যোগ করা হয়নি।
                                    </div>
                                `
                        }

                    </div>
                `;
            })
            .join("");
}


/* =========================================================
   MODAL EVENTS
   ========================================================= */

function setupHealthcareModalEvents() {

    const modalConfigs = [

        [
            "hospitalModal",
            "closeHospitalModal",
            "cancelHospital"
        ],

        [
            "doctorModal",
            "closeDoctorModal",
            "cancelDoctor"
        ],

        [
            "specializationModal",
            "closeSpecializationModal",
            "cancelSpecialization"
        ]
    ];


    modalConfigs.forEach(
        ([modalId, closeId, cancelId]) => {

            const modal =
                document.getElementById(modalId);

            const close =
                document.getElementById(closeId);

            const cancel =
                document.getElementById(cancelId);

            const overlay =
                modal?.querySelector(
                    ".admin-modal-overlay"
                );


            if (close) {
                close.addEventListener(
                    "click",
                    closeHealthcareModal
                );
            }

            if (cancel) {
                cancel.addEventListener(
                    "click",
                    closeHealthcareModal
                );
            }

            if (overlay) {
                overlay.addEventListener(
                    "click",
                    closeHealthcareModal
                );
            }
        }
    );


    const hospitalForm =
        document.getElementById(
            "hospitalForm"
        );

    const doctorForm =
        document.getElementById(
            "doctorForm"
        );

    const specializationForm =
        document.getElementById(
            "specializationForm"
        );


    if (hospitalForm) {
        hospitalForm.addEventListener(
            "submit",
            saveHospital
        );
    }

    if (doctorForm) {
        doctorForm.addEventListener(
            "submit",
            saveDoctor
        );
    }

    if (specializationForm) {
        specializationForm.addEventListener(
            "submit",
            saveSpecialization
        );
    }
}


/* =========================================================
   OPEN MODAL
   ========================================================= */

async function openHealthcareModal(
    type,
    id = null
) {

    healthcareCurrentEdit = {
        type,
        id
    };


    if (type === "hospital") {

        const modal =
            document.getElementById(
                "hospitalModal"
            );

        if (!modal) return;


        resetHospitalForm();


        if (id) {

            const hospital =
                healthcareHospitals.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );


            if (!hospital) return;


            fillHospitalForm(
                hospital
            );


            document.getElementById(
                "hospitalModalTitle"
            ).textContent =
                "হাসপাতাল সম্পাদনা";

        } else {

            document.getElementById(
                "hospitalModalTitle"
            ).textContent =
                "নতুন হাসপাতাল";
        }


        modal.classList.add("active");

        document.body.style.overflow =
            "hidden";

        return;
    }


    if (type === "doctor") {

        const modal =
            document.getElementById(
                "doctorModal"
            );

        if (!modal) return;


        resetDoctorForm();

        populateHealthcareSelects();


        if (id) {

            const doctor =
                healthcareDoctors.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );


            if (!doctor) return;


            fillDoctorForm(
                doctor
            );


            document.getElementById(
                "doctorModalTitle"
            ).textContent =
                "ডাক্তার সম্পাদনা";

        } else {

            document.getElementById(
                "doctorModalTitle"
            ).textContent =
                "নতুন ডাক্তার";
        }


        modal.classList.add("active");

        document.body.style.overflow =
            "hidden";

        return;
    }


    if (type === "specialization") {

        const modal =
            document.getElementById(
                "specializationModal"
            );

        if (!modal) return;


        resetSpecializationForm();


        modal.classList.add("active");

        document.body.style.overflow =
            "hidden";
    }
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeHealthcareModal() {

    [
        "hospitalModal",
        "doctorModal",
        "specializationModal"
    ].forEach(id => {

        const modal =
            document.getElementById(id);

        if (modal) {
            modal.classList.remove("active");
        }
    });


    healthcareCurrentEdit =
        null;

    document.body.style.overflow =
        "";
}


/* =========================================================
   HOSPITAL FORM
   ========================================================= */

function resetHospitalForm() {

    const form =
        document.getElementById(
            "hospitalForm"
        );

    if (form) {
        form.reset();
    }


    const id =
        document.getElementById(
            "hospitalId"
        );

    if (id) {
        id.value = "";
    }


    const division =
        document.getElementById(
            "hospitalDivision"
        );

    const district =
        document.getElementById(
            "hospitalDistrict"
        );

    const upazila =
        document.getElementById(
            "hospitalUpazila"
        );


    if (division) {

        division.value = "";

        if (
            typeof locationData !== "undefined"
        ) {

            district.innerHTML =
                '<option value="">জেলা নির্বাচন করুন</option>';

            upazila.innerHTML =
                '<option value="">উপজেলা নির্বাচন করুন</option>';
        }
    }
}


function fillHospitalForm(
    hospital
) {

    document.getElementById(
        "hospitalId"
    ).value =
        hospital.id || "";


    document.getElementById(
        "hospitalName"
    ).value =
        hospital.name || "";


    document.getElementById(
        "hospitalType"
    ).value =
        hospital.type || "সরকারি";


    const division =
        document.getElementById(
            "hospitalDivision"
        );

    const district =
        document.getElementById(
            "hospitalDistrict"
        );

    const upazila =
        document.getElementById(
            "hospitalUpazila"
        );


    if (division) {

        division.value =
            hospital.division || "";

        division.dispatchEvent(
            new Event("change")
        );
    }


    if (district) {

        district.value =
            hospital.district || "";

        district.dispatchEvent(
            new Event("change")
        );
    }


    if (upazila) {

        upazila.value =
            hospital.upazila || "";
    }


    document.getElementById(
        "hospitalPhone"
    ).value =
        hospital.phone || "";


    document.getElementById(
        "hospitalEmergencyPhone"
    ).value =
        hospital.emergency_phone || "";


    document.getElementById(
        "hospitalOpeningHours"
    ).value =
        hospital.opening_hours || "";


    document.getElementById(
        "hospitalVerifiedAt"
    ).value =
        hospital.verified_at || "";


    document.getElementById(
        "hospitalAddress"
    ).value =
        hospital.address || "";


    document.getElementById(
        "hospitalDepartments"
    ).value =
        hospital.departments || "";


    document.getElementById(
        "hospitalEmergencyAvailable"
    ).value =
        hospital.emergency_available
            ? "true"
            : "false";


    document.getElementById(
        "hospitalSourceUrl"
    ).value =
        hospital.source_url || "";


    document.getElementById(
        "hospitalWebsite"
    ).value =
        hospital.website || "";


    document.getElementById(
        "hospitalMapUrl"
    ).value =
        hospital.map_url || "";


    document.getElementById(
        "hospitalLatitude"
    ).value =
        hospital.latitude ?? "";


    document.getElementById(
        "hospitalLongitude"
    ).value =
        hospital.longitude ?? "";


    document.getElementById(
        "hospitalActive"
    ).value =
        hospital.active === false
            ? "false"
            : "true";
}


/* =========================================================
   SAVE HOSPITAL
   ========================================================= */

async function saveHospital(event) {

    event.preventDefault();


    const button =
        event.currentTarget.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled = true;
        button.textContent =
            "সংরক্ষণ হচ্ছে...";
    }


    try {

        const id =
            document.getElementById(
                "hospitalId"
            )?.value;


        const payload = {

            name:
                document.getElementById(
                    "hospitalName"
                ).value.trim(),

            type:
                document.getElementById(
                    "hospitalType"
                ).value,

            division:
                document.getElementById(
                    "hospitalDivision"
                ).value,

            district:
                document.getElementById(
                    "hospitalDistrict"
                ).value,

            upazila:
                document.getElementById(
                    "hospitalUpazila"
                ).value,

            address:
                document.getElementById(
                    "hospitalAddress"
                ).value.trim(),

            phone:
                document.getElementById(
                    "hospitalPhone"
                ).value.trim(),

            emergency_phone:
                document.getElementById(
                    "hospitalEmergencyPhone"
                ).value.trim(),

            emergency_available:
                document.getElementById(
                    "hospitalEmergencyAvailable"
                ).value === "true",

            departments:
                document.getElementById(
                    "hospitalDepartments"
                ).value.trim(),

            opening_hours:
                document.getElementById(
                    "hospitalOpeningHours"
                ).value.trim(),

            latitude:
                numberOrNull(
                    "hospitalLatitude"
                ),

            longitude:
                numberOrNull(
                    "hospitalLongitude"
                ),

            map_url:
                document.getElementById(
                    "hospitalMapUrl"
                ).value.trim(),

            website:
                document.getElementById(
                    "hospitalWebsite"
                ).value.trim(),

            source_url:
                document.getElementById(
                    "hospitalSourceUrl"
                ).value.trim(),

            verified_at:
                document.getElementById(
                    "hospitalVerifiedAt"
                ).value || null,

            active:
                document.getElementById(
                    "hospitalActive"
                ).value === "true"
        };


        if (!payload.name) {
            throw new Error(
                "হাসপাতালের নাম লিখুন।"
            );
        }


        let response;


        if (id) {

            response =
                await supabaseClient
                    .from(
                        HEALTHCARE_TABLES.hospitals
                    )
                    .update(payload)
                    .eq("id", id);

        } else {

            response =
                await supabaseClient
                    .from(
                        HEALTHCARE_TABLES.hospitals
                    )
                    .insert(payload);
        }


        if (response.error) {
            throw response.error;
        }


        closeHealthcareModal();

        showAdminMessage(
            "সফল হয়েছে",
            id
                ? "হাসপাতালের তথ্য আপডেট হয়েছে।"
                : "নতুন হাসপাতাল যোগ হয়েছে।",
            "success"
        );


        await loadHealthcareData();

    } catch (error) {

        console.error(
            "Hospital save error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "হাসপাতালের তথ্য সংরক্ষণ করা যায়নি।",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "সংরক্ষণ";
        }
    }
}


/* =========================================================
   DOCTOR FORM
   ========================================================= */

function resetDoctorForm() {

    const form =
        document.getElementById(
            "doctorForm"
        );

    if (form) {
        form.reset();
    }


    const id =
        document.getElementById(
            "doctorId"
        );

    if (id) {
        id.value = "";
    }
}


function fillDoctorForm(
    doctor
) {

    document.getElementById(
        "doctorId"
    ).value =
        doctor.id || "";


    document.getElementById(
        "doctorHospital"
    ).value =
        doctor.hospital_id || "";


    document.getElementById(
        "doctorSpecialization"
    ).value =
        doctor.specialization_id || "";


    document.getElementById(
        "doctorName"
    ).value =
        doctor.name || "";


    document.getElementById(
        "doctorDegrees"
    ).value =
        doctor.degrees || "";


    document.getElementById(
        "doctorDesignation"
    ).value =
        doctor.designation || "";


    document.getElementById(
        "doctorDepartment"
    ).value =
        doctor.department || "";


    document.getElementById(
        "doctorExperience"
    ).value =
        doctor.experience || "";


    document.getElementById(
        "doctorChamber"
    ).value =
        doctor.chamber || "";


    document.getElementById(
        "doctorVisitingDays"
    ).value =
        doctor.visiting_days || "";


    document.getElementById(
        "doctorVisitingHours"
    ).value =
        doctor.visiting_hours || "";


    document.getElementById(
        "doctorConsultationFee"
    ).value =
        doctor.consultation_fee ?? "";


    document.getElementById(
        "doctorPhone"
    ).value =
        doctor.phone || "";


    document.getElementById(
        "doctorVerifiedAt"
    ).value =
        doctor.verified_at || "";


    document.getElementById(
        "doctorSourceUrl"
    ).value =
        doctor.source_url || "";


    document.getElementById(
        "doctorActive"
    ).value =
        doctor.active === false
            ? "false"
            : "true";
}


/* =========================================================
   SAVE DOCTOR
   ========================================================= */

async function saveDoctor(event) {

    event.preventDefault();


    const button =
        event.currentTarget.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled = true;
        button.textContent =
            "সংরক্ষণ হচ্ছে...";
    }


    try {

        const id =
            document.getElementById(
                "doctorId"
            )?.value;


        const hospitalId =
            document.getElementById(
                "doctorHospital"
            ).value;


        const name =
            document.getElementById(
                "doctorName"
            ).value.trim();


        if (!hospitalId) {
            throw new Error(
                "হাসপাতাল নির্বাচন করুন।"
            );
        }


        if (!name) {
            throw new Error(
                "ডাক্তারের নাম লিখুন।"
            );
        }


        /*
         * IMPORTANT:
         * এখন কোনো ছবি upload করা হচ্ছে না।
         *
         * doctorPhoto input থাকলেও file select না করলে
         * কোনো Storage upload হবে না।
         *
         * Existing photo_url edit করার সময় অপরিবর্তিত থাকবে।
         */

        let existingPhotoUrl = null;


        if (id) {

            const oldDoctor =
                healthcareDoctors.find(
                    doctor =>
                        Number(
                            doctor.id
                        ) ===
                        Number(id)
                );


            if (oldDoctor) {
                existingPhotoUrl =
                    oldDoctor.photo_url || null;
            }
        }


        const payload = {

            hospital_id:
                Number(hospitalId),

            specialization_id:
                document.getElementById(
                    "doctorSpecialization"
                ).value
                    ? Number(
                        document.getElementById(
                            "doctorSpecialization"
                        ).value
                    )
                    : null,

            name,

            degrees:
                document.getElementById(
                    "doctorDegrees"
                ).value.trim(),

            designation:
                document.getElementById(
                    "doctorDesignation"
                ).value.trim(),

            department:
                document.getElementById(
                    "doctorDepartment"
                ).value.trim(),

            experience:
                document.getElementById(
                    "doctorExperience"
                ).value.trim(),

            chamber:
                document.getElementById(
                    "doctorChamber"
                ).value.trim(),

            visiting_days:
                document.getElementById(
                    "doctorVisitingDays"
                ).value.trim(),

            visiting_hours:
                document.getElementById(
                    "doctorVisitingHours"
                ).value.trim(),

            consultation_fee:
                numberOrNull(
                    "doctorConsultationFee"
                ),

            phone:
                document.getElementById(
                    "doctorPhone"
                ).value.trim(),

            photo_url:
                existingPhotoUrl,

            source_url:
                document.getElementById(
                    "doctorSourceUrl"
                ).value.trim(),

            verified_at:
                document.getElementById(
                    "doctorVerifiedAt"
                ).value || null,

            active:
                document.getElementById(
                    "doctorActive"
                ).value === "true"
        };


        let response;


        if (id) {

            response =
                await supabaseClient
                    .from(
                        HEALTHCARE_TABLES.doctors
                    )
                    .update(payload)
                    .eq("id", id);

        } else {

            response =
                await supabaseClient
                    .from(
                        HEALTHCARE_TABLES.doctors
                    )
                    .insert(payload);
        }


        if (response.error) {
            throw response.error;
        }


        closeHealthcareModal();


        showAdminMessage(
            "সফল হয়েছে",
            id
                ? "ডাক্তারের তথ্য আপডেট হয়েছে।"
                : "নতুন ডাক্তার যোগ হয়েছে।",
            "success"
        );


        await loadHealthcareData();

    } catch (error) {

        console.error(
            "Doctor save error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "ডাক্তারের তথ্য সংরক্ষণ করা যায়নি।",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "সংরক্ষণ";
        }
    }
}


/* =========================================================
   SPECIALIZATION FORM
   ========================================================= */

function resetSpecializationForm() {

    const form =
        document.getElementById(
            "specializationForm"
        );

    if (form) {
        form.reset();
    }
}


async function saveSpecialization(event) {

    event.preventDefault();


    const button =
        event.currentTarget.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.disabled = true;
        button.textContent =
            "সংরক্ষণ হচ্ছে...";
    }


    try {

        const name =
            document.getElementById(
                "specializationName"
            ).value.trim();


        const icon =
            document.getElementById(
                "specializationIcon"
            ).value.trim() ||
            "🩺";


        if (!name) {
            throw new Error(
                "Specialization-এর নাম লিখুন।"
            );
        }


        const duplicate =
            healthcareSpecializations.some(
                item =>
                    String(
                        item.name || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase()
            );


        if (duplicate) {
            throw new Error(
                "এই Specialization ইতিমধ্যে আছে।"
            );
        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    HEALTHCARE_TABLES.specializations
                )
                .insert({
                    name,
                    icon,
                    active: true
                });


        if (error) {
            throw error;
        }


        closeHealthcareModal();


        showAdminMessage(
            "সফল হয়েছে",
            "নতুন Specialization যোগ হয়েছে।",
            "success"
        );


        await loadHealthcareData();

    } catch (error) {

        console.error(
            "Specialization save error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "Specialization সংরক্ষণ করা যায়নি।",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "সংরক্ষণ";
        }
    }
}


/* =========================================================
   ACTIVE / INACTIVE
   ========================================================= */

async function toggleHospitalActive(id) {

    const hospital =
        healthcareHospitals.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!hospital) return;


    await setHealthcareActive(
        HEALTHCARE_TABLES.hospitals,
        id,
        hospital.active === false
    );
}


async function toggleDoctorActive(id) {

    const doctor =
        healthcareDoctors.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!doctor) return;


    await setHealthcareActive(
        HEALTHCARE_TABLES.doctors,
        id,
        doctor.active === false
    );
}


async function setHealthcareActive(
    table,
    id,
    active
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .update({
                    active
                })
                .eq("id", id);


        if (error) {
            throw error;
        }


        showAdminMessage(
            "সফল হয়েছে",
            active
                ? "Active করা হয়েছে।"
                : "Inactive করা হয়েছে।",
            "success"
        );


        await loadHealthcareData();

    } catch (error) {

        console.error(
            "Healthcare status error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                "Status পরিবর্তন করা যায়নি।",
            "error"
        );
    }
}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteHospital(id) {

    const hospital =
        healthcareHospitals.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!hospital) return;


    const confirmed =
        confirm(
            `"${hospital.name}" হাসপাতালটি delete করতে চান?\n\nএই হাসপাতালের সাথে যুক্ত Doctor-গুলোও delete হবে।`
        );


    if (!confirmed) return;


    await deleteHealthcareRecord(
        HEALTHCARE_TABLES.hospitals,
        id,
        "হাসপাতাল"
    );
}


async function deleteDoctor(id) {

    const doctor =
        healthcareDoctors.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!doctor) return;


    const confirmed =
        confirm(
            `"${doctor.name}" ডাক্তারকে delete করতে চান?`
        );


    if (!confirmed) return;


    await deleteHealthcareRecord(
        HEALTHCARE_TABLES.doctors,
        id,
        "ডাক্তার"
    );
}


async function deleteSpecialization(id) {

    const specialization =
        healthcareSpecializations.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!specialization) return;


    const confirmed =
        confirm(
            `"${specialization.name}" Specialization delete করতে চান?`
        );


    if (!confirmed) return;


    await deleteHealthcareRecord(
        HEALTHCARE_TABLES.specializations,
        id,
        "Specialization"
    );
}


async function deleteHealthcareRecord(
    table,
    id,
    label
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .delete()
                .eq("id", id);


        if (error) {
            throw error;
        }


        showAdminMessage(
            "সফল হয়েছে",
            `${label} delete হয়েছে।`,
            "success"
        );


        await loadHealthcareData();

    } catch (error) {

        console.error(
            "Healthcare delete error:",
            error
        );

        showAdminMessage(
            "সমস্যা হয়েছে",
            error.message ||
                `${label} delete করা যায়নি।`,
            "error"
        );
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function numberOrNull(id) {

    const value =
        String(
            document.getElementById(id)?.value ||
            ""
        ).trim();


    if (value === "") {
        return null;
    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;
}


/* =========================================================
   PUBLIC FUNCTIONS
   ========================================================= */

window.openHealthcareModal =
    openHealthcareModal;

window.toggleHospitalActive =
    toggleHospitalActive;

window.toggleDoctorActive =
    toggleDoctorActive;

window.deleteHospital =
    deleteHospital;

window.deleteDoctor =
    deleteDoctor;

window.deleteSpecialization =
    deleteSpecialization;
