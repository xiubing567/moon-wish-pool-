const video=document.getElementById('guide-video');
const chapters=document.getElementById('guide-chapters');
const buttons=[...chapters.querySelectorAll('button')];
const language=document.getElementById('guide-language');
let english=false;
try{english=localStorage.getItem('moon-language')==='en'}catch{}
const tr=(zh,en)=>english?en:zh;
function highlight(){
 const active=buttons.findLast(button=>Number(button.dataset.time)<=video.currentTime);
 buttons.forEach(button=>button.setAttribute('aria-current',String(button===active)));
}
for(const button of buttons)button.onclick=()=>{
 video.currentTime=Number(button.dataset.time);
 highlight();
 video.play().catch(()=>{});
};
video.addEventListener('timeupdate',highlight);
video.addEventListener('seeked',highlight);
function localize(){
 document.documentElement.lang=tr('zh-CN','en');
 document.title=tr('月球计划 · 从脚印到愿望','Moon Plan · From Footprints to Wishes');
 document.querySelectorAll('[data-zh]').forEach(el=>el.textContent=english?el.dataset.en:el.dataset.zh);
 language.textContent=tr('EN','中文');
 language.setAttribute('aria-label',tr('Switch to English','切换到中文'));
 video.setAttribute('aria-label',tr('月球计划手绘动画','Moon Plan hand-drawn animation'));
 chapters.setAttribute('aria-label',tr('动画章节','Animation chapters'));
 video.textTracks[0].mode=english?'showing':'disabled';
}
language.onclick=()=>{
 english=!english;
 try{localStorage.setItem('moon-language',tr('zh','en'))}catch{}
 localize();
};
localize();
highlight();

const source=video.querySelector('source');
const unavailable=()=>{
 video.closest('.guide-stage').hidden=true;
 chapters.hidden=true;
 document.getElementById('guide-missing').hidden=false;
};
fetch(source.dataset.src,{method:'HEAD'}).then(response=>{
 if(!response.ok||!response.headers.get('content-type')?.startsWith('video/')){unavailable();return}
 source.addEventListener('error',unavailable,{once:true});
 source.src=source.dataset.src;
 video.load();
}).catch(unavailable);
