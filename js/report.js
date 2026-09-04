// =====================================
// Amader Elaka - Citizen Report Form
// =====================================

const division = document.getElementById("division");
const district = document.getElementById("district");
const upazila = document.getElementById("upazila");
const reportForm = document.getElementById("reportForm");


// Temporary district data
const districts = {
    "রংপুর": [
        "রংপুর",
        "দিনাজপুর",
        "ঠাকুরগাঁও",
        "পঞ্চগড়",
        "নীলফামারী",
        "লালমনিরহাট",
        "কুড়িগ্রাম",
        "গাইবান্ধা"
    ],

    "ঢাকা": [
        "ঢাকা",
        "গাজীপুর",
        "নারায়ণগঞ্জ",
        "নরসিংদী",
        "মানিকগঞ্জ",
        "মুন্সীগঞ্জ",
        "ফরিদপুর",
        "রাজবাড়ী",
        "গোপালগঞ্জ",
        "মাদারীপুর",
        "শরীয়তপুর",
        "টাঙ্গাইল",
        "কিশোরগঞ্জ"
    ]
};


// Division change
division.addEventListener("change", function () {

    const selectedDivision = this.value;

    district.innerHTML =
        '<option value="">জেলা নির্বাচন করুন</option>';

    upazila.innerHTML =
        '<option value="">আগে জেলা নির্বাচন করুন</option>';

    upazila.disabled = true;

    if (!selectedDivision) {
        district.disabled = true;
        return;
    }

    const list = districts[selectedDivision] || [];

    list.forEach(function (item) {

        const option = document.createElement("option");

        option.value = item;
        option.textContent = item;

        district.appendChild(option);

    });

    district.disabled = false;

});


// District change
district.addEventListener("change", function () {

    const selectedDistrict = this.value;

    upazila.innerHTML =
        '<option value="">উপজেলা নির্বাচন করুন</option>';

    if (!selectedDistrict) {
        upazila.disabled = true;
        return;
    }

    // উপজেলা database আমরা পরের step-এ সম্পূর্ণ করব

    upazila.disabled = false;

});


// Form submit
reportForm.addEventListener("submit", function (event) {

    event.preventDefault();

    alert(
        "রিপোর্ট ফর্মটি ঠিকভাবে কাজ করছে।\n\n" +
        "পরের ধাপে এই তথ্য SheetDB-এর মাধ্যমে Google Sheet-এ পাঠানো হবে।"
    );

});
