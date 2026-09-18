/* =====================================================================
   РЕДАКТОР СОЗВЕЗДИЯ
   Загружается только при EDITOR = 1 в family-tree.html.

   · перетаскивание звёзд мышью
   · люди: ФИО, годы, место, роль, биография, фото, голоса
   · ВЕТВИ: цветные области с подписями за группой людей
   · ЛОГО и заголовок сайта
   · пути к файлам вида pic/ivan.jpg (работают на любом ПК)
   · «Показывать карточку» — для тех, о ком известно только имя
   · автосохранение в браузере + экспорт готового data.js
   ===================================================================== */
(function(){
'use strict';
const T=window.TREE;
if(!T){console.error('editor.js: не найден TREE API');return;}

/* ------------------------------ стили ------------------------------ */
const css=`
#edt{position:fixed;top:0;right:0;bottom:0;width:360px;z-index:90;display:flex;flex-direction:column;
  background:linear-gradient(180deg,rgba(22,19,44,.98),rgba(10,9,22,.99));
  border-left:1px solid rgba(160,150,255,.28);
  font-family:Inter,system-ui,sans-serif;color:#e8e6fb;box-shadow:-20px 0 60px rgba(0,0,0,.5);
  transition:transform .45s cubic-bezier(.2,.9,.15,1)}
#edt.off{transform:translateX(100%)}
#edt header{padding:14px 16px 12px;border-bottom:1px solid rgba(160,150,255,.18);flex:0 0 auto}
#edt .ttl{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#c3b9ff;display:flex;
  justify-content:space-between;align-items:center}
#edt .badge{font-size:8.5px;letter-spacing:.14em;background:rgba(140,130,255,.18);color:#b9aeff;
  border:1px solid rgba(160,150,255,.3);padding:3px 7px;border-radius:20px}
#edt .modes{display:flex;gap:6px;margin-top:11px}
#edt .modes button{flex:1;padding:7px;font-size:11px;border-radius:8px;cursor:pointer;
  background:rgba(255,255,255,.04);border:1px solid rgba(160,150,255,.22);color:#c9c3f0;transition:.2s}
#edt .modes button.on{background:linear-gradient(150deg,#8b7cff,#6d8bff);color:#0a0820;border-color:transparent}
#edt .status{margin-top:9px;font-size:9.5px;line-height:1.4;padding:6px 9px;border-radius:8px}
#edt .status.ok{color:#9ff0c4;background:rgba(80,220,160,.1);border:1px solid rgba(80,220,160,.28)}
#edt .status.warn{color:#ffcf9a;background:rgba(255,180,90,.1);border:1px solid rgba(255,180,90,.28)}
#edt .scroll{flex:1;overflow-y:auto;padding:14px 16px 40px;scrollbar-width:thin;
  scrollbar-color:rgba(160,150,255,.35) transparent}
#edt .scroll::-webkit-scrollbar{width:6px}
#edt .scroll::-webkit-scrollbar-thumb{background:rgba(160,150,255,.3);border-radius:4px}
#edt .tools{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
#edt button.b{padding:8px 6px;font-size:11px;border-radius:8px;cursor:pointer;
  background:rgba(255,255,255,.04);border:1px solid rgba(160,150,255,.2);color:#ded9ff;transition:.2s}
#edt button.b:hover{border-color:#a97cff;background:rgba(140,130,255,.14)}
#edt button.b.pri{background:linear-gradient(150deg,#8b7cff,#6d8bff);color:#0a0820;border-color:transparent}
#edt button.b.dgr{border-color:rgba(255,120,140,.35);color:#ffb3c0}
#edt input,#edt textarea,#edt select{width:100%;background:rgba(255,255,255,.04);color:#e8e6fb;
  border:1px solid rgba(160,150,255,.2);border-radius:8px;padding:7px 9px;font-size:12px;
  font-family:inherit;outline:none;transition:.2s}
#edt input[type=color]{padding:2px;height:30px;cursor:pointer}
#edt input:focus,#edt textarea:focus,#edt select:focus{border-color:#a97cff;background:rgba(140,130,255,.1)}
#edt select option{background:#16132c}
#edt label{display:block;font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;
  color:#8e86c4;margin:11px 0 5px}
#edt .list{max-height:180px;overflow-y:auto;border:1px solid rgba(160,150,255,.16);border-radius:10px;margin:8px 0 4px}
#edt .row{display:flex;align-items:center;gap:8px;padding:7px 9px;cursor:pointer;font-size:12px;
  border-bottom:1px solid rgba(160,150,255,.08)}
#edt .row:last-child{border-bottom:0}
#edt .row:hover{background:rgba(140,130,255,.12)}
#edt .row.sel{background:linear-gradient(90deg,rgba(140,130,255,.28),transparent);color:#fff}
#edt .row img{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:0 0 auto;
  border:1px solid rgba(160,150,255,.3)}
#edt .row .bdot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
#edt .row .yy{margin-left:auto;font-size:9.5px;color:#7e77b4}
#edt .card{border:1px solid rgba(160,150,255,.2);border-radius:12px;padding:12px;margin-top:14px;
  background:rgba(255,255,255,.02)}
#edt .card h4{margin:0 0 4px;font-family:"Cormorant Garamond",serif;font-size:17px;font-weight:500;color:#efeaff}
#edt .card h5{margin:0 0 8px;font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:#a798e8}
#edt .hint{font-size:9.5px;color:#7e77b4;line-height:1.55;margin:6px 0}
#edt .two{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#edt .three{display:grid;grid-template-columns:34px 1fr 26px;gap:6px;align-items:center;margin-bottom:6px}
#edt .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(140,130,255,.14);
  border:1px solid rgba(160,150,255,.25);border-radius:20px;padding:4px 6px 4px 11px;font-size:11px;margin:0 5px 5px 0}
#edt .chip b{font-weight:400}
#edt .chip i{cursor:pointer;font-style:normal;opacity:.6;padding:0 3px}
#edt .chip i:hover{opacity:1;color:#ff9aae}
#edt .ph{display:flex;align-items:center;gap:7px;margin-bottom:6px}
#edt .ph img{width:34px;height:34px;object-fit:cover;border-radius:6px;flex:0 0 auto;
  border:1px solid rgba(160,150,255,.25)}
#edt .ph input{flex:1;font-size:10.5px}
#edt .ico{width:26px;height:26px;flex:0 0 auto;border-radius:6px;cursor:pointer;font-size:11px;
  background:rgba(255,255,255,.05);border:1px solid rgba(160,150,255,.2);color:#ded9ff}
#edt .ico:hover{border-color:#a97cff}
#edt .sub{border-top:1px dashed rgba(160,150,255,.2);margin-top:10px;padding-top:9px}
#edt .chk{display:flex;align-items:center;gap:9px;font-size:11.5px;color:#ded9ff;margin-top:10px;cursor:pointer}
#edt .chk input{width:auto;margin:0}
#edt-toggle{position:fixed;top:16px;right:16px;z-index:91;width:42px;height:42px;border-radius:12px;
  cursor:pointer;background:rgba(22,19,44,.95);border:1px solid rgba(160,150,255,.3);color:#d7d0ff;
  font-size:16px;transition:.25s}
#edt-toggle:hover{border-color:#a97cff;box-shadow:0 0 22px rgba(140,130,255,.35)}
#edt-toast{position:fixed;bottom:20px;right:380px;z-index:95;padding:9px 15px;border-radius:10px;
  background:rgba(22,19,44,.95);border:1px solid rgba(160,150,255,.3);color:#ded9ff;font-size:11.5px;
  opacity:0;transform:translateY(8px);transition:.3s;pointer-events:none;font-family:Inter,sans-serif;
  max-width:320px}
#edt-toast.on{opacity:1;transform:none}
.node.esel .ph,.node.esel .dot{outline:2px solid #ffb648;outline-offset:4px}
body.e-edit #viewport{cursor:crosshair}
body.e-drag,body.e-drag #viewport{cursor:grabbing !important}
body.e-edit .node{cursor:move}
@media(max-width:900px){#edt{width:100%}#edt-toast{right:20px;bottom:70px}}
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

/* ------------------------------ разметка ------------------------------ */
const panel=document.createElement('div');
panel.id='edt';
panel.innerHTML=`
 <header>
   <div class="ttl"><span>Редактор</span><span class="badge">EDITOR = 1</span></div>
   <div class="modes">
     <button data-mode="edit" class="on">Правка</button>
     <button data-mode="view">Просмотр</button>
   </div>
   <div class="status" id="e-status"></div>
 </header>
 <div class="scroll">
    <div class="tools">
      <button class="b pri" id="e-add">+ Человек</button>
      <button class="b pri" id="e-addpet">+ Питомец</button>
      <button class="b" id="e-gallery">▦ Галерея</button>
      <button class="b" id="e-save">Сохранить</button>
      <button class="b" id="e-file">Подключить data.js</button>
      <button class="b" id="e-code">Скачать data.js</button>
      <button class="b" id="e-json">Экспорт JSON</button>
      <button class="b" id="e-imp">Импорт JSON</button>
      <button class="b dgr" id="e-reset">Сброс</button>
    </div>
   <div id="e-site"></div>
   <div id="e-branches"></div>
   <div id="e-pets"></div>
   <label>Люди</label>
   <input id="e-search" placeholder="Поиск по имени…">
   <div class="list" id="e-list"></div>
   <div class="hint">Клик по звезде — выбрать, перетаскивание — переместить. Всё сохраняется автоматически.</div>
   <div id="e-form"></div>
  </div>`;
document.body.appendChild(panel);

const toggle=document.createElement('button');
toggle.id='edt-toggle'; toggle.textContent='✎'; toggle.title='Показать/скрыть редактор';
document.body.appendChild(toggle);
const toast=document.createElement('div'); toast.id='edt-toast'; document.body.appendChild(toast);

let tmr=null;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tmr);
  tmr=setTimeout(()=>toast.classList.remove('on'),2600);}

const $=s=>panel.querySelector(s);
const listEl=$('#e-list'), formEl=$('#e-form'), searchEl=$('#e-search'),
      siteEl=$('#e-site'), brEl=$('#e-branches'), petEl=$('#e-pets');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ------------------------------ состояние ------------------------------ */
let mode='edit', sel=null, selPet=null, nd=null, rafId=null, saveTimer=null;
document.body.classList.add('e-edit');

function setMode(m){
  mode=m;
  panel.querySelectorAll('.modes button').forEach(b=>b.classList.toggle('on',b.dataset.mode===m));
  document.body.classList.toggle('e-edit',m==='edit');
  if(m==='view') T.people.forEach(p=>p.el&&p.el.classList.remove('esel')); else highlight();
  const galEdit=document.getElementById('galedit');
  if(galEdit)galEdit.hidden=m!=='edit';
}
panel.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
toggle.onclick=()=>panel.classList.toggle('off');

/* =====================================================================
   СОХРАНЕНИЕ ПРЯМО В ФАЙЛ data.js
   Chrome/Edge/Opera на компьютере умеют писать в выбранный файл напрямую
   (File System Access API). Один раз нажимаете «Подключить data.js»,
   выбираете файл рядом со страницей — дальше все правки уходят прямо в него.
   Где такого API нет (Firefox, Safari, телефоны) — остаётся кнопка
   «Скачать data.js» и лёгкая резервная копия в браузере без тяжёлых файлов.
   ===================================================================== */
const CAN_FS = typeof window.showOpenFilePicker==='function' || typeof window.showSaveFilePicker==='function';
let fileHandle=null, dirty=false;

function dataJsText(){
  const d=T.exportData();
  return '/* Сгенерировано редактором '+new Date().toLocaleString('ru-RU')+' */\n\n'+
    'let SITE='+JSON.stringify(d.site,null,1)+';\n\n'+
    'let BRANCHES='+JSON.stringify(d.branches,null,1)+';\n\n'+
    'let PEOPLE='+JSON.stringify(d.people,null,1)+';\n\n'+
    'let PETS='+JSON.stringify(d.pets,null,1)+';\n\n'+
    'let UNIONS='+JSON.stringify(d.unions,null,1)+';\n';
}
async function ensurePermission(){
  if(!fileHandle||!fileHandle.queryPermission)return true;
  let p=await fileHandle.queryPermission({mode:'readwrite'});
  if(p!=='granted') p=await fileHandle.requestPermission({mode:'readwrite'});
  return p==='granted';
}
async function writeFile(){
  if(!fileHandle)return false;
  try{
    if(!await ensurePermission())return false;
    const w=await fileHandle.createWritable();
    await w.write(dataJsText()); await w.close();
    dirty=false; updStatus();
    try{localStorage.removeItem(T.STORE_KEY);}catch(_){}
    return true;
  }catch(e){say('Ошибка записи в файл: '+e.message); return false;}
}
async function connectFile(){
  if(!CAN_FS){say('Этот браузер не умеет писать в файл — пользуйтесь «Скачать data.js» (Chrome/Edge умеют)');return;}
  try{
    if(typeof window.showOpenFilePicker==='function'){
      const picked=await window.showOpenFilePicker({
        multiple:false,
        types:[{description:'Файл данных',accept:{'text/javascript':['.js']}}],
        mode:'readwrite'
      });
      fileHandle=picked[0];
    }else{
      fileHandle=await window.showSaveFilePicker({
        suggestedName:'data.js',
        types:[{description:'Файл данных',accept:{'text/javascript':['.js']}}]
      });
    }
    if(await writeFile()) say('Подключено: '+fileHandle.name+' — теперь всё сохраняется прямо в файл');
  }catch(e){ if(e.name!=='AbortError') say('Не удалось подключить файл: '+e.message); }
  updStatus();
}
function updStatus(){
  const el=$('#e-status'); if(!el)return;
  if(fileHandle){
    el.className='status ok';
    el.textContent=(dirty?'● сохраняю…  ':'✓ ')+fileHandle.name+' — запись напрямую в файл';
  }else{
    el.className='status warn';
    el.textContent=CAN_FS?'Файл не подключён — правки только в памяти. Нажмите «Подключить data.js»'
                         :'Браузер не умеет писать в файл — сохраняйте кнопкой «Скачать data.js»';
  }
}
async function autosave(){
  if(fileHandle){
    if(!await writeFile()){ T.persist(); dirty=true; updStatus(); }
    return;
  }
  T.persist();                      // лёгкая копия без встроенных файлов; молча
  dirty=true; updStatus();
}
function touch(rebuildMap=true){
  if(rebuildMap) T.rebuild(false);
  dirty=true; updStatus();
  clearTimeout(saveTimer);
  saveTimer=setTimeout(autosave,800);
}
addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){
    e.preventDefault();
    fileHandle?writeFile().then(ok=>ok&&say('Записано в '+fileHandle.name)):connectFile();
  }
});
addEventListener('beforeunload',e=>{ if(dirty&&fileHandle){e.preventDefault();e.returnValue='';} });
function highlight(){T.people.forEach(p=>p.el&&p.el.classList.toggle('esel',mode==='edit'&&p.id===sel));}
function select(id){sel=id;selPet=null;renderList();renderForm();renderPets();highlight();}
function selectPet(id){selPet=id;sel=null;renderPets();renderForm();}

function galleryTargetOptions(){
  const people=T.people.map(p=>`<option value="person:${p.id}">${esc(p.name)}</option>`).join('');
  const pets=T.pets.map(p=>`<option value="pet:${p.id}">🐾 ${esc(p.name)}</option>`).join('');
  return people+pets;
}
function wireGalleryEditor(){
  const edit=document.getElementById('galedit'), target=document.getElementById('galaddtarget'),
        tag=document.getElementById('galaddtag'), add=document.getElementById('galadd');
  if(!edit||!target||!tag||!add)return;
  edit.hidden=false;
  target.innerHTML=galleryTargetOptions();
  const current=selPet?`pet:${selPet}`:sel?`person:${sel}`:'';
  if(current&&target.querySelector(`option[value="${current}"]`))target.value=current;
  add.onclick=()=>{
    const value=target.value, caption=tag.value.trim();
    if(!value){say('Выберите человека или питомца');return;}
    pickPaths('image/*',paths=>{
      const [kind,id]=value.split(':');
      const obj=kind==='pet'?T.pets.find(p=>p.id===id):T.people.find(p=>p.id===id);
      if(!obj)return;
      if(!Array.isArray(obj.photos)||obj.autoPhotos)obj.photos=[];
      obj.autoPhotos=false;
      if(!Array.isArray(obj.photoTags))obj.photoTags=[];
      paths.forEach(path=>{obj.photos.push(path);obj.photoTags.push(caption);});
      touch(); tag.value=''; renderGalleryAfterEdit();
      say(`Добавлено фото: ${obj.name}`);
    });
  };
}
function renderGalleryAfterEdit(){
  if(window.TREE&&T.openGallery)T.openGallery(null,null);
}

/* ------------------------------ файлы и пути ------------------------------ */
function pickFiles(accept,multiple,cb){
  const i=document.createElement('input');
  i.type='file'; i.accept=accept; i.multiple=!!multiple;
  i.onchange=()=>cb([...i.files]); i.click();
}
function readAsDataURL(f){return new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f);});}
function download(name,text,type){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain;charset=utf-8'}));
  a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
const base=()=>T.site.mediaBase||'';
/* выбрать файл на диске, но сохранить ТОЛЬКО путь вида pic/имя.jpg */
function pickPaths(accept,cb){
  pickFiles(accept,true,files=>{
    if(!files.length)return;
    cb(files.map(f=>base()+f.name));
    say('Запомнены пути. Положите эти файлы в папку «'+(base()||'рядом со страницей')+'»');
  });
}

/* ------------------------------ сайт и лого ------------------------------ */
function renderSite(){
  const s=T.site;
  siteEl.innerHTML=`
   <div class="card">
     <h5>Заставка и лого</h5>
     <label>Фамилия</label><input id="s-name" value="${esc(s.surname||'')}">
     <label>Подпись</label><input id="s-sub" value="${esc(s.subtitle||'')}">
     <label>Лого — путь к картинке</label>
     <div class="ph">
       ${s.logo?`<img src="${esc(s.logo)}" onerror="this.style.opacity=.25">`:''}
       <input id="s-logo" value="${esc(s.logo||'')}" placeholder="${esc(base())}logo.png">
       <button class="ico" id="s-logoclr" title="Убрать">✕</button>
     </div>
     <div class="two">
       <button class="b" id="s-logopick">Выбрать файл (путь)</button>
       <button class="b" id="s-logoembed">Встроить картинку</button>
     </div>
     <label>Папка для файлов по умолчанию</label>
     <input id="s-base" value="${esc(s.mediaBase||'')}" placeholder="pic/">
     <div class="hint">Пути считаются от папки со страницей: <b>pic/logo.png</b> — это файл logo.png в папке pic рядом с family-tree.html. «Встроить» кладёт картинку внутрь данных (не нужны внешние файлы, но растёт размер).</div>
   </div>`;

  const upd=(k,v)=>{T.site[k]=v;T.applySite();clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>T.persist(),400);};
  siteEl.querySelector('#s-name').oninput=e=>upd('surname',e.target.value);
  siteEl.querySelector('#s-sub').oninput=e=>upd('subtitle',e.target.value);
  siteEl.querySelector('#s-logo').onchange=e=>{upd('logo',e.target.value.trim());renderSite();};
  siteEl.querySelector('#s-base').onchange=e=>{
    let v=e.target.value.trim(); if(v&&!/[\/\\]$/.test(v))v+='/'; upd('mediaBase',v); renderSite();
  };
  siteEl.querySelector('#s-logoclr').onclick=()=>{upd('logo','');renderSite();};
  siteEl.querySelector('#s-logopick').onclick=()=>pickPaths('image/*',p=>{upd('logo',p[0]);renderSite();});
  siteEl.querySelector('#s-logoembed').onclick=()=>pickFiles('image/*',false,f=>{
    if(!f[0])return; readAsDataURL(f[0]).then(u=>{upd('logo',u);renderSite();say('Лого встроено в данные');});
  });
}

/* ------------------------------ ветви ------------------------------ */
const PALETTE=['#6d8bff','#c07cff','#4fd3c4','#ff9f6d','#ff6d9f','#8ce36d','#ffd76d','#6dd0ff'];
function renderBranches(){
  const br=T.branches;
  brEl.innerHTML=`
   <div class="card">
     <h5>Ветви семьи</h5>
     ${br.map((b,i)=>`
       <div class="three">
         <input type="color" value="${esc(b.color||'#6d8bff')}" data-bc="${i}">
         <input value="${esc(b.title||'')}" data-bt="${i}" placeholder="Название ветви">
         <button class="ico" data-bd="${i}" title="Удалить ветвь">✕</button>
       </div>`).join('')||'<div class="hint">Ветвей пока нет.</div>'}
     <button class="b" id="b-add" style="margin-top:6px;width:100%">+ Ветвь</button>
     <div class="hint">Фон за всеми людьми одной ветви закрашивается её цветом, сверху появляется подпись. Ветвь человеку назначается в его форме ниже.</div>
   </div>`;

  brEl.querySelectorAll('[data-bt]').forEach(inp=>inp.oninput=()=>{
    T.branches[+inp.dataset.bt].title=inp.value;
    clearTimeout(inp._t); inp._t=setTimeout(()=>{touch();renderForm();},300);
  });
  brEl.querySelectorAll('[data-bc]').forEach(inp=>inp.oninput=()=>{
    T.branches[+inp.dataset.bc].color=inp.value;
    clearTimeout(inp._t); inp._t=setTimeout(()=>touch(),200);
  });
  brEl.querySelectorAll('[data-bd]').forEach(b=>b.onclick=()=>{
    const br2=T.branches[+b.dataset.bd];
    if(!confirm(`Удалить ветвь «${br2.title}»? Люди останутся, но без ветви.`))return;
    T.people.forEach(p=>{if(p.branch===br2.id)p.branch='';});
    T.branches.splice(+b.dataset.bd,1);
    touch(); renderBranches(); renderForm(); renderList();
  });
  brEl.querySelector('#b-add').onclick=()=>{
    const title=prompt('Название ветви','Новая ветвь'); if(title===null)return;
    let n=1; while(T.branches.some(b=>b.id==='br'+n))n++;
    T.branches.push({id:'br'+n,title:title||'Новая ветвь',color:PALETTE[T.branches.length%PALETTE.length]});
    touch(); renderBranches(); renderForm();
  };
}

/* ------------------------------ список людей ------------------------------ */
function renderList(){
  const q=(searchEl.value||'').toLowerCase().trim();
  const items=T.people.filter(p=>!q||p.name.toLowerCase().includes(q));
  listEl.innerHTML=items.map(p=>{
    const b=T.branches.find(x=>x.id===p.branch);
    return `<div class="row ${p.id===sel?'sel':''}" data-id="${p.id}">
      <span class="bdot" style="background:${b?b.color:'#3b3560'}"></span>
      ${p.card===false?'':`<img src="${p.photos&&p.photos[0]||''}" alt="">`}
      <span>${esc(p.name)}${p.card===false?' ·':''}</span>
      <span class="yy">${esc(p.years||'')}</span></div>`;
  }).join('')||'<div class="row">Пока никого нет</div>';
  listEl.querySelectorAll('.row[data-id]').forEach(r=>r.onclick=()=>{
    select(r.dataset.id); const p=T.byId[r.dataset.id]; if(p)T.centerOn(p);
  });
}
searchEl.oninput=renderList;

/* ------------------------------ питомцы ------------------------------ */
function petOwner(id){const p=T.people.find(x=>x.id===id);return p?p.name:'—';}
function renderPets(){
  if(!petEl)return;
  petEl.innerHTML=`
   <div class="card">
     <h5>Питомцы</h5>
     ${T.pets.map(p=>`
       <div class="row ${p.id===selPet?'sel':''}" data-pet="${p.id}">
         <span class="bdot" style="background:#d8c98a"></span>
         <span>🐾 ${esc(p.name)}</span>
         <span class="yy">${esc(petOwner(p.owner))}</span>
       </div>`).join('')||'<div class="hint">Питомцев пока нет.</div>'}
     <button class="b" id="pet-add" style="margin-top:6px;width:100%">+ Питомец</button>
     <div class="hint">Питомец показывается рядом со своим хозяином на карте и в его карточке.</div>
   </div>`;
  petEl.querySelectorAll('.row[data-pet]').forEach(r=>r.onclick=()=>selectPet(r.dataset.pet));
  const ba=petEl.querySelector('#pet-add'); if(ba)ba.onclick=addPet;
}
function addPet(){
  let n=1; while(T.pets.some(p=>p.id==='pet'+n))n++;
  T.pets.push({id:'pet'+n,name:'Новый питомец',species:'',owner:'',bio:[],photos:[],manualPos:false});
  touch(); renderPets(); selectPet('pet'+n);
  say('Питомец добавлен');
}

/* ------------------------------ форма человека ------------------------------ */
const others=p=>T.people.filter(q=>q.id!==p.id);
const shortName=id=>{const q=T.byId[id];return q?q.name.split(' ').slice(0,2).join(' '):id;};
const unionsOf=p=>T.unions.filter(u=>u.a===p.id||u.b===p.id);
const parentUnions=p=>T.unions.filter(u=>(u.children||[]).includes(p.id));
const unionTitle=u=>u.b?`${shortName(u.a)} + ${shortName(u.b)}`:`${shortName(u.a)} (один родитель)`;

function renderForm(){
  if(selPet){
    const p=T.pets.find(x=>x.id===selPet);
    if(!p){formEl.innerHTML='<div class="hint">Питомец не найден.</div>';return;}
    const real=(p.photos||[]).slice();
    formEl.innerHTML=`
    <div class="card">
      <h4>🐾 ${esc(p.name)}</h4>
      <div class="hint">id: <b>${esc(p.id)}</b></div>
      <label>Кличка</label><input data-pf="name" value="${esc(p.name)}">
      <label>Вид</label><input data-pf="species" value="${esc(p.species||'')}" placeholder="кот, собака…">
      <label>Хозяин</label>
      <select data-pf="owner">
        <option value="">— без хозяина —</option>
        ${T.people.map(q=>`<option value="${q.id}" ${p.owner===q.id?'selected':''}>${esc(q.name)}</option>`).join('')}
      </select>
      <label>Описание</label>
      <textarea data-pf="bio" rows="5">${esc((p.bio||[]).join('\n\n'))}</textarea>

      <div class="sub">
        <label>Фотографии (${real.length})</label>
        <div>${real.map((src,i)=>`
          <div class="ph">
            <img src="${esc(src)}" onerror="this.style.opacity=.25">
            <input value="${esc(src.startsWith('data:')?'(встроенный файл)':src)}" ${src.startsWith('data:')?'readonly':''} data-pi="${i}">
            <button class="ico" data-pup="${i}" title="Выше">↑</button>
            <button class="ico" data-pdel="${i}" title="Удалить">✕</button>
          </div>`).join('')}</div>
        <div class="two" style="margin-top:6px">
          <button class="b" id="e-ppath">+ путь к файлу</button>
          <button class="b" id="e-ppick">+ выбрать файлы</button>
        </div>
        <button class="b" id="e-pembed" style="width:100%;margin-top:6px">+ встроить фото в данные</button>
      </div>

      <div class="sub two" style="margin-top:8px">
        <button class="b dgr" id="e-petdel">Удалить питомца</button>
      </div>
    </div>`;
    wirePetForm(p);
    return;
  }
  const p=T.byId[sel];
  if(!p){formEl.innerHTML='<div class="hint">Выберите человека в списке или кликните по звезде.</div>';return;}
  const real=p.autoPhotos?[]:(p.photos||[]);

  formEl.innerHTML=`
  <div class="card">
    <h4>${esc(p.name)}</h4>
    <div class="hint">id: <b>${esc(p.id)}</b> · координаты ${Math.round(p.x)}, ${Math.round(p.y)}</div>

    <label>ФИО</label><input data-f="name" value="${esc(p.name)}">
    <div class="two">
      <div><label>Годы</label><input data-f="years" value="${esc(p.years||'')}"></div>
      <div><label>Место</label><input data-f="place" value="${esc(p.place||'')}"></div>
    </div>
    <label>Кем был(а)</label><input data-f="role" value="${esc(p.role||'')}">
    <div class="hint">Питомцев добавляйте отдельной кнопкой «+ Питомец» выше и назначайте им хозяина.</div>

    <label>Ветвь семьи</label>
    <select data-f="branch">
      <option value="">— без ветви —</option>
      ${T.branches.map(b=>`<option value="${b.id}" ${p.branch===b.id?'selected':''}>${esc(b.title)}</option>`).join('')}
    </select>

    <label class="chk"><input type="checkbox" data-f="card" ${p.card===false?'':'checked'}>
      <span>Показывать карточку</span></label>
    <div class="hint">Снимите галочку, если о человеке известно только имя: на небе останется звезда с подписью, но карточка открываться не будет.</div>

    ${p.card===false?'':`
    <label>Биография — абзацы разделяются пустой строкой</label>
    <textarea data-f="bio" rows="7">${esc((p.bio||[]).join('\n\n'))}</textarea>`}

    <div class="two" style="margin-top:8px">
      <div><label>X</label><input data-f="x" value="${Math.round(p.x)}"></div>
      <div><label>Y</label><input data-f="y" value="${Math.round(p.y)}"></div>
    </div>

    <div class="sub">
      <label>Фотографии ${real.length?`(${real.length})`:'— сейчас звёздная заглушка'}</label>
      <div>${real.map((src,i)=>`
        <div class="ph">
          <img src="${esc(src)}" onerror="this.style.opacity=.25">
          <input value="${esc(src.startsWith('data:')?'(встроенный файл)':src)}" ${src.startsWith('data:')?'readonly':''} data-pi="${i}">
          <button class="ico" data-pup="${i}" title="Выше">↑</button>
          <button class="ico" data-pdel="${i}" title="Удалить">✕</button>
        </div>`).join('')}</div>
      <div class="two" style="margin-top:6px">
        <button class="b" id="e-ppath">+ путь к файлу</button>
        <button class="b" id="e-ppick">+ выбрать файлы</button>
      </div>
      <button class="b" id="e-pembed" style="width:100%;margin-top:6px">+ встроить фото в данные</button>
      <div class="hint">«Выбрать файлы» запоминает только путь (<b>${esc(base()||'папка/')}имя.jpg</b>) — сами файлы должны лежать в этой папке рядом со страницей.</div>
    </div>

    <div class="sub">
      <label>Голоса (${(p.voices||[]).length})</label>
      <div>${(p.voices||[]).map((v,i)=>`
        <div style="margin-bottom:8px">
          <div class="ph">
            <input value="${esc(v.title||'')}" data-vt="${i}" placeholder="подпись записи">
            <input value="${esc(v.dur||'')}" data-vd="${i}" placeholder="1:12" style="max-width:52px;flex:0 0 auto">
            <button class="ico" data-vdel="${i}">✕</button>
          </div>
          <div class="ph">
            <input value="${esc(String(v.url||'').startsWith('data:')?'(встроенный файл)':(v.url||''))}"
              ${String(v.url||'').startsWith('data:')?'readonly':''} data-vu="${i}" placeholder="audio/zapis.mp3">
            <button class="ico" data-vpick="${i}" title="Выбрать файл (путь)">📁</button>
          </div>
        </div>`).join('')}</div>
      <div class="two" style="margin-top:6px">
        <button class="b" id="e-vadd">+ запись</button>
        <button class="b" id="e-vembed">+ встроить аудио</button>
      </div>
      <div class="hint">Длительность можно не заполнять — плеер сам покажет её, когда файл загрузится.</div>
    </div>

    <div class="sub">
      <label>Пары и дети</label>
      ${unionsOf(p).map(u=>`
        <div style="margin-bottom:9px">
          <div class="chip"><b>${esc(unionTitle(u))}</b><i data-udel="${T.unions.indexOf(u)}" title="Удалить пару">✕</i></div>
          <div>${(u.children||[]).map(c=>`<span class="chip">${esc(shortName(c))}<i data-cdel="${T.unions.indexOf(u)}|${c}">✕</i></span>`).join('')||'<span class="hint">детей нет</span>'}</div>
          <select data-cadd="${T.unions.indexOf(u)}" style="margin-top:5px">
            <option value="">+ добавить ребёнка…</option>
            ${others(p).filter(q=>!(u.children||[]).includes(q.id)&&q.id!==u.b)
              .map(q=>`<option value="${q.id}">${esc(q.name)}</option>`).join('')}
          </select>
        </div>`).join('')}
      <select id="e-uadd">
        <option value="">+ новая пара с…</option>
        ${others(p).map(q=>`<option value="${q.id}">${esc(q.name)}</option>`).join('')}
        <option value="__solo">— родитель без пары —</option>
      </select>
    </div>

    <div class="sub">
      <label>Родители</label>
      ${parentUnions(p).map(u=>`<span class="chip">${esc(unionTitle(u))}<i data-pdel2="${T.unions.indexOf(u)}">✕</i></span>`).join('')
        ||'<span class="hint">не указаны</span>'}
      <select id="e-padd" style="margin-top:6px">
        <option value="">+ указать пару родителей…</option>
        ${T.unions.map((u,i)=>(u.a===p.id||u.b===p.id||(u.children||[]).includes(p.id))?'':
          `<option value="${i}">${esc(unionTitle(u))}</option>`).join('')}
      </select>
    </div>

    <div class="sub two">
      <button class="b" id="e-look" ${p.card===false?'disabled':''}>Открыть карточку</button>
      <button class="b dgr" id="e-del">Удалить человека</button>
    </div>
  </div>`;
  wireForm(p);
}

/* ------------------------------ обработчики формы ------------------------------ */
function wirePetForm(p){
  const ph=()=>(p.photos||[]).slice();
  formEl.querySelectorAll('[data-pf]').forEach(inp=>{
    const f=inp.dataset.pf;
    const apply=()=>{
      if(f==='bio') p.bio=inp.value.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
      else if(f==='owner'){ p.owner=inp.value; p.manualPos=false; }
      else p[f]=inp.value;
    };
    if(inp.tagName==='SELECT') inp.onchange=()=>{apply();touch();renderPets();};
    else inp.oninput=()=>{apply();clearTimeout(inp._t);inp._t=setTimeout(()=>{touch();renderPets();const h=formEl.querySelector('h4');if(h)h.textContent='🐾 '+p.name;},350);};
  });
  formEl.querySelectorAll('[data-pi]').forEach(i=>i.onchange=()=>{
    const a=ph(); a[+i.dataset.pi]=i.value.trim(); p.photos=a.filter(Boolean); touch(); renderForm();});
  formEl.querySelectorAll('[data-pdel]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.pdel,a=ph(); a.splice(i,1); p.photos=a;
    p.photoTags=(p.photoTags||[]).slice();p.photoTags.splice(i,1);touch(); renderForm();});
  formEl.querySelectorAll('[data-pup]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.pup,a=ph(); if(i>0){
      [a[i-1],a[i]]=[a[i],a[i-1]];p.photos=a;
      const tags=(p.photoTags||[]).slice();[tags[i-1],tags[i]]=[tags[i],tags[i-1]];p.photoTags=tags;
      touch();renderForm();}});
  formEl.querySelector('#e-ppath').onclick=()=>{
    const v=prompt('Путь к фото относительно страницы:',base()); if(!v)return;
    p.photos=ph().concat(v.trim());p.photoTags=(p.photoTags||[]).concat('');touch(); renderForm();};
  formEl.querySelector('#e-ppick').onclick=()=>pickPaths('image/*',paths=>{
    p.photos=ph().concat(paths);p.photoTags=(p.photoTags||[]).concat(paths.map(()=>''));touch(); renderForm();});
  formEl.querySelector('#e-pembed').onclick=()=>pickFiles('image/*',true,files=>{
    Promise.all(files.map(readAsDataURL)).then(u=>{p.photos=ph().concat(u);p.photoTags=(p.photoTags||[]).concat(u.map(()=>''));touch();renderForm();});});
  formEl.querySelector('#e-petdel').onclick=()=>{
    if(!confirm(`Удалить питомца «${p.name}»?`))return;
    T.pets=T.pets.filter(x=>x.id!==p.id);
    selPet=null; T.rebuild(false); touch(false); renderPets(); renderForm();
  };
}
function wireForm(p){
  formEl.querySelectorAll('[data-f]').forEach(inp=>{
    const f=inp.dataset.f;
    const apply=()=>{
      if(f==='bio') p.bio=inp.value.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
      else if(f==='x'||f==='y') p[f]=parseFloat(inp.value)||0;
      else if(f==='card') p.card=inp.checked;
      else p[f]=inp.value;
    };
    if(inp.type==='checkbox'||inp.tagName==='SELECT'){
      inp.onchange=()=>{apply();touch();renderList();if(f==='card')renderForm();};
    }else{
      inp.oninput=()=>{apply();clearTimeout(inp._t);
        inp._t=setTimeout(()=>{touch();highlight();
          if(f==='name'){renderList();const h=formEl.querySelector('h4');if(h)h.textContent=p.name;}},350);};
    }
  });

  /* фото */
  const ph=()=>p.autoPhotos?[]:(p.photos||[]);
  formEl.querySelectorAll('[data-pi]').forEach(i=>i.onchange=()=>{
    const a=ph().slice(); a[+i.dataset.pi]=i.value.trim(); p.photos=a.filter(Boolean); touch(); renderForm();});
  formEl.querySelectorAll('[data-pdel]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.pdel,a=ph().slice(); a.splice(i,1); p.photos=a;
    p.photoTags=(p.photoTags||[]).slice();p.photoTags.splice(i,1);touch(); renderForm();});
  formEl.querySelectorAll('[data-pup]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.pup,a=ph().slice(); if(i>0){
      [a[i-1],a[i]]=[a[i],a[i-1]];p.photos=a;
      const tags=(p.photoTags||[]).slice();[tags[i-1],tags[i]]=[tags[i],tags[i-1]];p.photoTags=tags;
      touch();renderForm();}});
  formEl.querySelector('#e-ppath').onclick=()=>{
    const v=prompt('Путь к фото относительно страницы:',base()); if(!v)return;
    p.photos=ph().concat(v.trim());p.photoTags=(p.photoTags||[]).concat('');touch(); renderForm();};
  formEl.querySelector('#e-ppick').onclick=()=>pickPaths('image/*',paths=>{
    p.photos=ph().concat(paths);p.photoTags=(p.photoTags||[]).concat(paths.map(()=>''));touch(); renderForm();});
  formEl.querySelector('#e-pembed').onclick=()=>pickFiles('image/*',true,files=>{
    Promise.all(files.map(readAsDataURL)).then(u=>{p.photos=ph().concat(u);p.photoTags=(p.photoTags||[]).concat(u.map(()=>''));touch();renderForm();
      say('Фото встроены. Для большого архива лучше пути к файлам');});});

  /* голоса */
  const vv=()=>p.voices;
  formEl.querySelectorAll('[data-vt]').forEach(i=>i.oninput=()=>{vv()[+i.dataset.vt].title=i.value;
    clearTimeout(i._t);i._t=setTimeout(()=>touch(false),350);});
  formEl.querySelectorAll('[data-vd]').forEach(i=>i.oninput=()=>{vv()[+i.dataset.vd].dur=i.value;
    clearTimeout(i._t);i._t=setTimeout(()=>touch(false),350);});
  formEl.querySelectorAll('[data-vu]').forEach(i=>i.onchange=()=>{vv()[+i.dataset.vu].url=i.value.trim();touch();});
  formEl.querySelectorAll('[data-vpick]').forEach(b=>b.onclick=()=>{
    pickPaths('audio/*',paths=>{vv()[+b.dataset.vpick].url=paths[0];touch();renderForm();});});
  formEl.querySelectorAll('[data-vdel]').forEach(b=>b.onclick=()=>{
    vv().splice(+b.dataset.vdel,1); touch(); renderForm();});
  formEl.querySelector('#e-vadd').onclick=()=>{
    p.voices.push({title:'Новая запись',url:'',dur:''}); touch(); renderForm();};
  formEl.querySelector('#e-vembed').onclick=()=>pickFiles('audio/*',true,files=>{
    Promise.all(files.map(readAsDataURL)).then(urls=>{
      urls.forEach((u,i)=>p.voices.push({title:files[i].name.replace(/\.[^.]+$/,''),url:u,dur:''}));
      touch(); renderForm();});});

  /* связи */
  formEl.querySelectorAll('[data-udel]').forEach(b=>b.onclick=()=>{
    T.unions.splice(+b.dataset.udel,1); touch(); renderForm();});
  formEl.querySelectorAll('[data-cdel]').forEach(b=>b.onclick=()=>{
    const [ui,cid]=b.dataset.cdel.split('|'); const u=T.unions[+ui];
    u.children=u.children.filter(c=>c!==cid); touch(); renderForm();});
  formEl.querySelectorAll('[data-cadd]').forEach(s=>s.onchange=()=>{
    if(!s.value)return; const u=T.unions[+s.dataset.cadd];
    if(!u.children.includes(s.value))u.children.push(s.value); touch(); renderForm();});
  formEl.querySelector('#e-uadd').onchange=e=>{
    if(!e.target.value)return;
    T.unions.push({a:p.id,b:e.target.value==='__solo'?null:e.target.value,children:[]});
    touch(); renderForm();};
  formEl.querySelectorAll('[data-pdel2]').forEach(b=>b.onclick=()=>{
    const u=T.unions[+b.dataset.pdel2]; u.children=u.children.filter(c=>c!==p.id); touch(); renderForm();});
  formEl.querySelector('#e-padd').onchange=e=>{
    if(e.target.value==='')return; const u=T.unions[+e.target.value];
    if(!u.children.includes(p.id))u.children.push(p.id); touch(); renderForm();};

  formEl.querySelector('#e-look').onclick=()=>{setMode('view');T.openCard(p.id);};
  formEl.querySelector('#e-del').onclick=()=>{
    if(!confirm(`Удалить «${p.name}» из созвездия?`))return;
    T.people=T.people.filter(q=>q.id!==p.id);
    T.unions=T.unions.filter(u=>{
      u.children=(u.children||[]).filter(c=>c!==p.id);
      if(u.a===p.id&&u.b){u.a=u.b;u.b=null;}
      else if(u.b===p.id){u.b=null;}
      else if(u.a===p.id)return false;
      return !(u.b===null&&!u.children.length);
    });
    sel=null; touch(); renderList(); renderForm();
  };
}

/* ------------------------------ панель инструментов ------------------------------ */
$('#e-add').onclick=()=>{
  let n=1; while(T.byId['p'+n])n++;
  const c=T.screenToWorld(innerWidth/2-180,innerHeight/2);
  const p={id:'p'+n,name:'Новый человек',years:'',x:Math.round(c.x),y:Math.round(c.y),
           place:'',role:'',pet:'',branch:'',card:true,bio:[],photos:[],voices:[]};
  T.people.push(p); touch(); select(p.id); T.centerOn(p);
  say('Звезда добавлена — перетащите её на место');
};
$('#e-addpet').onclick=addPet;
$('#e-file').onclick=connectFile;
$('#e-gallery').onclick=()=>{ T.openGallery(null,null); };
$('#e-save').onclick=async()=>{
  if(fileHandle){ (await writeFile())&&say('Записано в '+fileHandle.name); }
  else if(CAN_FS) connectFile();
  else { download('data.js',dataJsText(),'text/javascript;charset=utf-8'); say('Замените этим файлом старый data.js'); }
};
$('#e-json').onclick=()=>{download('family-data.json',JSON.stringify(T.exportData(),null,2),'application/json');
  say('Файл выгружен');};
$('#e-code').onclick=()=>{
  download('data.js',dataJsText(),'text/javascript;charset=utf-8');
  say('Замените этим файлом старый data.js');
};
$('#e-imp').onclick=()=>pickFiles('application/json,.json',false,files=>{
  if(!files[0])return;
  const r=new FileReader();
  r.onload=()=>{try{
      const d=JSON.parse(r.result);
      if(!Array.isArray(d.people))throw new Error('нет массива people');
      T.loadData(d); sel=null; touch(); renderSite(); renderBranches(); renderList(); renderForm(); T.fit();
      say('Данные загружены');
    }catch(e){alert('Не получилось прочитать файл: '+e.message);}};
  r.readAsText(files[0]);
});
$('#e-reset').onclick=()=>{
  if(!confirm('Вернуть исходные данные из data.js? Все правки в браузере пропадут.'))return;
  localStorage.removeItem(T.STORE_KEY);
  T.loadData(T.DEFAULT_DATA); sel=null;
  T.rebuild(false); renderSite(); renderBranches(); renderList(); renderForm(); T.fit();
  say('Возвращены исходные данные');
};

/* ------------------------------ перетаскивание звёзд ------------------------------ */
window.EDIT={
  pointerdown(e){
    if(mode!=='edit')return false;
    const petEl=e.target.closest&&e.target.closest('.petnode');
    if(petEl){
      const p=T.pets.find(x=>x.id===petEl.dataset.pet); if(!p)return false;
      const w=T.screenToWorld(e.clientX,e.clientY);
      nd={p,ox:p.x-w.x,oy:p.y-w.y,sx:e.clientX,sy:e.clientY,moved:0,isPet:true};
      document.body.classList.add('e-drag');
      return true;
    }
    const el=e.target.closest&&e.target.closest('.node'); if(!el)return false;
    const p=T.byId[el.dataset.id]; if(!p)return false;
    const w=T.screenToWorld(e.clientX,e.clientY);
    nd={p,ox:p.x-w.x,oy:p.y-w.y,sx:e.clientX,sy:e.clientY,moved:0};
    document.body.classList.add('e-drag');
    return true;
  },
  pointermove(e){
    if(!nd)return false;
    const w=T.screenToWorld(e.clientX,e.clientY);
    nd.p.x=Math.round(w.x+nd.ox); nd.p.y=Math.round(w.y+nd.oy);
    nd.moved=Math.max(nd.moved,Math.abs(e.clientX-nd.sx)+Math.abs(e.clientY-nd.sy));
    if(nd.p.el){nd.p.el.style.left=nd.p.x+'px';nd.p.el.style.top=nd.p.y+'px';}
    /* при перетаскивании перерисовываем только линии и области,
       а не весь список звёзд — иначе каждый кадр пересоздаётся DOM */
    if(!rafId) rafId=requestAnimationFrame(()=>{rafId=null;T.redrawLight();});
    return true;
  },
  pointerup(){
    if(!nd)return false;
    const p=nd.p, click=nd.moved<5, isPet=nd.isPet; nd=null;
    document.body.classList.remove('e-drag');
    if(isPet) p.manualPos=!click;
    T.rebuild(false);
    if(isPet){
      selectPet(p.id);
      if(!click){touch(false);say(`${p.name}: ${Math.round(p.x)}, ${Math.round(p.y)}`);}
    }else{
      select(p.id);
      if(!click){touch(false);say(`${p.name.split(' ')[0]}: ${Math.round(p.x)}, ${Math.round(p.y)}`);}
    }
    return true;
  },
  pick(id){if(mode!=='edit')return false;select(id);return true;},
  pickPet(id){if(mode!=='edit')return false;selectPet(id);return true;},
  afterGalleryRender(){
    const edit=document.getElementById('galedit');
    if(edit)edit.hidden=mode!=='edit';
    if(mode==='edit')wireGalleryEditor();
  },
  afterRebuild(){highlight();}
};

/* ------------------------------ старт ------------------------------ */
renderSite(); renderBranches(); renderPets(); renderList(); renderForm(); updStatus();
say(CAN_FS?'Редактор включён. Нажмите «Подключить data.js», чтобы правки сохранялись прямо в файл'
          :'Редактор включён. Сохранение — кнопкой «Скачать data.js»');
})();
