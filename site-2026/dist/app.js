'use strict';
const projects = window.PORTFOLIO_PROJECTS || [];
const profile = window.PORTFOLIO_PROFILE || {};
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function visual(project) {
 return `<div class="project-visual real-screenshot"><img src="${esc(project.cover.src)}" alt="${esc(project.cover.alt)}" loading="lazy" width="1440" height="900"><span class="screenshot-caption">${esc(project.cover.caption)}</span></div>`;
}
function projectCard(p) {return `<article class="project-card"><a href="project.html?id=${encodeURIComponent(p.id)}" aria-label="Read case: ${esc(p.name)}">${visual(p)}<div class="card-meta"><span>${esc(p.category.toUpperCase())} / ${esc(p.number)}</span><span class="card-status">${esc(p.status)}</span></div><div class="card-title"><h3>${esc(p.title)}</h3><span aria-hidden="true">↗</span></div><p>${esc(p.description)}</p></a></article>`;}
function setFilter(category){
 const shown=category==='All'?projects:projects.filter(p=>p.category===category);
 const grid=document.querySelector('#project-grid');if(!grid)return;
 grid.innerHTML=shown.map(projectCard).join('');
 document.querySelector('#work-count').textContent=`${String(shown.length).padStart(2,'0')} PROJECT${shown.length===1?'':'S'}`;
 document.querySelector('#empty-projects').hidden=shown.length!==0;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
document.querySelector('[data-reset-filter]')?.addEventListener('click',()=>setFilter('All'));
setFilter('All');
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#nav');
menu?.addEventListener('click',()=>{const on=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(on));nav.classList.toggle('open',on);});
nav?.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-name]').forEach(n=>n.textContent=profile.fullName||profile.displayName||'Vagus');
if(profile.biography && document.querySelector('#biography')){document.querySelector('#biography').textContent=profile.biography;document.querySelector('.slot-label').textContent='MY BACKGROUND';}
const safeAssetURL = value => typeof value==='string' && (/^https:\/\//.test(value) || /^assets\/[A-Za-z0-9_./-]+$/.test(value));
const profileLinks=document.querySelector('#profile-links');
if(profileLinks){
 const entries=[['Facebook',profile.facebook],['Instagram',profile.instagram],['LinkedIn',profile.linkedin],['Résumé / CV',profile.cvUrl]];
 const available=entries.filter(([,url])=>safeAssetURL(url));
 if(available.length)profileLinks.innerHTML=available.map(([name,url])=>`<a class="text-link" target="_blank" rel="noopener" href="${esc(url)}">${esc(name)} ↗</a>`).join('');
}
if(safeAssetURL(profile.portrait)){const f=document.querySelector('.portrait-frame');if(f){f.innerHTML=`<img src="${esc(profile.portrait)}" alt="Portrait of ${esc(profile.fullName||profile.displayName)}">`;}}
if(Array.isArray(profile.professionalExperience) && profile.professionalExperience.length){
 const section=document.createElement('section');section.className='experience-list';
 const heading=document.createElement('h3');heading.textContent='Professional experience';section.append(heading);
 profile.professionalExperience.forEach(item=>{const row=document.createElement('p');row.textContent=[item.role,item.organization,item.dates].filter(Boolean).join(' · ');section.append(row);});
 document.querySelector('.about-copy')?.append(section);
}
if(profile.showCareerNotice && profile.careerNotice){const n=document.createElement('p');n.className='career-notice';n.textContent=profile.careerNotice;document.querySelector('.about-copy')?.append(n);}
if(profile.preview===false)document.querySelector('.draft-bar')?.remove();
const dialog=document.querySelector('#contact-dialog');let returnFocus=null;
function openContact(topic){if(!dialog)return;returnFocus=document.activeElement;dialog.querySelector('select[name=topic]').value=topic||'Project';document.querySelector('#brief-result').hidden=true;dialog.showModal();}
document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>openContact(b.dataset.contact)));
document.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog?.addEventListener('close',()=>returnFocus?.focus());
document.querySelector('#enquiry-form')?.addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(e.currentTarget), idea=String(data.get('idea')||'').trim();
 if(idea.length<10){const f=e.currentTarget.elements.idea;f.setCustomValidity('Please describe your idea in at least 10 characters.');f.reportValidity();return;}
 e.currentTarget.elements.idea.setCustomValidity('');
 const text=`Conversation with Vagus\n\nTopic: ${data.get('topic')}\n${data.get('name')?'Name: '+String(data.get('name')).trim()+'\n':''}${data.get('timing')?'Timing: '+String(data.get('timing')).trim()+'\n':''}\nIdea / problem / desired outcome:\n${idea}`;
 document.querySelector('#brief-text').value=text;document.querySelector('#brief-result').hidden=false;document.querySelector('#brief-text').focus();
});
document.querySelector('[name=idea]')?.addEventListener('input',e=>e.target.setCustomValidity(''));
document.querySelector('#copy-brief')?.addEventListener('click',async()=>{
 const t=document.querySelector('#brief-text');try{await navigator.clipboard.writeText(t.value);document.querySelector('#brief-status').textContent='Copied. Nothing has been sent.';}catch{t.focus();t.select();document.querySelector('#brief-status').textContent='Select and copy the brief manually. Nothing has been sent.';}
});
document.querySelector('#download-brief')?.addEventListener('click',()=>{const b=new Blob([document.querySelector('#brief-text').value],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='conversation-with-vagus.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);document.querySelector('#brief-status').textContent='Brief prepared for download. Nothing has been sent.';});
const caseRoot=document.querySelector('#case-content');
if(caseRoot){const id=new URLSearchParams(location.search).get('id'),p=projects.find(x=>x.id===id);if(!p){document.title='Project not found — Mr. Vagus';caseRoot.innerHTML='<section class="wrap legal"><p class="eyebrow">NOT IN THIS COLLECTION</p><h1>That project isn’t here.</h1><p>The link may be incomplete. Return to the portfolio to choose a project.</p><a class="button dark" href="index.html#work">Back to all work ↗</a></section>';}else{
 document.title=p.name+' — Mr. Vagus';
 caseRoot.innerHTML=`<section class="wrap case-hero"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="index.html#work">Work</a><span>/</span><span>${esc(p.name)}</span></nav><p class="eyebrow">${esc(p.category)} / ${esc(p.status)}</p><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p><div class="case-actions"><a class="button dark" target="_blank" rel="noopener" href="${esc(p.url)}">${['rtxc','boiler','catering'].includes(p.id)?'Open the demonstration':'Read the public concept'} ↗</a>${p.source?`<a class="text-link" target="_blank" rel="noopener" href="${esc(p.source)}">Source repository ↗</a>`:''}</div><div class="case-cover">${visual(p)}</div></section><section class="wrap case-body"><aside><div><strong>PROJECT</strong><p>${esc(p.name)}</p></div><div><strong>FOCUS</strong><p>${p.tags.map(esc).join('<br>')}</p></div><div><strong>STATUS</strong><p>${esc(p.status)}</p></div></aside><div class="case-sections"><article><h2>The question.</h2><p>${esc(p.challenge)}</p></article><article><h2>My contribution.</h2><p>${esc(p.contribution)}</p></article><article><h2>What you can explore.</h2><p>${esc(p.result)}</p></article><article class="case-limit"><h2>A clear boundary.</h2><p>${esc(p.limit)}</p></article><a class="button dark" href="index.html?enquiry=${encodeURIComponent(p.name)}#contact">Have a related challenge? ↗</a></div></section>`;
}}
const enquiry=new URLSearchParams(location.search).get('enquiry');if(enquiry && dialog){document.querySelector('[name=idea]').value=`I’m interested in something related to ${enquiry.slice(0,150)}. My idea is: `;openContact('Project');}
