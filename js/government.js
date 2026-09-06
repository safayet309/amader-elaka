const governmentServices=[
{name:"পরিচয় ও নাগরিক সেবা",category:"নাগরিক",icon:"👥",description:"NID, জন্ম-মৃত্যু নিবন্ধন, নাগরিক ও বিভিন্ন সরকারি সেবা।",meta:"myGov",url:"https://www.mygov.bd/"},
{name:"যাতায়াত",category:"যাতায়াত",icon:"🚌",description:"BRTA, ড্রাইভিং লাইসেন্স, যানবাহন ও পরিবহন সংক্রান্ত সেবা।",meta:"BRTA Service Portal",url:"https://bsp.brta.gov.bd/"},
{name:"শিক্ষা",category:"শিক্ষা",icon:"🎓",description:"শিক্ষা বোর্ড, ফলাফল, ভর্তি ও শিক্ষা বিষয়ক সরকারি তথ্য।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"স্বাস্থ্য",category:"স্বাস্থ্য",icon:"✚",description:"স্বাস্থ্য সেবা, হাসপাতাল ও স্বাস্থ্য অধিদপ্তরের প্রয়োজনীয় তথ্য।",meta:"স্বাস্থ্য অধিদপ্তর",url:"https://dghs.gov.bd/"},
{name:"ভূমি ও জমি",category:"ভূমি",icon:"🏠",description:"ভূমি সেবা, নামজারি, ভূমি উন্নয়ন কর, রেকর্ড ও ম্যাপ।",meta:"ভূমি মন্ত্রণালয়",url:"https://land.gov.bd/"},
{name:"অর্থ ও কর",category:"অর্থ",icon:"💰",description:"আয়কর, কর সংক্রান্ত তথ্য ও জাতীয় আর্থিক সেবা।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"চাকরি ও নিয়োগ",category:"চাকরি",icon:"💼",description:"সরকারি চাকরি, নিয়োগ বিজ্ঞপ্তি, পরীক্ষা ও ফলাফল।",meta:"বাংলাদেশ সরকারি কর্ম কমিশন",url:"https://bpsc.gov.bd/"},
{name:"নারী ও শিশু সেবা",category:"নাগরিক",icon:"👨‍👩‍👧",description:"নারী ও শিশু সুরক্ষা, সহায়তা এবং সংশ্লিষ্ট সরকারি সেবা।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"কৃষি ও পল্লী উন্নয়ন",category:"অন্যান্য",icon:"🌱",description:"কৃষি, মৎস্য, প্রাণিসম্পদ ও কৃষিভিত্তিক সরকারি সেবা।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"বিদ্যুৎ ও জ্বালানি",category:"অন্যান্য",icon:"⚡",description:"বিদ্যুৎ, জ্বালানি ও ইউটিলিটি সংক্রান্ত সরকারি তথ্য ও সেবা।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"পানি ও ওয়াসা",category:"অন্যান্য",icon:"💧",description:"পানি সরবরাহ, ওয়াসা ও পানি সংক্রান্ত সরকারি সেবা।",meta:"বাংলাদেশ জাতীয় তথ্য বাতায়ন",url:"https://bangladesh.gov.bd/"},
{name:"পাসপোর্ট ও ইমিগ্রেশন",category:"অন্যান্য",icon:"📄",description:"ই-পাসপোর্ট আবেদন, নির্দেশনা ও আবেদন সংক্রান্ত সরকারি সেবা।",meta:"বাংলাদেশ e-Passport Portal",url:"https://www.epassport.gov.bd/"}
];

const emergencyNumbers=[
{name:"জাতীয় জরুরি সেবা",number:"999",icon:"🚨"},
{name:"সরকারি তথ্য ও সেবা",number:"333",icon:"📞"},
{name:"ফায়ার সার্ভিস",number:"102",icon:"🚒"},
{name:"নারী ও শিশু সহায়তা",number:"109",icon:"👩"},
{name:"শিশু সহায়তা",number:"1098",icon:"👶"},
{name:"স্বাস্থ্য বাতায়ন",number:"16263",icon:"🏥"}
];

const grid=document.getElementById("serviceGrid");
const search=document.getElementById("serviceSearch");
const count=document.getElementById("serviceCount");
const noResult=document.getElementById("noResult");

let activeCategory="all";

function renderServices(){
    const q=String(search.value||"").trim().toLowerCase();

    const filtered=governmentServices.filter(service=>{
        const matchesCategory=
            activeCategory==="all"||
            service.category===activeCategory;

        const searchable=[
            service.name,
            service.category,
            service.description,
            service.meta
        ].join(" ").toLowerCase();

        return matchesCategory&&(!q||searchable.includes(q));
    });

    grid.innerHTML=filtered.map(service=>`
        <article class="service-card">
            <div class="service-icon">${service.icon}</div>
            <h3 class="service-title">${service.name}</h3>
            <p class="service-description">${service.description}</p>
            <div class="service-meta">${service.meta}</div>
            <a class="service-link"
               href="${service.url}"
               target="_blank"
               rel="noopener noreferrer">
                ওয়েবসাইটে যান →
            </a>
        </article>
    `).join("");

    count.textContent=`${filtered.length}টি সেবা`;
    noResult.hidden=filtered.length!==0;
}

document.getElementById("categoryFilter").addEventListener("click",function(event){
    const button=event.target.closest(".filter-btn");

    if(!button)return;

    document.querySelectorAll(".filter-btn").forEach(item=>{
        item.classList.remove("active");
    });

    button.classList.add("active");

    activeCategory=button.dataset.category;

    renderServices();
});

search.addEventListener("input",renderServices);

document.getElementById("searchButton").addEventListener("click",renderServices);

const mobileMenu=document.getElementById("mobileMenu");
const govNav=document.getElementById("govNav");

if(mobileMenu&&govNav){
    mobileMenu.addEventListener("click",function(){
        govNav.classList.toggle("open");
    });
}

const emergencyButton=document.getElementById("emergencyButton");
const emergencyOverlay=document.getElementById("emergencyOverlay");
const emergencyClose=document.getElementById("emergencyClose");
const emergencyList=document.getElementById("emergencyList");

function renderEmergency(){
    emergencyList.innerHTML=emergencyNumbers.map(item=>`
        <div class="emergency-item">
            <div class="emergency-item-icon">${item.icon}</div>

            <div class="emergency-item-info">
                <div class="emergency-item-name">${item.name}</div>
                <div class="emergency-item-number">${item.number}</div>
            </div>

            <a class="emergency-call"
               href="tel:${item.number}"
               aria-label="${item.name}-এ কল করুন">
                📞
            </a>
        </div>
    `).join("");
}

function openEmergency(){
    renderEmergency();

    emergencyOverlay.classList.add("show");
    emergencyOverlay.setAttribute("aria-hidden","false");

    document.body.style.overflow="hidden";
}

function closeEmergency(){
    emergencyOverlay.classList.remove("show");
    emergencyOverlay.setAttribute("aria-hidden","true");

    document.body.style.overflow="";
}

if(emergencyButton){
    emergencyButton.addEventListener("click",function(event){
        event.preventDefault();
        openEmergency();
    });
}

if(emergencyClose){
    emergencyClose.addEventListener("click",closeEmergency);
}

if(emergencyOverlay){
    emergencyOverlay.addEventListener("click",function(event){
        if(event.target===emergencyOverlay){
            closeEmergency();
        }
    });
}

document.addEventListener("keydown",function(event){
    if(
        event.key==="Escape"&&
        emergencyOverlay.classList.contains("show")
    ){
        closeEmergency();
    }
});

renderServices();
