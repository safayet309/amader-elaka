/* Premium public-site mobile navigation. Does not replace existing page logic. */
(function(){
  const nav=document.querySelector('.nav');
  const toggle=document.getElementById('mobileMenuToggle');
  const searchBtn=document.getElementById('mobileSearchButton');
  if(!nav||!toggle) return;

  let overlay=null;
  function ensureOverlay(){
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.className='mobile-menu-overlay';
    overlay.setAttribute('aria-hidden','true');
    document.body.appendChild(overlay);
    overlay.addEventListener('click',closeMenu);
    return overlay;
  }
  function openMenu(){
    ensureOverlay().classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    nav.classList.add('mobile-open');
    toggle.setAttribute('aria-expanded','true');
    toggle.textContent='×';
    document.body.classList.add('mobile-menu-active');
  }
  function closeMenu(){
    if(overlay){overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');}
    nav.classList.remove('mobile-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.textContent='☰';
    document.body.classList.remove('mobile-menu-active');
  }
  toggle.addEventListener('click',()=>nav.classList.contains('mobile-open')?closeMenu():openMenu());
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeMenu();});
  if(searchBtn){
    searchBtn.addEventListener('click',()=>{
      const input=document.getElementById('homeSearchInput');
      if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});}
      else window.location.href='index.html#homeSearchForm';
    });
  }

  function injectBottomNav(){
    if(document.querySelector('.mobile-bottom-nav')) return;
    const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    const active=p=>path===p?'active':'';
    const navEl=document.createElement('nav');
    navEl.className='mobile-bottom-nav';
    navEl.setAttribute('aria-label','মোবাইল নেভিগেশন');
    navEl.innerHTML=`
      <a class="${active('index.html')||path===''?'active':''}" href="index.html"><span>⌂</span><span>হোম</span></a>
      <a class="${active('report.html')}" href="report.html"><span>▣</span><span>রিপোর্ট</span></a>
      <a class="${active('dashboard.html')}" href="dashboard.html"><span>◫</span><span>ড্যাশবোর্ড</span></a>
      <a class="${active('government.html')}" href="government.html"><span>◎</span><span>সেবা</span></a>
      <button class="danger" type="button" aria-label="জরুরি নম্বর"><span>🚨</span><span>জরুরি</span></button>`;
    document.body.appendChild(navEl);
    navEl.querySelector('button').addEventListener('click',()=>{
      const emergency=document.getElementById('emergencyButton');
      if(emergency) emergency.click();
    });
    if(path!=='report.html'){
      const cta=document.createElement('a');
      cta.href='report.html';cta.className='floating-report-cta';cta.innerHTML='📝 রিপোর্ট করুন';
      document.body.appendChild(cta);
    }
  }
  injectBottomNav();
})();
