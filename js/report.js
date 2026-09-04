// =====================================
// Amader Elaka - Citizen Report Form
// =====================================

const division = document.getElementById("division");
const district = document.getElementById("district");
const upazila = document.getElementById("upazila");
const reportForm = document.getElementById("reportForm");


// =====================================
// Division Change
// =====================================

division.addEventListener("change", function () {

    const selectedDivision = this.value;

    district.innerHTML =
        '<option value="">জেলা নির্বাচন করুন</option>';

    upazila.innerHTML =
        '<option value="">আগে জেলা নির্বাচন করুন</option>';

    district.disabled = true;
    upazila.disabled = true;


    if (!selectedDivision) {
        return;
    }


    const districts =
        Object.keys(locationData[selectedDivision] || {});


    districts.forEach(function (districtName) {

        const option = document.createElement("option");

        option.value = districtName;
        option.textContent = districtName;

        district.appendChild(option);

    });


    district.disabled = false;

});


// =====================================
// District Change
// =====================================

district.addEventListener("change", function () {

    const selectedDivision = division.value;
    const selectedDistrict = this.value;


    upazila.innerHTML =
        '<option value="">উপজেলা নির্বাচন করুন</option>';

    upazila.disabled = true;


    if (!selectedDivision || !selectedDistrict) {
        return;
    }


    const upazilas =
        locationData[selectedDivision][selectedDistrict] || [];


    upazilas.forEach(function (upazilaName) {

        const option = document.createElement("option");

        option.value = upazilaName;
        option.textContent = upazilaName;

        upazila.appendChild(option);

    });


    upazila.disabled = false;

});


// =====================================
// Form Submit
// =====================================

reportForm.addEventListener("submit", function (event) {

    event.preventDefault();

    alert(
        "রিপোর্ট ফর্মটি ঠিকভাবে কাজ করছে।\n\n" +
        "পরের ধাপে এই তথ্য SheetDB-এর মাধ্যমে Google Sheet-এ পাঠানো হবে।"
    );

});
