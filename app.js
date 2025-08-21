// ------- Helpers -------
const $ = (sel) => document.querySelector(sel);
const mapFrame = $('#mapFrame');
const locationInput = $('#locationInput');
const searchForm = $('#searchForm');
const historyList = $('#historyList');
const clearHistoryBtn = $('#clearHistoryBtn');
const modeToggle = $('#modeToggle');

const STORAGE_KEYS = { HISTORY: 'map_history_v4', THEME: 'map_theme_v4' };
const MAX_HISTORY = 20;
const DEFAULT_QUERY = 'USA';
let currentQuery = DEFAULT_QUERY;

// ------- Map -------
function encodeQ(q){return encodeURIComponent(q.trim());}
function buildMapSrc(query){return `https://www.google.com/maps?output=embed&q=${encodeQ(query||DEFAULT_QUERY)}`;}
function setMapLocation(query,{pushToHistory=true}={}) {
  mapFrame.src = buildMapSrc(query);
  currentQuery = query;
  pushToHistory ? addToHistory(query) : renderHistory();
}

// ------- History -------
function loadHistory(){try{return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)||'[]');}catch{return[];}}
function saveHistory(list){localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0,MAX_HISTORY)));}
function renderHistory(){
  const items=loadHistory(); historyList.innerHTML='';
  items.forEach((text,idx)=>{
    const li=document.createElement('li');
    li.className='history-item';
    if(text.toLowerCase()===currentQuery.toLowerCase()) li.classList.add('current');
    li.title=text;

    const label=document.createElement('span'); label.className='label'; label.textContent=text;
    const del=document.createElement('button'); del.className='delete-item'; del.type='button'; del.textContent='×'; del.setAttribute('aria-label',`Delete ${text}`);

    li.appendChild(label); li.appendChild(del);

    label.addEventListener('click',()=>setMapLocation(text,{pushToHistory:false}));
    del.addEventListener('click',(e)=>{e.stopPropagation(); saveHistory(items.filter((_,i)=>i!==idx)); renderHistory();});
    historyList.appendChild(li);
  });
  const currentEl = historyList.querySelector('.history-item.current');
  if(currentEl) currentEl.scrollIntoView({behavior:'smooth', inline:'center'});
}
function addToHistory(query){let q=query.trim(); if(!q) return; let items=loadHistory(); items=[q,...items.filter(i=>i.toLowerCase()!==q.toLowerCase())]; saveHistory(items); renderHistory();}
function clearHistory(){localStorage.setItem(STORAGE_KEYS.HISTORY,'[]'); renderHistory();}

// ------- Theme -------
function applyTheme(theme){document.body.classList.toggle('dark-mode',theme==='dark'); modeToggle.textContent = theme==='dark'?'🌞':'🌗';}
function loadTheme(){return localStorage.getItem(STORAGE_KEYS.THEME)||'light';}
function setTheme(theme){localStorage.setItem(STORAGE_KEYS.THEME,theme); applyTheme(theme);}

// ------- Events -------
searchForm.addEventListener('submit',(e)=>{e.preventDefault(); setMapLocation(locationInput.value,{pushToHistory:true}); locationInput.blur();});
clearHistoryBtn.addEventListener('click',()=>clearHistory());
modeToggle.addEventListener('click',()=>setTheme(loadTheme()==='dark'?'light':'dark'));

// ------- Mobile swipe for history panel -------
(function mobileSwipe(){
  if(window.innerWidth>900) return;
  const panel=document.querySelector('.history-panel');
  let startY=0, isExpanded=false;
  panel.addEventListener('touchstart',(e)=>{startY=e.touches[0].clientY;});
  panel.addEventListener('touchmove',(e)=>{
    const deltaY=e.touches[0].clientY-startY;
    if(deltaY<-20 && !isExpanded){panel.classList.add('expanded'); isExpanded=true;}
    if(deltaY>20 && isExpanded){panel.classList.remove('expanded'); isExpanded=false;}
  });
})();

// ------- Init -------
(function init(){applyTheme(loadTheme()); setMapLocation(DEFAULT_QUERY,{pushToHistory:false}); renderHistory(); locationInput.value='';})();
