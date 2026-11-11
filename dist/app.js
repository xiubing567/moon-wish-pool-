import {literaryWishes} from './literary.js';
import {orientation,screenPoint,rotate,coords,project} from './trackball.js';
const $ = id => document.getElementById(id);
const copy = [["月球计划", "Moon Plan"], ["未风化的许愿池", "The Unweathered Wishing Well"], ["关于项目 ↗", "About ↗"], ["月面档案", "Lunar Wish Atlas"], ["↶　拖动月球，选中经纬度　↷", "↶ Drag the Moon to pick coordinates ↷"], ["我的愿望", "My wish"], ["月面选点", "Lunar coordinates"], ["＋ 上传照片", "＋ Add a photo"], ["移除照片", "Remove photo"], ["时间自动记录", "Time is recorded automatically"], ["刻在这里", "Leave it here"], ["每个红点，一条愿望。", "One red dot, one wish."], ["拖动月球，用中央的十字选一个月面坐标。也可以点开红点，看看那里留下了什么。", "Drag the Moon to pick a spot under the crosshair. Open any red dot to see the wish left there."], ["月球上的红点各有一条愿望。你的愿望和照片保存在当前浏览器。", "Your wishes and photos are saved in this browser."], ["关闭", "Close"]];
let english=false;
try{english=localStorage.getItem("moon-language")==="en"}catch{}
const tr=(zh,en)=>english?en:zh;
const examples = [
 ['Q7M-4XP','弗吉尼亚·伍尔夫',18,-28,'A woman must have money and a room of her own if she is to write fiction.','女人要写小说，需要有钱，还需要一间自己的房间。'],
 ['8Z-K29TF','埃隆·马斯克',32,30,'I would like to die on Mars, just not on impact.','我想死在火星上，别是着陆时撞死的就行。'],
 ['N4X7-RQ','楚门',-8,42,'I want to book a flight to Fiji.','我想订一张去斐济的机票。'],
 ['6TP-9W3','尹天仇',-34,-28,'我是一个演员。','I am an actor.'],
 ['H2R9-V6','埃利奥特',-20,130,'I wish I had a Big Mac and a large Coke.','我想要一个巨无霸，再来一大杯可乐。'],
 ['3YK-7DM','史莱克',26,-113,'I’m already in a quest, a quest to get my swamp back.','我已经有任务了，我要拿回我的沼泽。'],
 ['V8-3Q5N','米奇·赫德伯格',-44,-91,'I wish they made fajita cologne.','我希望有人出一款墨西哥烤肉味的古龙水。'],
 ['K4T8-2W','济慈',52,145,'I almost wish we were butterflies and liv’d but three summer days.','我几乎希望我们是两只蝴蝶，只活三个夏日。']
].map(([id,name,lat,lon,original,translation])=>({id,name,lat,lon,original,translation,photo:null}));

const englishNames=["Virginia Woolf", "Elon Musk", "Truman", "Wan Tin-sau", "Elliot", "Shrek", "Mitch Hedberg", "John Keats"];
const wishName=(w,i)=>(w.englishName||(!w.time&&englishNames[i]))&&english?(w.englishName||englishNames[i]):w.name==='匿名'?tr('匿名','Anonymous'):w.name;

