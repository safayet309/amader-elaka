/* ==========================
   emergency-hotline.js
   Emergency hotline popup logic
========================== */

        const emergencyNumbers=[{name:"জাতীয় জরুরি সেবা",number:"999",icon:"🚨",important:true},{name:"সরকারি তথ্য ও সেবা",number:"333",icon:"📞"},{name:"ফায়ার সার্ভিস",number:"102",icon:"🚒"},{name:"নারী ও শিশু সহায়তা",number:"109",icon:"👩"},{name:"শিশু সহায়তা",number:"1098",icon:"👶"},{name:"স্বাস্থ্য বাতায়ন",number:"16263",icon:"🏥"},{name:"কৃষি কল সেন্টার",number:"16123",icon:"🌾"},{name:"সরকারি আইনি সহায়তা",number:"16699",icon:"⚖️"},{name:"দুর্নীতি দমন কমিশন",number:"106",icon:"🔍"},{name:"দুর্যোগ পূর্বাভাস",number:"1090",icon:"🌪️"},{name:"বাংলাদেশ রেলওয়ে",number:"131",icon:"🚂"},{name:"ঢাকা ওয়াসা",number:"16162",icon:"💧"}];
        const emergencyButton=document.getElementById("emergencyButton"),emergencyOverlay=document.getElementById("emergencyOverlay"),emergencyClose=document.getElementById("emergencyClose"),emergencyList=document.getElementById("emergencyList");
        function renderEmergencyNumbers(){if(!emergencyList)return;emergencyList.innerHTML=emergencyNumbers.map(s=>`<div class="emergency-card ${s.important?"important":""}"><div class="emergency-card-info"><div class="emergency-card-icon">${s.icon}</div><div><h3>${s.name}</h3><strong>${s.number}</strong></div></div><div class="emergency-card-actions"><a href="tel:${s.number}" class="emergency-call">📞 কল করুন</a><button type="button" class="emergency-copy" data-number="${s.number}">📋 কপি</button></div></div>`).join("")}
        function openEmergencyPopup(){if(!emergencyOverlay)return;emergencyOverlay.classList.add("show");emergencyOverlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
        function closeEmergencyPopup(){if(!emergencyOverlay)return;emergencyOverlay.classList.remove("show");emergencyOverlay.setAttribute("aria-hidden","true");document.body.style.overflow=""}
        async function copyEmergencyNumber(number,button){try{await navigator.clipboard.writeText(number)}catch(e){const ta=document.createElement("textarea");ta.value=number;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(x){console.error("Copy Error:",x)}ta.remove()}const old=button.textContent;button.textContent="✓ কপি হয়েছে";setTimeout(()=>button.textContent=old,1500)}
        if(emergencyButton)emergencyButton.addEventListener("click",e=>{e.preventDefault();openEmergencyPopup()});
        if(emergencyClose)emergencyClose.addEventListener("click",closeEmergencyPopup);
        if(emergencyOverlay)emergencyOverlay.addEventListener("click",e=>{if(e.target===emergencyOverlay)closeEmergencyPopup()});
        if(emergencyList)emergencyList.addEventListener("click",e=>{const b=e.target.closest(".emergency-copy");if(b)copyEmergencyNumber(b.dataset.number,b)});
        document.addEventListener("keydown",e=>{if(e.key==="Escape")closeEmergencyPopup()});
        renderEmergencyNumbers();
