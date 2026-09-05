const API_URL = "https://sheetdb.io/api/v1/ahhzymfhcwy1u";

const divisionSelect = document.getElementById("division");
const districtSelect = document.getElementById("district");
const upazilaSelect = document.getElementById("upazila");
const reportForm = document.getElementById("reportForm");

// Division → District
divisionSelect.addEventListener("change", function () {
    const selectedDivision = this.value;

    districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';
    upazilaSelect.innerHTML = '<option value="">উপজেলা নির্বাচন করুন</option>';

    districtSelect.disabled = true;
    upazilaSelect.disabled = true;

    if (selectedDivision && locationData[selectedDivision]) {
        const districts = Object.keys(locationData[selectedDivision]);

        districts.forEach(function (district) {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });

        districtSelect.disabled = false;
    }
});

// District → Upazila
districtSelect.addEventListener("change", function () {
    const selectedDivision = divisionSelect.value;
    const selectedDistrict = this.value;

    upazilaSelect.innerHTML = '<option value="">উপজেলা নির্বাচন করুন</option>';
    upazilaSelect.disabled = true;

    if (
        selectedDivision &&
        selectedDistrict &&
        locationData[selectedDivision] &&
        locationData[selectedDivision][selectedDistrict]
    ) {
        const upazilas = locationData[selectedDivision][selectedDistrict];

        upazilas.forEach(function (upazila) {
            const option = document.createElement("option");
            option.value = upazila;
            option.textContent = upazila;
            upazilaSelect.appendChild(option);
        });

        upazilaSelect.disabled = false;
    }
});

// Form Submit → SheetDB
reportForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = reportForm.querySelector("button[type='submit']");

    const formData = {
        Division: divisionSelect.value,
        District: districtSelect.value,
        Upazila: upazilaSelect.value,
        Area: document.getElementById("area").value.trim(),
        Ward: document.getElementById("ward").value,
        Category: document.getElementById("category").value,
        Description: document.getElementById("description").value.trim(),
        Date: new Date().toISOString().split("T")[0],
        Status: "Pending",
        AdminNote: ""
    };

    // Basic validation
    if (
        !formData.Division ||
        !formData.District ||
        !formData.Upazila ||
        !formData.Area ||
        !formData.Ward ||
        !formData.Category ||
        !formData.Description
    ) {
        alert("দয়া করে সব তথ্য পূরণ করুন।");
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = "জমা হচ্ছে...";

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
            throw new Error("Data submission failed");
        }

        const result = await response.json();

        console.log("SheetDB Response:", result);

        alert("✅ আপনার রিপোর্ট সফলভাবে জমা হয়েছে!");

        reportForm.reset();

        districtSelect.innerHTML =
            '<option value="">জেলা নির্বাচন করুন</option>';

        upazilaSelect.innerHTML =
            '<option value="">উপজেলা নির্বাচন করুন</option>';

        districtSelect.disabled = true;
        upazilaSelect.disabled = true;

    } catch (error) {
        console.error("Error:", error);
        alert("❌ রিপোর্ট জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "রিপোর্ট জমা দিন";
    }
});