const database = new Promise((resolve,reject)=>{
 const req=indexedDB.open('moon-wish-pool',1);
 req.onupgradeneeded=()=>req.result.createObjectStore('wishes',{keyPath:'id'});
 req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
});
async function readWishes(){
 const db=await database;
 return new Promise((resolve,reject)=>{const r=db.transaction('wishes').objectStore('wishes').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
}
async function saveWish(wish){
 const db=await database;
 return new Promise((resolve,reject)=>{const tx=db.transaction('wishes','readwrite');tx.objectStore('wishes').add(wish);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
}
const wishes=[...examples];
const moon=$('moon'),ctx=moon.getContext('2d'),size=moon.width;
const surface=ctx.createImageData(size,size), points=[];
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const a=(2*x+1)/size-1,b=1-(2*y+1)/size,d=1-a*a-b*b;
 if(d>=0)points.push([4*(y*size+x),a,b,Math.sqrt(d)]);
}
let basis=orientation(10,0),selected=0,texture,textureWidth,textureHeight,frame=0,previewUrl='',pictureUrl='';
const coord=(n,pos,neg)=> (n<0?neg:pos)+' '+Math.abs(n).toFixed(1)+'°';
function coordinates(a,b){return coord(a,tr('北纬','N'),tr('南纬','S'))+' · '+coord(b,tr('东经','E'),tr('西经','W'))}
function render(){
 frame=0;
 const [right,up,forward]=basis;
 const data=surface.data;
 for(const [i,x,y,z] of points){

  let gray=130;
  if(texture){
   const wx=x*right[0]+y*up[0]+z*forward[0];
   const wy=x*right[1]+y*up[1]+z*forward[1];
   const wz=x*right[2]+y*up[2]+z*forward[2];
   const u=(Math.atan2(wx,wz)/(2*Math.PI)+1.5)%1;
   const v=.5-Math.asin(Math.max(-1,Math.min(1,wy)))/Math.PI;
   gray=texture[4*(Math.min(textureHeight-1,Math.floor(v*textureHeight))*textureWidth+Math.floor(u*textureWidth))];
  }
  const light=.58+.42*Math.max(0,z*.93-x*.26+y*.18);
  data[i]=data[i+1]=data[i+2]=Math.min(255,(gray*.98+32)*light);
  data[i+3]=255;
 }
 ctx.putImageData(surface,0,0);
 for(const [i,w] of wishes.entries()){
  const pin=$('pins').children[i];
  const [x,y,depth]=project(basis,w.lat,w.lon);
  pin.hidden=depth<.025;
  pin.style.left=(50+x*50)+'%';
  pin.style.top=(50-y*50)+'%';
 }
 $('coords').textContent=coordinates(...coords(basis[2]));
}
function queue(){if(!frame)frame=requestAnimationFrame(render)}
function rotateTo(w){
 basis=orientation(w.lat,w.lon);queue();
}
function read(index,move){
 selected=(index+wishes.length)%wishes.length;
 const w=wishes[selected];
 $('number').textContent=tr('愿望编号：','Wish no. ')+w.id;
 $('meta').textContent=[wishName(w,selected),w.time&&new Date(w.time).toLocaleString(tr('zh-CN','en-US')),coordinates(w.lat,w.lon)].filter(Boolean).join(' · ');
 $('original').textContent=w.original;
 const translation=w.literary?(english?w.en:w.zh)|| (english?w.zh:w.en):w.translation;
 $('original').dir='auto';
 $('original').lang=w.language||(selected<8?(selected===3?'zh':'en'):'');
 $('translated').dir='auto';
 $('translated').textContent=translation||'';
 $('translated').hidden=true;
 $('translate').hidden=!translation;
 $('translate').textContent=tr('翻译','Translate');
 $('translate').setAttribute('aria-expanded','false');
 if(pictureUrl)URL.revokeObjectURL(pictureUrl);
 pictureUrl=w.photo instanceof Blob?URL.createObjectURL(w.photo):'';
 $('picture').hidden=!w.photo;
 if(w.photo)$('picture').src=pictureUrl||w.photo;
 $('picture').alt=w.time?tr('愿望附图','Wish photo'):wishName(w,selected);
 $('picture').closest('.reading').classList.toggle('no-image',!w.photo);
 $('navLabel').textContent=(selected+1)+' / '+wishes.length;
 [...$('pins').children].forEach((pin,i)=>{pin.classList.toggle('active',i===selected);pin.setAttribute('aria-pressed',i===selected)});
 if(move)rotateTo(w);
}
function addPin(w,i){
 const pin=document.createElement('button');pin.type='button';pin.className='pin';pin.setAttribute('aria-label',wishName(w,i)+' · '+w.id);
 pin.addEventListener('click',()=>{read(i,true);scoutPose('notice');if(matchMedia('(max-width:740px)').matches)$('reader').scrollIntoView({block:'nearest',behavior:'instant'})});
 $('pins').append(pin);$('count').textContent=wishes.length+tr(' 条愿望',' wishes');
}
wishes.forEach(addPin);read(0,false);queue();
readWishes().then(records=>{for(const record of records){wishes.push(record);addPin(record,wishes.length-1)}read(selected,false);queue()}).catch(()=>{$('status').textContent=tr('当前浏览器无法读取本地愿望。','This browser could not read saved wishes.')});
const map=new Image();
map.onload=()=>{
 const c=document.createElement('canvas');c.width=map.width;c.height=map.height;
 const g=c.getContext('2d');g.drawImage(map,0,0);texture=g.getImageData(0,0,c.width,c.height).data;textureWidth=c.width;textureHeight=c.height;queue();
};
map.src='moon.jpg';
let drag;
function pointerOnMoon(e){
 const box=moon.getBoundingClientRect();
 return screenPoint(2*(e.clientX-box.left)/box.width-1,1-2*(e.clientY-box.top)/box.height);
}
moon.addEventListener('pointerdown',e=>{
 if(drag)return;
 moon.setPointerCapture(e.pointerId);
 drag={id:e.pointerId,point:pointerOnMoon(e)};
 lookAtMoon(drag.point[0]);
});
moon.addEventListener('pointermove',e=>{
 if(drag?.id!==e.pointerId)return;
 const point=pointerOnMoon(e);
 basis=rotate(basis,drag.point,point);
 drag.point=point;
 lookAtMoon(point[0]);
 queue();
});
moon.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId){drag=null;scoutPose('settle')}});
moon.addEventListener('keydown',e=>{
 const directions={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,.12],ArrowDown:[0,-.12]};
 if(!Object.hasOwn(directions,e.key))return;
 e.preventDefault();
 basis=rotate(basis,[0,0,1],screenPoint(...directions[e.key]));
 scoutPose('notice');
 queue();
});
$('prev').onclick=()=>read(selected-1,true);
$('next').onclick=()=>read(selected+1,true);
$('aboutBtn').onclick=()=>$('about').showModal();
$('translate').onclick=()=>{const show=$('translated').hidden;$('translated').hidden=!show;$('translate').textContent=show?tr('收起译文','Hide translation'):tr('翻译','Translate');$('translate').setAttribute('aria-expanded',show)};
function clearPhoto(){
 if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl='';$('photo').value='';$('preview').removeAttribute('src');$('attachment').hidden=true;
}
$('removePhoto').onclick=clearPhoto;
$('photo').onchange=()=>{
 if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl='';
 const file=$('photo').files[0];$('status').textContent='';
 if(!file){clearPhoto();return}
 if(file.size>8*1024*1024||!/^image\/(jpeg|png|webp|gif)$/.test(file.type)){
  clearPhoto();$('status').textContent=tr('请选择 8 MB 以内的 JPG、PNG、WebP 或 GIF 图片。','Choose a JPG, PNG, WebP or GIF under 8 MB.');return;
 }
 previewUrl=URL.createObjectURL(file);$('preview').src=previewUrl;$('attachment').hidden=false;
};
$('form').onsubmit=async e=>{
 e.preventDefault();const original=$('wish').value.trim();
 if(!original){$('status').textContent=tr('先写下一条愿望。','Write a wish first.');return}
 const button=e.submitter;button.disabled=true;
 const [lat,lon]=coords(basis[2]);
 const w={id:newWishId(),name:$('signature').value.trim()||'匿名',lat,lon,original,translation:$('wishTranslation').value.trim(),time:new Date().toISOString(),photo:$('photo').files[0]||null};
 try{await saveWish(w);wishes.push(w);addPin(w,wishes.length-1);read(wishes.length-1,true);celebrateWish($('pins').lastElementChild);$('form').reset();clearPhoto();$('status').textContent=tr('愿望已刻下，保存在当前浏览器。','Wish saved in this browser.')}
 catch{$('status').textContent=tr('保存失败，愿望和照片仍在表单中，可以重试。','Could not save. Your wish and photo are still here. Try again.')}
 finally{button.disabled=false}
};

function newWishId(){
 const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
 const code=Array.from(crypto.getRandomValues(new Uint8Array(7)),n=>alphabet[n%alphabet.length]).join('');
 return code.slice(0,3)+'-'+code.slice(3);
}
function applyLanguage(){
 document.documentElement.lang=tr('zh-CN','en');
 document.title=tr('月球计划 · 未风化的许愿池','Moon Plan · The Unweathered Wishing Well');
 for(const node of document.querySelectorAll('[data-copy]')){
  const pair=copy[Number(node.dataset.copy)];
  node.textContent=tr(...pair);
 }
 const labels=[
  ['.map','aria-label','月球愿望地图','Lunar wish map'],
  ['#moon','aria-label','拖动或按方向键转动月球','Drag or use arrow keys to rotate the Moon'],
  ['#prev','aria-label','上一条愿望','Previous wish'],
  ['#next','aria-label','下一条愿望','Next wish'],
  ['#wishTranslation','aria-label','译文','Translation'],
  ['#wishTranslation','placeholder','可以附上另一种语言的版本','Add a version in the other language'],
  ['#wish','aria-label','愿望','Wish'],
  ['#wish','placeholder','用你自己的语言写一个愿望','Write a wish in your own words'],
  ['#signature','aria-label','署名','Signature'],
  ['#signature','placeholder','署名（选填）','Signature (optional)'],
  ['#preview','alt','待上传的照片','Photo preview'],
  ['#language','aria-label','Switch to English','切换到中文']
 ];
 for(const [selector,attr,zh,en] of labels)document.querySelector(selector).setAttribute(attr,tr(zh,en));
 $('language').textContent=tr('EN','中文');
 $('guide-entry').textContent=tr('动画导览 ↗','Animated guide ↗');
 updateShowerLabel();
 $('scout').setAttribute('aria-label',tr('跟月面巡查员读一条愿望','Read a wish with the lunar scout'));
 $('addTranslation').textContent=tr('补充中英文译文（选填）','Add a Chinese or English translation (optional)');
 $('count').textContent=wishes.length+tr(' 条愿望',' wishes');
 wishes.forEach((w,i)=>$('pins').children[i].setAttribute('aria-label',wishName(w,i)+' · '+w.id));
 $('status').textContent='';
 read(selected,false);
 queue();
}
$('language').onclick=()=>{
 english=!english;
 try{localStorage.setItem('moon-language',tr('zh','en'))}catch{}
 applyLanguage();
};


let showerActive=false;
let timers=[];
const shower=$('shower');
function updateShowerLabel(){
 shower.textContent=showerActive?'✦':'✧';
 shower.setAttribute('aria-label',showerActive?tr('收起愿望雨','Hide wish shower'):tr('让愿望落下来','Make wishes fall'));
 shower.setAttribute('aria-pressed',showerActive);
}
function showLine(w){
 const line=document.createElement('span');
 line.textContent=w.original;
 line.lang=w.language;
 line.dir='auto';
 const [x,y,depth]=project(basis,w.lat,w.lon);
 line.style.setProperty('--landing',(depth>0?50+x*50:12+(literaryWishes.indexOf(w)*37)%66)+'%');
 line.style.setProperty('--drop',(depth>0?50-y*50:35)+'%');
 $('wishTrail').append(line);
 line.addEventListener('animationend',()=>line.remove(),{once:true});
}
shower.onclick=()=>{
 showerActive=!showerActive;
 updateShowerLabel();
 if(!showerActive){
  timers.forEach(clearTimeout);
  timers=[];
  $('wishTrail').replaceChildren();
  const current=wishes[selected];
  const kept=wishes.filter(w=>!w.literary);
  wishes.splice(0,wishes.length,...kept);
  $('pins').replaceChildren();
  wishes.forEach(addPin);
  read(Math.max(0,wishes.indexOf(current)),false);
  queue();
  return;
 }
 scoutPose('notice');
 basis=orientation(10,0);
 queue();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 timers=literaryWishes.map((w,i)=>setTimeout(()=>{
  wishes.push(w);
  addPin(w,wishes.length-1);
  if(!reduced)showLine(w);
  $('pins').lastElementChild.classList.add('arriving');
  $('navLabel').textContent=(selected+1)+' / '+wishes.length;
  queue();
 },reduced?0:i*420));
};
const scout=$('scout');
const scoutRead=new Set();
const scoutArt=scout.querySelector('.moon-girl');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let scoutMotion, scoutTimers=[], presenting=false;
function showScoutFrame(frame,lean=0){
 scoutArt.style.backgroundPositionX=(frame*12.5)+'%';
 scoutArt.style.setProperty('--scout-lean',lean+'deg');
}
function scoutSequence(steps){
 scoutTimers.forEach(clearTimeout);
 scoutTimers=steps.map(([time,frame,lean])=>setTimeout(()=>showScoutFrame(frame,lean),time));
}
function scoutPose(pose){
 if(reducedMotion.matches||presenting)return;
 if(pose==='settle')scoutSequence([[0,3,2],[210,1,1],[255,2,0],[320,0,0]]);
 else if(pose==='notice')scoutSequence([[0,3,5],[230,1,3],[270,2,2],[335,3,1],[650,0,0]]);
}
function lookAtMoon(horizontal){
 if(reducedMotion.matches||presenting)return;
 scoutTimers.forEach(clearTimeout);
 showScoutFrame(horizontal<-.28?4:3,3+horizontal*2);
}
setInterval(()=>{
 if(document.hidden||drag||presenting||reducedMotion.matches)return;
 scoutSequence([[0,1,0],[48,2,0],[105,1,0],[150,0,0]]);
},5100);
reducedMotion.addEventListener('change',()=>{
 if(!reducedMotion.matches)return;
 scoutTimers.forEach(clearTimeout);
 scoutMotion?.cancel();
 showScoutFrame(0);
});
scout.onclick=()=>{
 const eligible=wishes.map((w,i)=>({w,i})).filter(({i})=>i!==selected);
 const unseen=eligible.filter(({w})=>!scoutRead.has(w.id));
 if(!unseen.length)scoutRead.clear();
 const choices=unseen.length?unseen:eligible;
 const distant=choices.filter(({w})=>project(basis,w.lat,w.lon)[2]<0);
 const pool=distant.length?distant:choices;
 const next=pool[Math.floor(Math.random()*pool.length)];
 if(!next)return;
 scoutRead.add(next.w.id);
 scoutPose('notice');
 read(next.i,true);
 if(matchMedia('(max-width:740px)').matches)$('reader').scrollIntoView({block:'nearest'});
};
function celebrateWish(pin){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pulse=()=>{
  pin.classList.remove('wish-stamped');
  void pin.offsetWidth;
  pin.classList.add('wish-stamped');
  if(!reduced)pin.addEventListener('animationend',()=>pin.classList.remove('wish-stamped'),{once:true});
 };
 if(reduced||!scout.animate){pulse();return}
 const girl=scout.getBoundingClientRect(), globe=$('globe').getBoundingClientRect();
 const area=scout.closest('.map'), map=area.getBoundingClientRect();
 const x=girl.left+girl.width*.105-map.left;
 const y=girl.top+girl.height*.42-map.top;
 const dx=globe.left+globe.width/2-map.left-x;
 const dy=globe.top+globe.height/2-map.top-y;
 const spark=document.createElement('span');
 spark.className='wish-spark';
 spark.setAttribute('aria-hidden','true');
 spark.style.left=x+'px';spark.style.top=y+'px';
 area.append(spark);
 presenting=true;
 scoutSequence([[0,3,1],[55,5,1],[100,6,1],[145,7,0],[190,8,0],[390,7,1],[440,6,2],[485,5,2],[535,1,1],[580,0,0]]);
 scoutMotion?.cancel();
 scoutMotion=scout.animate([
  {transform:'translateY(0)'},
  {transform:'translateY(-3px)',offset:.29},
  {transform:'translateY(0)',offset:.65},
  {transform:'translateY(0)'}
 ],{duration:630,easing:'ease-out'});
 const flight=spark.animate([
  {transform:'translate(0,0) scale(.2)',opacity:0},
  {transform:`translate(${dx*.32}px,${dy*.32-28}px) scale(1.2)`,opacity:1,offset:.36},
  {transform:`translate(${dx}px,${dy}px) scale(.75)`,opacity:1}
 ],{duration:460,delay:190,easing:'ease-in-out'});
 flight.onfinish=()=>{presenting=false;spark.remove();pulse()};
 flight.oncancel=()=>{presenting=false;spark.remove();pulse()};
}
applyLanguage();
