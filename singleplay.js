/* ===== MERGED TOPIC BANK + SELECT TOPIC PICKER ===== */
/* MediSurg — SS1–SS3 topic bank (clean names only). */
(function(global){
"use strict";
const TOPIC_BANK = window.MediSurgCurriculum.TOPIC_BANK;
function flat(subject){
  const g=TOPIC_BANK[subject];
  if(!g)return [];
  const out=[];
  Object.keys(g).sort((a,b)=>Number(a)-Number(b)).forEach(level=>(g[level]||[]).forEach(t=>{if(!out.includes(t))out.push(t)}));
  return out;
}
function grouped(subject){
  const g=TOPIC_BANK[subject]||{};
  const out={};
  Object.keys(g).sort((a,b)=>Number(a)-Number(b)).forEach(level=>out[level]=(g[level]||[]).slice());
  return out;
}
function allSubjects(){ return window.MediSurgCurriculum.allCourses(); }
function sanitizeKey(name){
  return String(name||'').replace(/[.#$\[\]\/]/g,'_').slice(0,90);
}
function isAllSelected(subject, selectedArr){
  const all = flat(subject);
  if(!all.length) return true;
  if(!selectedArr || !selectedArr.length) return true;
  if(selectedArr.length >= all.length) return true;
  return false;
}
function normalizeList(subject, selectedArr){
  const all = flat(subject);
  if(!selectedArr || !selectedArr.length) return all.slice();
  const allow = new Set(selectedArr.map(s=>String(s)));
  const picked = all.filter(t=>allow.has(t));
  return picked.length ? picked : all.slice();
}
function packMap(mapOfSets){
  const out = {};
  Object.keys(mapOfSets||{}).forEach(sub=>{
    const arr = mapOfSets[sub];
    const list = Array.isArray(arr) ? arr : Array.from(arr||[]);
    out[sub] = normalizeList(sub, list);
  });
  return out;
}
function fingerprint(subjects, topicsMap){
  const subs = (subjects||[]).slice().sort();
  const parts = [];
  for(const s of subs){
    if(isAllSelected(s, topicsMap && topicsMap[s])) parts.push(s+':*');
    else parts.push(s+':'+(topicsMap[s]||[]).slice().sort().join('|'));
  }
  return parts.join('||');
}
function displayable(topicsMap, max){
  max = max==null ? 5 : max;
  const names = [];
  Object.keys(topicsMap||{}).forEach(sub=>{
    (topicsMap[sub]||[]).forEach(t=>names.push(t));
  });
  if(!names.length || names.length>max) return [];
  return names;
}
global.ESITopics = {
  BANK: TOPIC_BANK,
  flat, grouped, allSubjects, sanitizeKey,
  isAllSelected, normalizeList, packMap, fingerprint, displayable
};
})(window);

/* MediSurg — shared Select Topic sheet
   Used by quiz1.html (single player) and quiz.html (every multiplayer mode).
*/
(function(global){
  'use strict';
  const RECENT_KEY = 'esi_recent_topics_v1';
  const MAX_RECENT = 12;

  function $(id){ return document.getElementById(id); }
  function loadRecent(){
    try{ return JSON.parse(localStorage.getItem(RECENT_KEY)||'{}')||{}; }
    catch(e){ return {}; }
  }
  function saveRecent(map){
    try{ localStorage.setItem(RECENT_KEY, JSON.stringify(map)); }catch(e){}
  }
  function remember(subject, topics){
    if(!subject || !topics || !topics.length) return;
    const all = ESITopics.flat(subject);
    if(topics.length >= all.length) return; // default-all is not a "recent pick"
    const rec = loadRecent();
    const prev = rec[subject]||[];
    const merged = topics.concat(prev.filter(t=>!topics.includes(t)));
    rec[subject] = merged.slice(0, MAX_RECENT);
    saveRecent(rec);
  }
  function recentFor(subject){ return (loadRecent()[subject]||[]).slice(); }

  function ensureDom(){
    if($('esiTopicSheet')) return;
    const style = document.createElement('style');
    style.textContent = `
      #esiTopicSheet{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;z-index:8000;color-scheme:dark;align-items:flex-end;justify-content:center}
      #esiTopicSheet.show{display:flex}
      .esi-topic-card{width:100%;max-width:520px;max-height:88vh;background:#07111f;border:1px solid #1e4080;border-radius:16px 16px 0 0;padding:12px 12px 16px;display:flex;flex-direction:column;color:#e6eeff}
      .esi-topic-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
      .esi-topic-head h3{margin:0;font-size:14px;font-weight:800;letter-spacing:.02em;color:#ffd700}
      .esi-topic-head .esi-x{border:0;background:transparent;color:#ff4757;font-size:20px;cursor:pointer;line-height:1}
      .esi-topic-search{width:100%;padding:11px 12px;border-radius:10px;border:1px solid #1e4080;background:#0b1220;color:#e6eeff;font-size:13px;outline:none;margin-bottom:8px}
      .esi-topic-tools{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
      .esi-selectall{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;cursor:pointer}
      .esi-selectall input{width:16px;height:16px}
      .esi-topic-count{font-size:11px;color:var(--accent,#ffd700);font-weight:700}
      .esi-topic-hint{font-size:10px;color:var(--muted,#8ea0c8);margin:0 0 8px;line-height:1.35}
      .esi-reset-all{border:0;background:transparent;color:var(--info,#00bfff);font-size:11px;font-weight:800;cursor:pointer;padding:0}
      .esi-topic-scroll{overflow:auto;flex:1;min-height:180px;padding-right:2px}
      .esi-sec{margin:10px 0 6px;font-size:11px;font-weight:800;color:#ffd700;letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between}
      .esi-row{display:flex;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid #1a2a4a;font-size:12.5px;cursor:pointer;color:#e6eeff}
      .esi-row input{width:16px;height:16px;flex-shrink:0}
      .esi-row.on{background:rgba(255,215,0,.12)}
      .esi-recent-wrap{margin-bottom:6px}
      .esi-actions{display:flex;gap:8px;margin-top:10px}
      .esi-actions button{flex:1;padding:11px;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer}
      .esi-btn-cancel{background:transparent;border:1px solid #1e4080;color:#e6eeff}
      .esi-btn-done{background:#ffd700;border:0;color:#111}
      .esi-clear-recent{border:0;background:transparent;color:#7ec8ff;font-size:10px;font-weight:800;cursor:pointer}
      .esi-topic-btn{width:100%;margin-top:6px;padding:9px 10px;border-radius:10px;border:1px solid #1e4080;background:#0f172a;color:#e6eeff;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer;font-size:11.5px}
      .esi-topic-btn b{color:var(--accent,#ffd700);font-size:10.5px}
      .esi-topic-stack{display:flex;flex-direction:column;gap:4px;margin-top:6px}
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'esiTopicSheet';
    wrap.innerHTML = `
      <div class="esi-topic-card" onclick="event.stopPropagation()">
        <div class="esi-topic-head">
          <h3 id="esiTopicTitle">Select Topic</h3>
          <button type="button" class="esi-x" id="esiTopicClose">×</button>
        </div>
        <div class="esi-topic-hint">Saved picks stay ticked. Tick more or fewer any time — nothing is locked.</div>
        <input id="esiTopicSearch" class="esi-topic-search" placeholder="Search topics (e.g. 100 level, heart, cell…)" autocomplete="off">
        <div class="esi-topic-tools">
          <label class="esi-selectall"><input type="checkbox" id="esiTopicSelectAll"> Select All</label>
          <button type="button" class="esi-reset-all" id="esiTopicReset">Reset all</button>
          <span class="esi-topic-count" id="esiTopicCount"></span>
        </div>
        <div class="esi-topic-scroll" id="esiTopicList"></div>
        <div class="esi-actions">
          <button type="button" class="esi-btn-cancel" id="esiTopicCancel">Cancel</button>
          <button type="button" class="esi-btn-done" id="esiTopicDone">DONE(0)</button>
        </div>
      </div>`;
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) cancel(); });
    document.body.appendChild(wrap);

    $('esiTopicClose').onclick = cancel;
    $('esiTopicCancel').onclick = cancel;
    $('esiTopicDone').onclick = apply;
    $('esiTopicSelectAll').onchange = function(){
      const on = this.checked;
      Object.keys(state.working).forEach(t=>{ state.working[t] = on; });
      renderList();
    };
    $('esiTopicReset').onclick = function(){
      ESITopics.flat(state.subject).forEach(t=>{ state.working[t]=true; });
      renderList();
    };
    $('esiTopicSearch').addEventListener('input', renderList);
  }

  const state = {
    subject: null,
    working: {},
    snapshot: {},
    onApply: null
  };

  function allOn(){
    const keys = Object.keys(state.working);
    return keys.length>0 && keys.every(k=>state.working[k]);
  }
  function selectedNames(){
    return Object.keys(state.working).filter(k=>state.working[k]);
  }
  function matchesQuery(topic, q){
    if(!q) return true;
    const t = topic.toLowerCase();
    if(t.startsWith(q) || t.includes(q)) return true;
    const compact = t.replace(/[^a-z0-9]/g,'');
    const q2 = q.replace(/[^a-z0-9]/g,'');
    return !!(q2 && compact.includes(q2));
  }

  function renderList(){
    const rawQ = ($('esiTopicSearch').value||'').trim();
    const q = rawQ.toLowerCase();
    const group = ESITopics.grouped(state.subject);
    const recent = recentFor(state.subject).filter(t=>state.working[t]!=null);
    const selectedFirst = (arr)=>arr.slice().sort((a,b)=>{
      const as = state.working[a]?0:1, bs = state.working[b]?0:1;
      if(as!==bs) return as-bs;
      return a.localeCompare(b);
    });

    let html = '';
    const bands=Object.keys(group).sort((a,b)=>Number(a)-Number(b));
    const bandHint=bands.some(b=>q===b||q===b+" level"||q===b+"level");

    if(recent.length && !bandHint){
      const recShow = selectedFirst(recent).filter(t=>matchesQuery(t,q));
      if(recShow.length){
        html += `<div class="esi-sec">Recently Selected <button type="button" class="esi-clear-recent" id="esiClearRecent">Clear</button></div><div class="esi-recent-wrap">`;
        recShow.forEach(t=>{
          html += rowHtml(t);
        });
        html += `</div>`;
      }
    }
    bands.forEach(band=>{
      if(bandHint && q!==band.toLowerCase() && q!==(band.toLowerCase()+" level") && q!==(band.toLowerCase()+"level")) return;
      let items=group[band]||[];
      items=selectedFirst(items).filter(t=>bandHint||matchesQuery(t,q));
      if(!items.length)return;
      html += `<div class="esi-sec">${band} LEVEL</div>`;
      items.forEach(t=>{html += rowHtml(t);});
    });
    if(!html) html = '<div class="esi-sec">No topic matches that search</div>';
    $('esiTopicList').innerHTML = html;
    $('esiTopicList').querySelectorAll('.esi-row').forEach(row=>{
      row.onclick = ()=>{
        const t = row.getAttribute('data-t');
        state.working[t] = !state.working[t];
        renderList();
      };
    });
    const clearBtn = $('esiClearRecent');
    if(clearBtn){
      clearBtn.onclick = function(ev){
        ev.stopPropagation();
        if(!confirm('Clear recently selected topics for this subject?')) return;
        const rec = loadRecent();
        delete rec[state.subject];
        saveRecent(rec);
        renderList();
      };
    }
    const n = selectedNames().length;
    const tot = Object.keys(state.working).length;
    $('esiTopicCount').textContent = n+' / '+tot+' topics';
    $('esiTopicSelectAll').checked = allOn();
    const doneBtn = $('esiTopicDone');
    if(doneBtn) doneBtn.textContent = 'DONE('+n+')';
  }

  function rowHtml(t){
    const on = !!state.working[t];
    return `<div class="esi-row${on?' on':''}" data-t="${escapeAttr(t)}"><input type="checkbox" ${on?'checked':''} onclick="event.stopPropagation()"><span>${escapeHtml(t)}</span></div>`;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function escapeAttr(s){ return escapeHtml(s); }

  function open(opts){
    ensureDom();
    const subject = opts.subject;
    const chosen = opts.selected || ESITopics.flat(subject);
    state.subject = subject;
    state.onApply = opts.onApply || null;
    state.working = {};
    ESITopics.flat(subject).forEach(t=>{ state.working[t] = chosen.includes(t); });
    if(!Object.keys(state.working).length){
      ESITopics.flat(subject).forEach(t=>{ state.working[t] = true; });
    }
    state.snapshot = Object.assign({}, state.working);
    $('esiTopicTitle').textContent = 'Select Topic · '+subject;
    $('esiTopicSearch').value = '';
    $('esiTopicSheet').classList.add('show');
    renderList();
    setTimeout(()=>{ try{ $('esiTopicSearch').focus(); }catch(e){} }, 50);
  }

  function cancel(){
    state.working = Object.assign({}, state.snapshot);
    $('esiTopicSheet').classList.remove('show');
  }
  function apply(){
    let picked = selectedNames();
    if(!picked.length){
      // never allow empty — fall back to all
      picked = ESITopics.flat(state.subject);
    }
    remember(state.subject, picked);
    $('esiTopicSheet').classList.remove('show');
    if(typeof state.onApply==='function') state.onApply(state.subject, picked);
  }

  function defaultAll(subject){
    return ESITopics.flat(subject).slice();
  }

  function renderButtons(container, subjects, getMap, openFor){
    if(!container) return;
    const list = Array.from(subjects||[]);
    if(!list.length){ container.innerHTML=''; return; }

    function currentFor(sub){
      const all = ESITopics.flat(sub);
      const cur = (getMap()[sub] && getMap()[sub].length) ? getMap()[sub] : all;
      return { all, cur };
    }
    function summary(sub){
      const {all,cur}=currentFor(sub);
      const n=cur.length;
      return n>=all.length ? 'All topics' : ('DONE('+n+')');
    }

    container.innerHTML = list.map(sub=>{
      const {all,cur}=currentFor(sub);
      const n=cur.length;
      const right = n>=all.length ? 'All topics' : (n+' selected');
      return `<div class="esi-topic-dd" data-sub="${escapeAttr(sub)}" style="position:relative;margin:0 0 6px;width:100%">
        <div class="esi-topic-dd-btn" style="width:100%;padding:12px;background:var(--card2,#0f172a);border:1.5px solid var(--border,#1e4080);border-radius:10px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-size:12.5px;color:var(--text,#e6eeff)">
          <span>Select Topic · ${escapeHtml(sub)}</span>
          <span style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <b style="color:var(--accent,#ffd700);font-size:11px">${right}</b>
            <span class="esi-topic-dd-arrow" style="color:var(--accent,#ffd700);font-size:10px">▾</span>
          </span>
        </div>
        <div class="esi-topic-dd-panel" style="display:none;margin-top:4px;background:var(--card2,#0f172a);border:1.5px solid var(--border,#1e4080);border-radius:10px;max-height:280px;overflow:auto;padding:8px;box-shadow:0 10px 24px rgba(0,0,0,.4);color:var(--text,#e6eeff)"></div>
      </div>`;
    }).join('');

    function paintPanel(root, sub){
      const panel = root.querySelector('.esi-topic-dd-panel');
      const all = ESITopics.flat(sub);
      const map = getMap();
      if(!Object.prototype.hasOwnProperty.call(map, sub) || map[sub]==null) map[sub] = all.slice();
      const selected = new Set(map[sub]);
      const group = ESITopics.grouped(sub);
      const recent = recentFor(sub).filter(t=>all.includes(t));
      const q = ((panel.dataset.q)||'').toLowerCase();
      const matches = (t)=> !q || t.toLowerCase().includes(q) || t.toLowerCase().startsWith(q);
      const selectedFirst = (arr)=>arr.slice().sort((a,b)=>{
        const as=selected.has(a)?0:1, bs=selected.has(b)?0:1;
        if(as!==bs) return as-bs;
        return a.localeCompare(b);
      });
      function row(t){
        const on = selected.has(t);
        return `<label class="subj-dd-item" data-t="${escapeAttr(t)}" style="display:flex;align-items:center;gap:9px;padding:9px 8px;font-size:12px;color:var(--text,#e6eeff);cursor:pointer;border-bottom:1px solid var(--border2,#1a2a4a);${on?'background:rgba(255,215,0,.12)':''}"><input type="checkbox" ${on?'checked':''} style="width:16px;height:16px;flex-shrink:0;accent-color:#ffd700"> ${escapeHtml(t)}</label>`;
      }
      let html = '';
      html += `<input class="esi-dd-search" type="search" placeholder="Search topics" value="${escapeAttr(panel.dataset.q||'')}" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border,#1e4080);background:var(--bg,#020818);color:var(--text,#e6eeff);font-size:12px;margin-bottom:8px">`;
      html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;cursor:pointer"><input type="checkbox" class="esi-dd-all" ${selected.size>=all.length?'checked':''} style="width:16px;height:16px;accent-color:#ffd700"> Select All</label>
        <span style="font-size:11px;color:var(--accent,#ffd700);font-weight:700">${selected.size} / ${all.length}</span>
        <button type="button" class="esi-dd-done" style="padding:7px 12px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;background:#ffd700;border:0;color:#111">DONE(${selected.size})</button>
      </div>`;
      if(recent.length){
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 4px;font-size:11px;font-weight:800;color:var(--accent,#ffd700)">Recently Selected <button type="button" class="esi-dd-clear" style="border:0;background:transparent;color:#7ec8ff;font-size:10px;font-weight:800;cursor:pointer">Clear</button></div>`;
        selectedFirst(recent).filter(matches).forEach(t=>{ html += row(t); });
      }
      ['SS1','SS2','SS3'].forEach(band=>{
        const items = (group[band]||[]).filter(t=>matches(t));
        if(!items.length) return;
        html += `<div style="margin:10px 0 4px;font-size:11px;font-weight:800;color:var(--accent,#ffd700)">${band}</div>`;
        items.forEach(t=>{ html += row(t); });
      });
      html += `<div style="display:flex;gap:8px;margin-top:10px">
        <button type="button" class="esi-dd-cancel" style="flex:1;padding:11px;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;background:transparent;border:1px solid var(--border,#1e4080);color:var(--text,#e6eeff)">Cancel</button>
        <button type="button" class="esi-dd-done" style="flex:1;padding:11px;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;background:#ffd700;border:0;color:#111">DONE(${selected.size})</button>
      </div>`;
      panel.innerHTML = html;

      panel.querySelector('.esi-dd-search').oninput = function(){
        panel.dataset.q = this.value||'';
        paintPanel(root, sub);
        const again = root.querySelector('.esi-dd-search');
        if(again){ again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      };
      panel.querySelector('.esi-dd-all').onchange = function(){
        map[sub] = this.checked ? all.slice() : [];
        paintPanel(root, sub);
      };
      const clr = panel.querySelector('.esi-dd-clear');
      if(clr) clr.onclick = function(ev){
        ev.preventDefault(); ev.stopPropagation();
        if(!confirm('Clear recently selected topics for this subject?')) return;
        const rec = loadRecent();
        delete rec[sub];
        saveRecent(rec);
        paintPanel(root, sub);
      };
      panel.querySelectorAll('.subj-dd-item').forEach(lab=>{
        lab.onclick = function(ev){
          ev.preventDefault();
          const t = this.getAttribute('data-t');
          const set = new Set(map[sub]||[]);
          if(set.has(t)) set.delete(t); else set.add(t);
          map[sub] = Array.from(set);
          paintPanel(root, sub);
        };
      });
      panel.querySelector('.esi-dd-cancel').onclick = function(ev){
        ev.preventDefault(); ev.stopPropagation();
        panel.style.display = 'none';
        root.querySelector('.esi-topic-dd-arrow').textContent = '▾';
      };
      function commitDone(ev){
        ev.preventDefault(); ev.stopPropagation();
        let picked = (map[sub]||[]).slice();
        if(!picked.length) picked = all.slice();
        map[sub] = picked;
        remember(sub, picked);
        if(typeof openFor==='function') openFor(sub, picked);
        panel.style.display = 'none';
        root.querySelector('.esi-topic-dd-arrow').textContent = '▾';
        const b = root.querySelector('.esi-topic-dd-btn b');
        if(b) b.textContent = picked.length>=all.length ? 'All topics' : (picked.length+' selected');
      }
      panel.querySelectorAll('.esi-dd-done').forEach(btn=>{ btn.onclick = commitDone; });
    }

    container.querySelectorAll('.esi-topic-dd').forEach(root=>{
      const sub = root.getAttribute('data-sub');
      const btn = root.querySelector('.esi-topic-dd-btn');
      const panel = root.querySelector('.esi-topic-dd-panel');
      const arrow = root.querySelector('.esi-topic-dd-arrow');
      btn.onclick = function(ev){
        ev.preventDefault(); ev.stopPropagation();
        const willOpen = panel.style.display==='none' || !panel.style.display;
        container.querySelectorAll('.esi-topic-dd-panel').forEach(p=>p.style.display='none');
        container.querySelectorAll('.esi-topic-dd-arrow').forEach(a=>a.textContent='▾');
        if(willOpen){
          paintPanel(root, sub);
          panel.style.display = 'block';
          arrow.textContent = '▴';
        }
      };
    });
  }
  global.ESITopicPicker = {
    open, cancel, apply, renderButtons, recentFor, defaultAll, remember, ensureDom
  };
})(window);

/* ================================================================
   MEDISURG — singleplay.js
   All Firebase config/API keys and app logic previously inline in
   quiz1.html now live here instead — the same split already made for
   quiz.html -> multiplayer.js.
   NOTE ON API KEYS: Firebase *client* web API keys are not secret by
   design — they identify the project, they don't grant access by
   themselves. The database rules are what actually protect data (see
   firebase-rules-leaderboard.json). Moving them here is good
   organization, not a security fix by itself — real protection was,
   and remains, the rules file.
   ================================================================ */

// ===== GLOBAL DATA STORE — Firebase Realtime Database (public, shared across everyone) =====
const firebaseConfig = window.MEDISURG_FIREBASE_CONFIG;
// Keep the leaderboard database and auth on a named app so the shared MediSurg
// account layer can link the same Google identity into this project safely.
const soloApp = firebase.apps.find(app => app.name === 'medisurg') || firebase.initializeApp(firebaseConfig, 'medisurg');
const db = soloApp.database();
const auth = soloApp.auth();
// Every leaderboard write is keyed by this uid (never by a client-invented id) so
// firebase-rules-leaderboard.json can actually verify "you may only touch your own
// entry." Anonymous sign-in is invisible to the player — no login screen, same as before.
let myUid = null;
auth.onAuthStateChanged(user=>{
    if(user){
        myUid = user.uid;
        // HaniLearn-style identity recovery: the authenticated UID is the
        // durable profile key. A fresh browser/WebView may have no localStorage,
        // so recover the existing leaderboard name from the UID-owned row.
        if (!user.isAnonymous) {
            restoreLeaderboardIdentity(user).catch(error =>
                console.warn('[Leaderboard] profile restore unavailable:', error && error.message)
            );
        }
        return;
    }
    myUid = null;
    auth.signInAnonymously().catch(e=>{
        let code = e && e.code ? e.code : 'unknown';
        let msg = 'Sign-in failed: ' + code + (e && e.message ? (' — ' + e.message) : '');
        console.error('[Auth]', msg);
        try{ if(typeof toast==='function') toast(msg); }catch(_){}
    });
});
const FB_CACHE='medisurg_fb_cache_v1_';
let fbHealthy=true;

    async function kvGet(k){
        try{
            let snap = await db.ref(k).get();
            let v = snap.exists() ? snap.val() : null;
            try{localStorage.setItem(FB_CACHE+k, JSON.stringify(v));}catch(e){}
            fbHealthy=true;
            return v;
        }catch(e){
            console.warn('[DB] read failed for "'+k+'", using local cache:', e && e.message);
            fbHealthy=false;
            try{let c=localStorage.getItem(FB_CACHE+k); return c?JSON.parse(c):null;}catch(e2){return null;}
        }
    }
    async function kvSet(k,v){
        try{
            await db.ref(k).set(v);
            try{localStorage.setItem(FB_CACHE+k, JSON.stringify(v));}catch(e){}
            fbHealthy=true;
            return true;
        }catch(e){
            console.warn('[DB] write failed for "'+k+'":', e && e.message);
            fbHealthy=false;
            try{localStorage.setItem(FB_CACHE+k, JSON.stringify(v));}catch(e2){}
            return false;
        }
    }
    async function kvDel(k){
        try{
            await db.ref(k).remove();
            try{localStorage.removeItem(FB_CACHE+k);}catch(e){}
            return true;
        }catch(e){
            console.warn('[DB] delete failed for "'+k+'":', e && e.message);
            return false;
        }
    }

    // ===== QUESTION BANK Firebase — a SEPARATE project from the leaderboard above.
    // `db` (leaderboard project) never stores questions. `qbDb` (this project) never
    // stores leaderboard/user data. They are two independent Firebase apps on purpose.
    const qbApp = soloApp;
    const qbDb = db;

    // Reads every stored question for one Subject -> Thinking Depth -> Difficulty
    // combo. Always resolves to an object ({} on any failure) so the caller can
    // simply fall through to Puter generation instead of needing its own try/catch.
    async function qbGetBank(subject, subMode, diff){
        let path = `medisurg/elite_subject_database/${subject}/${subMode}/${diff}/question_bank`;
        let merged = {};
        try{
            let snap = await qbDb.ref(path).get();
            if(snap.exists()) merged = snap.val()||{};
        }catch(e){
            console.warn('[QuestionBank] read failed for "'+path+'":', e && e.message);
        }
        try{
            if(window.ESITopics && !ESITopics.isAllSelected(subject, selTopics[subject])){
                const picks = topicsFor(subject).slice(0, 40);
                for(const topic of picks){
                    let tPath = `medisurg/elite_subject_database/${subject}/${subMode}/${diff}/topic/${ESITopics.sanitizeKey(topic)}/question_bank`;
                    let ts = await qbDb.ref(tPath).get();
                    if(ts.exists()) Object.assign(merged, ts.val()||{});
                }
            }
        }catch(e){}
        return merged;
    }

    // Writes newly Puter-generated questions back under their hash key so the shared
    // pool grows for every future user of this subject/depth/difficulty combo. Keyed
    // by hash (never a plain array) so two people saving at the same moment can never
    // clobber each other's questions. Deliberately fire-and-forget: a failed save must
    // never stop the person currently playing from getting their quiz.
    function qbSaveQuestions(subject, subMode, diff, questions){
        if(!questions || !questions.length) return;
        let path = `medisurg/elite_subject_database/${subject}/${subMode}/${diff}/question_bank`;
        let updates = {};
        questions.forEach(q=>{
            if(!q || !q.q || !Array.isArray(q.options)) return;
            updates[hashQ(q.q)] = {subject:subject, topic:q.topic||'', q:q.q, options:q.options, answer:q.answer, explanation:q.explanation};
        });
        if(!Object.keys(updates).length) return;
        qbDb.ref(path).update(updates).catch(e=>console.warn('[QuestionBank] save failed for "'+path+'":', e && e.message));
        questions.forEach(q=>{
            if(!q || !q.q || !q.topic || !window.ESITopics) return;
            let tPath = `medisurg/elite_subject_database/${subject}/${subMode}/${diff}/topic/${ESITopics.sanitizeKey(q.topic)}/question_bank`;
            let one = {};
            one[hashQ(q.q)] = {subject:subject, topic:q.topic, q:q.q, options:q.options, answer:q.answer, explanation:q.explanation};
            qbDb.ref(tPath).update(one).catch(()=>{});
        });
    }
// ===== CORE HELPERS =====
const $=id=>document.getElementById(id);
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='c'||e.key==='x'||e.key==='u'))e.preventDefault();});

const ALL=window.MediSurgCurriculum.allCourses();
let sel=new Set(), Q=[], i=0, ans=[], flg=new Set(), sc=0, t=null, left=0, mode='spak', subMode='standard', timedOut=new Set();
let selTopics={};
function topicsFor(subject){
    if(window.ESITopics) return ESITopics.normalizeList(subject, selTopics[subject]);
    return (TOPICS[subject]||[]).slice();
}
function ensureSubjectTopics(subject){
    if(!selTopics[subject] || !selTopics[subject].length){
        selTopics[subject] = window.ESITopics ? ESITopics.flat(subject) : (TOPICS[subject]||[]).slice();
    }
}
function dropSubjectTopics(subject){ delete selTopics[subject]; }
function packedSelTopics(){
    const out={};
    sel.forEach(s=>{ out[s]=topicsFor(s); });
    return out;
}
function renderTopicButtons(){
    if(!window.ESITopicPicker) return;
    let wrap=document.getElementById('topicPickWrap');
    if(!wrap){
        const mini=document.getElementById('mini');
        if(!mini || !mini.parentNode) return;
        wrap=document.createElement('div');
        wrap.id='topicPickWrap';
        wrap.className='esi-topic-stack';
        mini.parentNode.insertBefore(wrap, mini.nextSibling);
    }
    ESITopicPicker.renderButtons(wrap, [...sel], ()=>selTopics, function(sub, picked){
        ensureSubjectTopics(sub);
        if(picked){ selTopics[sub]=picked.slice(); topicRotation[sub]=null; }
    });
}
let sessionSpeedLogs=[];
let IS_REDO=false;
let curDiff='Hard';         // difficulty picked for the CURRENT session — set in gen(), read by end()/Share Result
let lastSoloResult=null;    // snapshot taken by end() for the Share Result card
const LB_PATH='medisurg/leaderboard';         // leaderboard/{month}/{uid} — one entry per verified uid, see firebase-rules-leaderboard.json
const LB_NAMES='medisurg/leaderboard_names';  // leaderboard_names/{name} -> {uid,name} — global display-name reservation
const LB_USER='elite_lb_user_v55';
const STORE_KEY='elite_store_v55';
const FLAG_KEY='elite_flagged_v55';
const SEEN_KEY='elite_seen_qs_v55';
const QS_KEY_PREFIX='elite_qs_history_v55_';
const CACHE_PREFIX='elite_q_cache_v55_';
const ACTIVE_KEY='elite_active_session_v55';

function curMonth(){return new Date().toISOString().slice(0,7)}
function prevMonth(){let d=new Date();d.setMonth(d.getMonth()-1);return d.toISOString().slice(0,7)}
const getStore=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{"spak":[],"speed":[],"free":[]}')}catch{return{spak:[],speed:[],free:[]}}};
const saveStore=s=>localStorage.setItem(STORE_KEY,JSON.stringify(s));
const getFlagged=()=>{try{let v=localStorage.getItem(FLAG_KEY);if(!v)return[];let p=JSON.parse(v);return Array.isArray(p)?p:[]}catch(e){localStorage.removeItem(FLAG_KEY);return[]}};
const saveFlagged=a=>{try{localStorage.setItem(FLAG_KEY,JSON.stringify(a))}catch(e){}};
const getSeen=()=>{try{return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)||'[]'))}catch{return new Set()}};
const saveSeen=set=>localStorage.setItem(SEEN_KEY,JSON.stringify([...set].slice(-3000)));
const hashQ=s=>{let h=0;for(let ci=0;ci<s.length;ci++){h=((h<<5)-h)+s.charCodeAt(ci);h|=0}return h.toString(36)};
let seenHashes=getSeen();
const toast=m=>{let e=$('toast');if(!e)return;e.textContent=m;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',2400)};

// Proper uniform shuffle (Fisher-Yates) applied to every question's options so the
// correct answer lands at a genuinely random index (0-3) instead of clustering at
// index 0 the way a naive AI response or a .sort(Math.random()) shuffle tends to.
// Explanations are built as "The correct answer is <copied option text> because <reason>".
// The lead-in phrase itself stays capitalized (it opens the sentence), but whatever follows
// it is mid-sentence, so its first letter is forced lowercase instead of staying capitalized
// the way a copied option (which is its own standalone sentence) naturally starts.
function normalizeExplanationCasing(q){
    if(!q||!Array.isArray(q.options)||typeof q.answer!=='number') return q;
    let raw=String(q.explanation||'').trim();
    let parts=raw.split(/\bbecause\b/i);
    let justification=(parts.length>1?parts.slice(1).join('because'):raw).trim();
    justification=justification.replace(/^[,.:;\s]+/,'');
    let previous='';
    while(justification && justification!==previous){
      previous=justification;
      justification=justification.replace(/^the\s+correct\s+answer\s+is\s+.+?,\s*because\s*/i,'').trim();
      justification=justification.replace(/^(?:because\s*)+/i,'').trim();
      justification=justification.replace(/^[,.:;\s]+/,'');
    }
    const selectedOption=String(q.options[q.answer]||'').trim().replace(/[.!?]+$/,'');
    const repeatedLead=('the correct answer is '+selectedOption).toLowerCase();
    if(selectedOption && justification.toLowerCase().startsWith(repeatedLead)){
      justification=justification.slice(repeatedLead.length).replace(/^[.!?,:;\s]+/,'').trim();
    }
    if(justification.length<10) justification='this matches the correct principle for this question.';
    let opt=selectedOption.replace(/^([A-Z])/m, m=>m.toLowerCase());
    q.explanation=`The correct answer is ${opt}, because ${justification}`;
    return q;
}

function shuffleOptionsFisherYates(q){
    if(!q||!Array.isArray(q.options)||q.options.length<2)return q;
    let correctText=q.options[q.answer];
    let arr=q.options.slice();
    for(let k=arr.length-1;k>0;k--){
        let j=Math.floor(Math.random()*(k+1));
        [arr[k],arr[j]]=[arr[j],arr[k]];
    }
    q.options=arr;
    let newIdx=q.options.indexOf(correctText);
    q.answer=newIdx!==-1?newIdx:0;
    return q;
}

// ===== THEME =====
function openS(){let th=localStorage.getItem('elite_theme_v7')||'dark';let s=$('themeSel');if(s)s.value=th;$('set').style.display='grid'}
function closeS(){$('set').style.display='none'}
function changeTheme(v){document.documentElement.setAttribute('data-theme',v);localStorage.setItem('elite_theme_v7',v);let mm=document.getElementById('themeMeta');if(mm)mm.setAttribute('content',v==='light'?'#ffffff':'#04142f');}
(function(){let th=localStorage.getItem('elite_theme_v7')||'dark';document.documentElement.setAttribute('data-theme',th)})();

// ===== CALC =====
function toggleCalc(){let c=$('calc');c.style.display=c.style.display==='block'?'none':'block'}
function hideCalc(){$('calc').style.display='none'}

// ===== MODE =====
function setMode(m){
    mode=m;
    document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('on'));
    let ac=$('m_'+m);if(ac)ac.classList.add('on');
    $('perBox').style.display=m==='spak'?'block':'none';
    $('totBox').style.display=m==='speed'?'block':'none';
}
function setSubMode(sm){
    subMode=sm;
    document.querySelectorAll('.submode-chip').forEach(c=>{
        c.classList.remove('active');
        let txt=c.textContent.toLowerCase();
        if(sm==='standard'&&txt.includes('standard'))c.classList.add('active');
        if(sm==='conceptual'&&txt.includes('tricky'))c.classList.add('active');
        if(sm==='numeric'&&txt.includes('heavy'))c.classList.add('active');
        if(sm==='exhaustive'&&txt.includes('extreme'))c.classList.add('active');
    });
    toast('Style: '+sm);
}
function infoMode(m){
    let d={
        spak:"About Spak mode: User manually sets a timer which counts down to zero for each question. After each full count comes the next question based on users applied settings.",
        speed:"About Sprint mode: User manually sets a timer which encompasses all questions at once and automatically submits once timer runs out or when user finishes.",
        free:"About Read Mode: Unbounded data capture model allows multi-layered deep structural analysis without timers. This mode has no effect on the leaders board."
    };
    $('infoT').textContent=m.toUpperCase()+" CONFIG";
    $('infoB').textContent=d[m]||"Custom runtime variation framework.";
    $('info').style.display='grid';
}

// ===== SUBJECT DRAWER =====
function openDrawer(){renderDrawerItems('');$('drawer').style.display='flex'}
function closeDrawer(){$('drawer').style.display='none';upd()}
function renderDrawerItems(f){
    let c=$('subList');if(!c)return;c.innerHTML='';
    ALL.filter(s=>s.toLowerCase().includes((f||'').toLowerCase())).forEach(s=>{
        let d=document.createElement('div');
        d.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:10px 8px;border-bottom:1px solid var(--border2);font-size:11px;cursor:pointer;color:var(--text)';
        if(sel.has(s))d.style.background='var(--card)';
        let check=sel.has(s)?'✓':'+';
        d.textContent=s+' '+check;
        d.onclick=()=>{
            if(sel.has(s)){ sel.delete(s); dropSubjectTopics(s); }
            else { sel.add(s); ensureSubjectTopics(s); }
            renderDrawerItems($('searchSub').value);updMini();
        };
        c.appendChild(d);
    });
    $('count').textContent=sel.size;
}
function filterSubs(){renderDrawerItems($('searchSub').value)}
function updMini(){
    let m=$('mini');if(!m)return;m.innerHTML='';
    sel.forEach(s=>{
        let b=document.createElement('span');b.className='chip-mini';b.textContent=s+' ';
        let ic=document.createElement('i');ic.textContent='×';ic.style.cssText='color:var(--flag);cursor:pointer;margin-left:6px;font-weight:900';
        ic.onclick=(e)=>{e.stopPropagation();sel.delete(s);dropSubjectTopics(s);updMini();upd();};
        b.appendChild(ic);m.appendChild(b);
    });
    $('count').textContent=sel.size;
    renderTopicButtons();
}
function upd(){$('selTxt').textContent=sel.size?[...sel].slice(0,2).join(', ')+(sel.size>2?` +${sel.size-2}`:''):'Choose Subject';}

// ===== NETWORK =====
function netCheck(){
    let on=navigator.onLine;
    let el=$('net');
    if(el){el.style.background=on?'var(--success)':'var(--error)';}
    let badge=$('rtBadge');
    if(badge){badge.textContent=on?'CONNECTED':'DISCONNECTED';}
}
window.addEventListener('online',netCheck);window.addEventListener('offline',netCheck);netCheck();

function cacheKeyFor(subs,diff,count,sm){return CACHE_PREFIX+[...subs].sort().join('|')+'_'+diff+'_'+count+'_'+sm;}

// ===== SESSION PERSISTENCE =====
function saveActiveSession(){
    try{
        let payload={mode,left,i,Q,ans:ans,flg:[...flg],timedOut:[...timedOut],sessionSpeedLogs,quizStart:window.quizStart,expiresAt:Date.now()+(left*1000)+5000,perVal:parseInt($('per').value)||30,totVal:parseInt($('tot').value)||15,qcountVal:Q.length};
        localStorage.setItem(ACTIVE_KEY,JSON.stringify(payload));
    }catch(e){}
}
function clearActiveSession(){localStorage.removeItem(ACTIVE_KEY);}
function tryResumeSession(){
    try{
        let raw=localStorage.getItem(ACTIVE_KEY);if(!raw)return false;
        let s=JSON.parse(raw);if(!s||!s.Q||!s.Q.length)return false;
        if(s.mode!=='free' && Date.now()>s.expiresAt){
            Q=s.Q;ans=s.ans||new Array(Q.length).fill(null);sessionSpeedLogs=s.sessionSpeedLogs||new Array(Q.length).fill(0);
            let total=Q.length;let correct=ans.filter((a,k)=>a===Q[k]?.answer).length;let perc=Math.round(correct/total*100);
            let totalSpent=sessionSpeedLogs.reduce((a,b)=>a+b,0)||Math.floor((Date.now()-s.quizStart)/1000);
            let avgSec=total>0?Math.round(totalSpent/total):0;
            if(avgSec<1)avgSec=1;
            updateGlobalLB(perc,avgSec,total,true);clearActiveSession();toast('Previous session auto-submitted');return false;
        }
        if(!confirm('Resume previous quiz?'+(s.mode==='free'?'':' Timer kept running.'))){clearActiveSession();return false;}
        mode=s.mode;Q=s.Q;ans=s.ans;flg=new Set(s.flg||[]);timedOut=new Set(s.timedOut||[]);sessionSpeedLogs=s.sessionSpeedLogs||[];i=s.i||0;left=s.left;window.quizStart=s.quizStart||Date.now();
        $('setup').style.display='none';$('quiz').style.display='block';$('per').value=s.perVal;$('tot').value=s.totVal;
        setMode(mode);buildPal();draw();if(mode!=='free')startTimer();return true;
    }catch(e){clearActiveSession();return false;}
}
window.addEventListener('load',()=>{setTimeout(()=>{if(!tryResumeSession()){renderHistory();renderFlag();}},300)});

// ===== TOPIC DATABASE =====
const TOPICS = window.MediSurgCurriculum.TOPICS;

// ===== RANDOM TOPIC ROTATION =====
// Per-subject shuffled queue of topics. Each call hands out the next topic(s)
// off the queue instead of dumping the ENTIRE topic bank into the prompt, so
// Puter is told to focus ONLY on a small, explicitly-assigned set of topics
// per batch. A subject's queue only reshuffles and starts over once every one
// of its topics has already been handed out at least once — so back-to-back
// batches/quizzes for the same subject burn through different topics before
// any topic is ever repeated. topicsUsedEver just remembers (for this page
// session) which topics have already been assigned at least once, so the
// prompt can explicitly warn Puter when a topic is being revisited.
let topicRotation = {};
let topicsUsedEver = {};

function shuffleArr(a){
    let arr = a.slice();
    for(let k = arr.length - 1; k > 0; k--){
        let j = Math.floor(Math.random() * (k + 1));
        [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    return arr;
}

function nextTopicsForSubject(subject, howMany){
    let list = topicsFor(subject);
    if(!list || !list.length) return [];
    if(!topicRotation[subject] || !topicRotation[subject].length){
        topicRotation[subject] = shuffleArr(list);
    }
    let picked = [];
    for(let n = 0; n < howMany; n++){
        if(!topicRotation[subject].length){
            topicRotation[subject] = shuffleArr(list);
        }
        picked.push(topicRotation[subject].shift());
    }
    return picked;
}

// Generates exactly `count` new questions for ONE subject via Puter AI, chunked in
// batches of CHUNK_SIZE. Deduped against both this user's full answer history
// (seenHashes) and whatever this same gen() call already took for this subject
// (excludeHashSet), so Firebase-sourced and freshly-generated questions can never
// collide in a single session. Every question returned already carries the
// mandatory "The correct answer is X, because..." explanation format.
async function fetchViaPuter(subject, subMode, diff, count, excludeHashSet){
    const CHUNK_SIZE = 20;
    let avoidHashes = new Set([...seenHashes, ...excludeHashSet]);
    let seenList = [...avoidHashes].slice(-150).join(', ');

    let chunks = [];
    let remaining = count;
    while(remaining > 0){ chunks.push(Math.min(remaining, CHUNK_SIZE)); remaining -= CHUNK_SIZE; }

    let result = [];

    for(let ci=0; ci<chunks.length; ci++){
        let chunkCount = chunks[ci];
        let randomSeed = Math.floor(Math.random()*1000000);
        $('stat').textContent = `[Processing batch... ${subject} batch ${ci+1}/${chunks.length} — gathered ${result.length}/${count}]`;

        // Randomly assign ONE topic per question index off the rotation queue,
        // instead of handing Puter the entire topic bank to wander through.
        let chunkTopics = nextTopicsForSubject(subject, chunkCount);
        let allowedTopics = topicsFor(subject);
        let topicFocus = chunkTopics.length
            ? `USER-SELECTED TOPICS ONLY (do not invent or switch topics): ${allowedTopics.join(' || ')}. Assign EXACTLY one of those topics per question index, in order — ${chunkTopics.map((t,idx)=>`Q${idx+1}=${t}`).join(' | ')}. Each question must stay strictly inside its own assigned topic only, never drifting onto a different one.`
            : `FOCUS: Core ${subject} syllabus.`;
        if(!topicsUsedEver[subject]) topicsUsedEver[subject] = new Set();
        let repeatedTopics = chunkTopics.filter(t => topicsUsedEver[subject].has(t));
        chunkTopics.forEach(t => topicsUsedEver[subject].add(t));
        let repeatWarning = repeatedTopics.length
            ? ` NOTE: [${repeatedTopics.join(', ')}] were already assigned earlier — for those you MUST invent a completely different question angle, scenario, or formula than anything asked before; a repeated topic must NEVER produce a repeated question.`
            : '';

                let prompt=`DETERMINISTIC JSON ENGINE. Batch ${ci+1}/${chunks.length} Seed:${randomSeed}. You MUST produce exactly ${chunkCount} questions. OUTPUT ONLY minified JSON array. SCHEMA: [{"subject":"${subject}","q":"question ending with ?","options":["...","...","...","..."],"answer":0,"explanation":"..."}] HARD RULES: 1) options=4 unique full sentences, MAXIMUM 12 words each,number of words in each option must range from 1-12 words, NO "A." "B)" prefix, NO single letters 2) answer=INTEGER 0-3 ONLY, 0=options[0] 1=options[1] 2=options[2] 3=options[3], NEVER string, NEVER 1-4 3) explanation MUST start with "The correct answer is " then a copy of options[answer] with its FIRST LETTER LOWERCASED (since it now continues a sentence instead of starting one) then " because" + 50+ words justification that proves why options[answer] is correct 4) SUBJECT:${subject} DIFFICULTY:${diff.toUpperCase()} MODE:${subMode.toUpperCase()} 5) ${topicFocus}${repeatWarning} 6) BANNED REPEAT QUESTIONS — never output anything resembling these previously-used questions:[${seenList}] 7) DIVERSITY: each question must test a different formula, edge case, or scenario, even within the same topic. 8) ANSWER POSITION: across these ${chunkCount} questions, spread the correct answer index roughly evenly across 0,1,2 and 3 in a random order — do NOT put the correct answer at index 0 for most questions. 9) CALCULATION ENFORCEMENT: for ANY assigned topic whose name contains the word "Calculations", the question is REJECTED unless it gives the student concrete numeric values (numbers, units, formulas to apply) and requires them to actually compute a numeric result to pick the right option — a purely definitional/conceptual question does NOT satisfy a "Calculations" topic, and all 4 options for that question must be plausible numeric results (not just one). 10) ARITHMETIC SELF-CHECK (MANDATORY): for every question that involves a calculation, work the calculation out step by step in your head FIRST, confirm which option index that final numeric result actually matches, and ONLY THEN set "answer" to that exact index — the number you restate inside "explanation" MUST be identical to the value shown in options[answer], never a different number. Before outputting, re-read your own explanation's arithmetic and verify it lands exactly on options[answer]; if it does not, redo the question. Getting the marked answer wrong, or writing an explanation whose math contradicts the marked option, is a critical failure — accuracy matters more than speed here. 11) CALCULATION DENSITY FOR ${subject.toUpperCase()}: ${subMode==='numeric' ? `this batch is NUMERIC mode — EXACTLY 90% of these ${chunkCount} questions must require an actual numeric calculation, only 10% may be pure conceptual/definitional.` : `this batch is standard/other mode — EXACTLY 40% of these ${chunkCount} questions may require a numeric calculation, the remaining 60% must test concepts, laws, definitions, or applied reasoning without heavy computation.`}`;

        try{
            let res = await puter.ai.chat(prompt, {model: 'gpt-4o-mini'});
            let txt = typeof res === 'string' ? res : res.message?.content || JSON.stringify(res);
            txt = txt.replace(/```json|```/g, '').trim();
            let startIdx = txt.indexOf('['); let endIdx = txt.lastIndexOf(']');
            if(startIdx !== -1){
                let arr = JSON.parse(txt.slice(startIdx, endIdx + 1));
                if(Array.isArray(arr)){
                    arr.forEach(q => {
                        if(result.length >= count) return;
                        if(!q.q || !q.options || q.options.length < 4) return;
                        q.subject = subject;
                        q.topic = chunkTopics[result.length] || chunkTopics[0] || '';
                        q.options = q.options.map(o => String(o).replace(/^\s*[A-D]\s*[\.\)\-]\s*/i, '').trim()).slice(0, 4);
                        q.answer = parseInt(q.answer); if(isNaN(q.answer) || q.answer < 0 || q.answer > 3) q.answer = 0;
                        if(q.answer >= q.options.length) q.answer = 0;
                        normalizeExplanationCasing(q);
                        let h = hashQ(q.q);
                        if(!avoidHashes.has(h)){
                            avoidHashes.add(h);
                            result.push(q);
                        }
                    });
                }
            }
        }catch(e){ console.warn('[Puter] chunk failed for '+subject, e && e.message); }

        if(ci < chunks.length-1) await new Promise(r => setTimeout(r, 300));
    }

    return result;
}

async function gen(){
    if(!sel.size){toast('Pick a subject first.');return;}
    let totalRequested=parseInt($('qcount').value)||0;
    if(totalRequested<=0){toast('Please fill the number of questions first.');return;}
    
    // Check time fields based on mode
    if(mode==='spak'){
        let perVal=parseInt($('per').value)||0;
        if(perVal<=0){toast('Please fill the time limit per question first.');return;}
    }
    if(mode==='speed'){
        let totVal=parseInt($('tot').value)||0;
        if(totVal<=0){toast('Please fill the total exam time first.');return;}
    }
    
    if(totalRequested>200)totalRequested=200;
    let diff=$('diff').value||'Hard';
    curDiff=diff;
    let subs=[...sel];

    let cacheK=cacheKeyFor(subs,diff,totalRequested,subMode);
    if($('cachePriority').checked){
        let cachedData=localStorage.getItem(cacheK);
        if(cachedData){
            try{
                Q=JSON.parse(cachedData);
                toast('Recovered optimization data matrix from engine cache.');
                start();return;
            }catch(e){}
        }
    }

    $('go').disabled=true;
    $('go').textContent='Generating Questions, please wait...';

    // ===== EXACT RATIO ALLOCATION =====
    // Even split of totalRequested across every selected subject; any remainder from
    // division not landing evenly goes to the FIRST subject in the selection list,
    // so the final combined count always matches totalRequested exactly.
    let n = subs.length;
    let baseQuota = Math.floor(totalRequested / n);
    let remainder = totalRequested % n;
    let quotas = subs.map((s, idx) => baseQuota + (idx === 0 ? remainder : 0));

    let perSubjectQuestions = {}; // subject -> array of question objects, built in subs order

    try {
        for(let si=0; si<subs.length; si++){
            let subject = subs[si];
            let quota = quotas[si];
            perSubjectQuestions[subject] = [];
            if(quota <= 0) continue;

            // ---- STEP 1: FIREBASE FIRST — check the shared question bank ----
            $('stat').textContent = `[Loading Operations... checking ${subject} question bank]`;
            let bank = await qbGetBank(subject, subMode, diff);
            let bankList = Object.values(bank || {});
            // Shuffle the candidate pool so repeated sessions don't always surface the
            // same questions first, then keep only ones this individual has never
            // answered before (per-browser uniqueness, via seenHashes).
            for(let k=bankList.length-1; k>0; k--){ let j=Math.floor(Math.random()*(k+1)); [bankList[k],bankList[j]]=[bankList[j],bankList[k]]; }
            let fromBank = [];
            let localTakenHashes = new Set();
            let allowedTopics = new Set(topicsFor(subject));
            let customTopics = window.ESITopics && !ESITopics.isAllSelected(subject, selTopics[subject]);
            for(let q of bankList){
                if(fromBank.length >= quota) break;
                if(!q || !q.q || !Array.isArray(q.options)) continue;
                if(customTopics){
                    const qt=q.topic||'';
                    let ok=allowedTopics.has(qt);
                    if(!ok && window.ESITopics){
                        const qk=ESITopics.sanitizeKey(qt);
                        allowedTopics.forEach(t=>{ if(ESITopics.sanitizeKey(t)===qk) ok=true; });
                    }
                    if(!qt || !ok) continue;
                }
                let h = hashQ(q.q);
                if(seenHashes.has(h) || localTakenHashes.has(h)) continue;
                localTakenHashes.add(h);
                fromBank.push({subject:subject, topic:q.topic||'', q:q.q, options:q.options.slice(), answer:q.answer, explanation:q.explanation});
            }
            perSubjectQuestions[subject] = fromBank;

            // ---- STEP 2: PUTER LAST — only generate the shortfall ----
            let shortfall = quota - fromBank.length;
            if(shortfall > 0){
                $('stat').textContent = `[Processing batch... generating ${shortfall} new ${subject} questions]`;
                let freshlyGenerated = await fetchViaPuter(subject, subMode, diff, shortfall, localTakenHashes);
                perSubjectQuestions[subject] = perSubjectQuestions[subject].concat(freshlyGenerated);
                // Save the newly-generated ones back to the shared bank so the pool
                // grows for everyone. Fire-and-forget — never blocks this quiz.
                qbSaveQuestions(subject, subMode, diff, freshlyGenerated);
            }
        }

        // ===== COMBINE ACROSS SUBJECTS =====
        // Shuffle ON (checkbox #sh)  -> interleaved further down below.
        // Shuffle OFF                -> stays grouped sequentially, in subject-selection order.
        let combined = [];
        subs.forEach(s => { combined = combined.concat(perSubjectQuestions[s] || []); });

        Q = combined.slice(0, totalRequested);

        if(!Q.length) throw new Error('Try Again.');

        // NEVER DUPLICATE: if Firebase + Puter together still came up short for
        // any subject (e.g. that subject's Puter call partially failed), make a
        // few bounded extra generation attempts asking for brand-new unique
        // questions — we do NOT pad with a reshuffled clone of a question
        // already in THIS quiz anymore, because that meant a user could face
        // the exact same question twice in one active session. If genuinely no
        // more unique questions can be found, the quiz simply runs shorter than
        // requested rather than ever repeating one.
        let fillAttempts = 0;
        while(Q.length < totalRequested && Q.length > 0 && fillAttempts < 2){
            fillAttempts++;
            let stillNeeded = totalRequested - Q.length;
            let alreadyTakenHashes = new Set(Q.map(q => hashQ(q.q)));
            let subjectForFill = subs[fillAttempts % subs.length] || subs[0];
            $('stat').textContent = `[Topping up... ${stillNeeded} more unique question(s) needed]`;
            let extra = await fetchViaPuter(subjectForFill, subMode, diff, stillNeeded, alreadyTakenHashes);
            if(extra && extra.length){
                Q = Q.concat(extra);
                qbSaveQuestions(subjectForFill, subMode, diff, extra);
            } else {
                break;
            }
        }
        if(Q.length < totalRequested){
            toast(`Only ${Q.length} unique question(s) available right now — duplicates are never allowed, so this quiz is shorter than requested.`);
        }
        Q = Q.slice(0, totalRequested);

        Q.forEach(shuffleOptionsFisherYates);
        Q.forEach(normalizeExplanationCasing);
        Q.forEach(q => seenHashes.add(hashQ(q.q)));
        saveSeen(seenHashes);
        
        if($('sh') && $('sh').checked) Q.sort(() => Math.random() - 0.5);
        try{localStorage.setItem(cacheK, JSON.stringify(Q))}catch(e){}
        
        start();
       

} catch(err) {
    console.error(err);
    $('stat').textContent = 'Exception Token generated: ' + ((err && err.message) ? err.message : String(err));
    $('go').textContent = '⚠️ Error. Check Your Internet connection';
    toast('Neural allocation drop. Retrying configuration sequence.');
} finally {
    $('go').disabled=false;
    if(!$('go').textContent.includes('Error')) {
        $('go').textContent='⚡ CLICK TO START QUIZ.';}
}
}      

// ===== QUIZ START =====
function start(){
    IS_REDO=false;
    window.quizStart=Date.now();
    let hw=document.getElementById('historyWrap');if(hw)hw.style.display='none';
    i=0;ans=new Array(Q.length).fill(null);sc=0;flg=new Set();timedOut=new Set();sessionSpeedLogs=new Array(Q.length).fill(0);
    $('setup').style.display='none';$('quiz').style.display='block';$('res').style.display='none';
    let per=parseInt($('per').value)||30;let tot=parseInt($('tot').value)||15;
    if(mode==='spak')left=per;
    if(mode==='speed')left=tot*60;
    buildPal();draw();if(mode!=='free')startTimer();
    window.scrollTo({top:0,behavior:'smooth'});saveActiveSession();
}

function buildPal(){
    let p=$('pal');if(!p)return;p.innerHTML='';
    Q.forEach((_,k)=>{
        let b=document.createElement('span');b.id='p_'+k;
        b.style.cssText='width:24px;height:24px;display:inline-grid;place-items:center;border-radius:6px;border:1px solid var(--border);font-size:9.5px;cursor:pointer;background:var(--card2);color:var(--muted);flex-shrink:0';
        b.textContent=k+1;
        b.onclick=()=>{i=k;if(mode==='spak')left=parseInt($('per').value)||30;draw();saveActiveSession();};
        p.appendChild(b);
    });
    updPal();
}

function updPal(){
    Q.forEach((_,k)=>{
        let b=$('p_'+k);if(!b)return;
        if(ans[k]!==null){b.style.background='rgba(0,255,136,0.15)';b.style.borderColor='var(--success)';b.style.color='var(--success)';}
        else if(timedOut.has(k)){b.style.background='rgba(255,71,87,0.15)';b.style.borderColor='var(--error)';b.style.color='var(--error)';}
        else{b.style.background='var(--card2)';b.style.borderColor='var(--border)';b.style.color='var(--muted)';}
        if(flg.has(k))b.style.boxShadow='0 0 0 2px var(--flag) inset';else b.style.boxShadow='none';
        if(k===i)b.style.outline='2px solid var(--accent)';else b.style.outline='none';
    });
}

function calculateEngineTelemetry(){
    let totalAnswered=ans.filter(a=>a!==null).length;
    if(totalAnswered===0){$('m_acc').textContent='100%';$('m_speed_v').textContent='0.0s';$('m_conf').textContent='1.0';return;}
    let correctSoFar=ans.filter((a,k)=>a!==null&&a===Q[k].answer).length;
    $('m_acc').textContent=Math.round((correctSoFar/totalAnswered)*100)+'%';
    let uniq=sessionSpeedLogs.filter(s=>s>0);
    let avg=uniq.length?(uniq.reduce((a,b)=>a+b,0)/uniq.length):0;
    $('m_speed_v').textContent=avg.toFixed(1)+'s';
    $('m_conf').textContent=((correctSoFar+1)/(totalAnswered+2)).toFixed(2);
}

function draw(){
    if(!Q[i])return;
    let q=Q[i];
    $('qc').textContent=`INSTANCE NODE ${i+1}/${Q.length} • Subject: ${q.subject}`;
    $('pr').style.width=((i+1)/Q.length*100)+'%';
    $('qt').innerHTML=q.q;
    let opDiv=$('op');opDiv.innerHTML='';
    let currentQTimeStart=Date.now();
    q.options.forEach((o,idx)=>{
        let d=document.createElement('div');
        let isAns=ans[i]===idx;let isCorrect=q.answer===idx;
        let show=$('se').checked&&ans[i]!==null;
        d.style.cssText=`padding:11px 12px;margin-top:6px;border-radius:9px;border:1px solid ${show?(isCorrect?'var(--success)':'var(--error)'):isAns?'var(--accent)':'var(--border)'};background:${show?isCorrect?'rgba(0,255,136,0.1)':isAns?'rgba(255,71,87,0.1)':'var(--card2)':isAns?'rgba(255,215,0,0.1)':'var(--card2)'};font-size:11.5px;cursor:pointer;color:var(--text)`;
        let clean=o.replace(/^\s*[A-D]\s*[\.\)\-]\s*/i,'').trim();
        d.innerHTML=`<b style="color:var(--accent);margin-right:8px">${String.fromCharCode(65+idx)}.</b>${clean}`;
        d.onclick=()=>{let deltaS=Math.round((Date.now()-currentQTimeStart)/1000);sessionSpeedLogs[i]=(sessionSpeedLogs[i]||0)+deltaS;pick(idx);};
        opDiv.appendChild(d);
    });
    let ex=$('ex');
    if($('se').checked&&ans[i]!==null&&q.explanation){
        ex.style.display='block';
        ex.innerHTML=`<b style="color:var(--accent)">Read Explanation:</b> ${q.explanation}`;
    }else{ex.style.display='none';}
    let isLast=i===Q.length-1;
    $('nextBtn').style.display=isLast?'none':'inline-flex';
    $('submitBtn').style.display=isLast?'inline-flex':'none';
    calculateEngineTelemetry();updPal();
}

function pick(idx){
    if(mode==='spak'&&(ans[i]!==null||timedOut.has(i)))return;
    ans[i]=idx;if(idx===Q[i].answer)sc++;
    draw();saveActiveSession();
    if($('an').checked){
        setTimeout(()=>{
            if(i<Q.length-1)mv(1);
            else{if($('autoSub')&&$('autoSub').checked)end();}
        },700);
    }
}

function mv(d){
    let ni=i+d;if(ni<0||ni>=Q.length)return;
    i=ni;if(mode==='spak'){left=parseInt($('per').value)||30;}
    draw();saveActiveSession();
}

function flag(){
    if(!Q||!Q[i]){toast('No question loaded');return;}
    let q=Q[i];let arr=getFlagged();
    let found=arr.findIndex(x=>x&&x.q===q.q);
    if(found===-1){arr.push({subject:q.subject,q:q.q,options:[...q.options],answer:q.answer,explanation:q.explanation||''});flg.add(i);toast('🚩 Flagged');}
    else{arr.splice(found,1);flg.delete(i);toast('Flag removed');}
    saveFlagged(arr);updPal();renderFlag();saveActiveSession();
}

function startTimer(){
    clearInterval(t);
    t=setInterval(()=>{
        left--;

        let m=Math.floor(left/60), s=left%60;

        $('tm').textContent = mode==='spak'
            ? `00:${String(left).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

        saveActiveSession();

        if(left<=0){
            toast("⏰ Time Up!");

            if(mode==='spak'){
                timedOut.add(i);

                if(i < Q.length-1){
                    i++;
                    left = parseInt($('per').value) || 30;
                    draw();
                }else{
                    end();
                }

            }else{
                end();
            }
        }

    },1000);
}

async function end(){
    let hw=$('historyWrap');if(hw)hw.style.display='block';
    clearInterval(t);clearActiveSession();
    $('quiz').style.display='none';$('res').style.display='block';
    let total=Q.length;
    let correct=ans.filter((a,k)=>a===Q[k].answer).length;
    let perc=Math.round(correct/total*100);
    let totalSec=Math.floor((Date.now()-window.quizStart)/1000)||0;
    let avgSec=total>0?Math.floor((sessionSpeedLogs.reduce((a,b)=>a+b,0)||totalSec)/total):0;
    if(avgSec<1)avgSec=1;
    let totalOps=total; // total questions answered this session
    let confIdx=((correct+1)/(total+2)).toFixed(2); // same Wilson-style formula as the live in-quiz metric, settled on the final tally

    if(mode!=='free'){
        await updateGlobalLB(perc,avgSec,totalOps);
    }

    let store=getStore();if(!store[mode])store[mode]=[];
    let rec={date:new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString(),score:perc,correct,total,mode,avgTime:avgSec};
    store[mode].push(rec);if(store[mode].length>20)store[mode].shift();saveStore(store);
    try{
        let key=QS_KEY_PREFIX+mode;
        let hist=JSON.parse(localStorage.getItem(key)||'[]');
        hist.push({id:Date.now(),date:rec.date,score:perc,correct,total,qs:JSON.parse(JSON.stringify(Q)),userAns:[...ans],avgTime:avgSec});
        if(hist.length>20)hist.shift();
        localStorage.setItem(key,JSON.stringify(hist));
    }catch(e){}

    // Snapshot everything the Share Result card needs right now, while sel/mode/curDiff
    // still describe THIS session — Retake/New Quiz can change them a moment later.
    lastSoloResult={subjects:[...sel], topics:packedSelTopics(), mode, diff:curDiff, perc, correct, total, avgSec, totalSec, confIdx, when:Date.now()};

    $('res').innerHTML=`<h2>Session Telemetry Results - ${perc}%</h2>
<div style="font-size:32px;font-weight:900;color:${perc>=70?'var(--success)':perc>=50?'var(--accent)':'var(--error)'};text-align:center;margin:12px 0">${perc}%</div>
<div style="display:flex;gap:8px;text-align:center">
  <div style="flex:1;background:var(--card2);padding:10px;border-radius:8px;border:1px solid var(--border)">Correct<br><b style="color:var(--success);font-size:16px">${correct}</b></div>
  <div style="flex:1;background:var(--card2);padding:10px;border-radius:8px;border:1px solid var(--border)">Wrong<br><b style="color:var(--error);font-size:16px">${total-correct}</b></div>
  <div style="flex:1;background:var(--card2);padding:10px;border-radius:8px;border:1px solid var(--border)">Operations<br><b style="font-size:16px">${total}</b></div>
</div>
<div style="text-align:center;margin-top:8px;font-size:11px;color:var(--muted)">Avg Time: ${avgSec}s • Total: ${totalSec}s • Confidence Index: ${confIdx}</div>
<div class="row" style="margin-top:12px;display:flex;gap:8px">
<button class="btn btn-g" style="flex:1" onclick="review()">Quiz Review</button>
<button class="btn btn-p" style="flex:1" onclick="location.reload()">Back</button>
</div>
<button class="btn btn-p" style="width:100%;margin-top:8px;background:linear-gradient(135deg,#ffd700,#ffb300);color:#000;border:0" onclick="openShareFormatChoice()">📤 Share Result</button>`;
    renderHistory();renderFlag();window.scrollTo({top:0,behavior:'smooth'});
}

function review(){
    let hw=$('historyWrap');if(hw)hw.style.display='none';
    i=0;$('res').style.display='none';$('quiz').style.display='block';draw();
    $('tm').innerHTML=`<button onclick="location.reload()" style="margin-right:8px;padding:4px 10px;border-radius:99px;background:var(--error);color:#fff;border:0;font-size:9px;font-weight:800;cursor:pointer">✕ Quit Review</button> Review Framework <button onclick="backToRes()" style="margin-left:8px;padding:4px 10px;border-radius:99px;background:var(--accent);color:#000;border:0;font-size:9px;font-weight:800;cursor:pointer">← Return</button>`;
    clearInterval(t);
}
function backToRes(){
    let hw=$('historyWrap');if(hw)hw.style.display='block';
    $('quiz').style.display='none';$('res').style.display='block';
    window.scrollTo({top:0,behavior:'smooth'});
}

// ===== LEADERBOARD FUNCTIONS =====
// Storage: leaderboard/{month}/{uid} — one entry per person, keyed by their real
// Firebase Auth uid (never a client-made-up id), so firebase-rules-leaderboard.json
// can enforce "you may only write your own entry." leaderboard_names/{name} is a
// separate global registry that reserves a display name to one uid at a time.
// (The old design stored the WHOLE month as one array under one key — any client
// could overwrite everyone's scores at once, and no rule could stop that. This is
// the fix that makes "secure leaderboard rules" possible at all.)
function getLBUser(){try{return JSON.parse(localStorage.getItem(LB_USER)||'null')}catch{return null}}

// Restore a returning player's leaderboard identity from the existing
// UID-keyed database row. This avoids treating another browser or the APK's
// separate WebView storage as a brand-new leaderboard account.
async function restoreLeaderboardIdentity(user){
    if(!user || user.isAnonymous || !user.uid) return false;
    const current = getLBUser();
    if(current && current.name) return true;
    try{
        let row = null;

        // Check the current month first.
        const currentSnap = await db.ref(`${LB_PATH}/${curMonth()}/${user.uid}`).get();
        if(currentSnap.exists()) row = currentSnap.val() || null;

        // A fresh WebView may have no local identity and no row for this month.
        // Search older UID-owned monthly rows without clearing or replacing cache.
        if(!row || typeof row.name !== 'string' || !row.name.trim()){
            const cursor = new Date();
            cursor.setUTCDate(1);
            for(let i = 0; i < 24 && (!row || typeof row.name !== 'string' || !row.name.trim()); i++){
                cursor.setUTCMonth(cursor.getUTCMonth() - 1);
                const monthKey = cursor.toISOString().slice(0, 7);
                const previousSnap = await db.ref(`${LB_PATH}/${monthKey}/${user.uid}`).get();
                if(previousSnap.exists()) row = previousSnap.val() || null;
            }
        }

        const name = row && typeof row.name === 'string' ? row.name.trim().slice(0,25) : '';
        if(!name) return false;

        localStorage.setItem(LB_USER, JSON.stringify({name}));
        const modal = $('nameModal');
        if(modal) modal.classList.remove('active');
        const error = $('nameErr');
        if(error) error.style.display = 'none';
        console.log('[Leaderboard] Restored existing identity for authenticated UID:', user.uid, name);
        return true;
    }catch(error){
        console.warn('[Leaderboard] Could not restore UID-owned profile:', error && error.message);
        return false;
    }
}

async function confirmLBName(){
    let nRaw=$('lbName').value.trim();
    let err=$('nameErr');
    let cleaned=nRaw.replace(/[^A-Za-z ]/g,'').replace(/\s+/g,' ').trim().slice(0,25);
    $('lbName').value=cleaned;
    if(cleaned.length<3){err.style.display='block';err.textContent='Name must be at least 3 letters A-Z.';return;}
    if(!/^[A-Za-z ]+$/.test(cleaned)){err.style.display='block';err.textContent='Only A-Z and space allowed.';return;}
    if(!myUid){err.style.display='block';err.textContent='Still connecting — try again in a moment.';return;}

    let existing=getLBUser();
    if(existing&&existing.name.toLowerCase()===cleaned.toLowerCase()){
        $('nameModal').classList.remove('active');
        err.style.display='none';
        toast('Identity locked: '+cleaned);return;
    }

    err.style.display='block';err.textContent='Checking global availability...';
    let normalized=cleaned.toLowerCase();
    try{
        let nameRef=db.ref(LB_NAMES+'/'+normalized);
        let snap=await nameRef.get();
        if(snap.exists() && snap.val().uid!==myUid){
            err.textContent='Name already taken globally. Choose another.';return;
        }
        await nameRef.set({uid:myUid, name:cleaned});
    }catch(e){
        err.textContent='Could not verify name right now — check your connection and try again.';return;
    }

    localStorage.setItem(LB_USER,JSON.stringify({name:cleaned}));
    $('nameModal').classList.remove('active');err.style.display='none';
    toast('Identity locked: '+cleaned);
}

// UPGRADED RANKING FORMULA - 4 factors: accuracy + speed + consistency + total ops volume
function calcRankingScore(entry){
    let avgScore=entry.avgScore||0;
    let avgSpeed=entry.avgSpeed||1;if(avgSpeed<1)avgSpeed=1;
    let attendance=entry.quizCount||1;
    let totalOps=entry.totalOps||1;if(totalOps<1)totalOps=1;
    // Formula: accuracy is king, volume matters but can't cheat with 1-question quizzes
    return +(avgScore*0.6 + (10/avgSpeed)*0.15 + Math.log10(attendance)*12 + Math.log10(totalOps)*8).toFixed(1);
}

async function updateGlobalLB(score,avgSpeedPerQ,totalOps=1,isAuto=false){
    if(IS_REDO){return;}
    let u=getLBUser();
    if(!u && auth.currentUser && !auth.currentUser.isAnonymous){
        await restoreLeaderboardIdentity(auth.currentUser);
        u=getLBUser();
    }
    if(!u){
        $('nameModal').classList.add('active');
        let check=setInterval(()=>{let nu=getLBUser();if(nu){clearInterval(check);updateGlobalLB(score,avgSpeedPerQ,totalOps,isAuto);}},1000);
        return;
    }
    if(!myUid){toast('📡 Still connecting — try again in a moment.');return;}
    let month=curMonth();
    let ref=db.ref(`${LB_PATH}/${month}/${myUid}`);
    let me=null;
    try{ let snap=await ref.get(); me=snap.exists()?snap.val():null; }catch(e){ me=null; }
    if(!me) me={name:u.name.slice(0,25),quizCount:0,totalScore:0,totalSpeed:0,totalOps:0,avgScore:0,avgSpeed:0,rankScore:0};
    me.quizCount=(me.quizCount||0)+1;
    me.totalScore=(me.totalScore||0)+score;
    me.totalSpeed=(me.totalSpeed||0)+avgSpeedPerQ;
    me.totalOps=(me.totalOps||0)+totalOps;
    me.avgScore=+(me.totalScore/me.quizCount).toFixed(1);
    me.avgSpeed=+(me.totalSpeed/me.quizCount).toFixed(1);
    me.name=u.name.slice(0,25);
    me.rankScore=+calcRankingScore(me).toFixed(3);
    me.lastSeen=Date.now();
    let ok=false;
    try{ await ref.set(me); ok=true; }catch(e){ ok=false; console.warn('[Leaderboard] sync failed:', e && e.message); }
    if(ok){toast('✓ Leaderboard synced');}else{toast('📡 Offline — score saved locally, will sync later');}
}

async function openLB(){
    $('lbModal').classList.add('active');
    $('lbPodium').innerHTML='<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">Calculating rankings...</div>';
    $('lbBody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:12px;color:var(--muted)">Loading...</td></tr>';
    let statusEl=$('lbSyncStatus');
    if(statusEl)statusEl.textContent='Connecting...';

    let now=curMonth();
    let raw={};try{raw=await kvGet(`${LB_PATH}/${now}`)||{};}catch(e){raw={};}
    let all=Object.keys(raw).map(uid=>({id:uid, ...raw[uid]}));
    all.forEach(e=>{e.rankScore=Number(calcRankingScore(e));});
    all.sort((a,b)=>{
        const diff=(Number(b.rankScore)||0)-(Number(a.rankScore)||0);
        return diff || String(a.name||'').localeCompare(String(b.name||''));
    });
    all.forEach((e,i)=>{e.rank=i+1;});
    if(statusEl){
        statusEl.textContent=fbHealthy
            ? `🟢 Live • ${all.length} player${all.length===1?'':'s'} ranked this month`
            : `🔴 Connection issue — showing last cached data (${all.length} player${all.length===1?'':'s'}). Tap Refresh to retry.`;
        statusEl.style.color=fbHealthy?'var(--success)':'var(--error)';
    }

    // Last month's top 3, read live off last month's real entries — no separately-stored
    // "here's who won" snapshot for anyone's browser to fabricate.
    let hofHtml='';
    try{
        let lastMonth=prevMonth();
        let prevRaw=await kvGet(`${LB_PATH}/${lastMonth}`)||{};
        let prevAll=Object.keys(prevRaw).map(uid=>({id:uid, ...prevRaw[uid]}));
        // Monthly champions come directly from the same canonical ranking order.
        prevAll.forEach(e=>{e.rankScore=Number(calcRankingScore(e));});
        prevAll.sort((a,b)=>{
            const diff=(Number(b.rankScore)||0)-(Number(a.rankScore)||0);
            return diff || String(a.name||'').localeCompare(String(b.name||''));
        });
        prevAll.forEach((e,i)=>{e.rank=i+1;});
        const top3=prevAll.slice(0,3);
        if(top3.length){
            hofHtml=`<div style="background:linear-gradient(135deg,#0d1b3d,#123166);color:#fff;padding:16px 12px;border-radius:16px;font-size:11px;margin-bottom:10px;text-align:center;border:1px solid #ffd70055;box-shadow:0 6px 18px rgba(0,0,0,0.4)">
    <div style="color:#ffd700;font-weight:900;font-size:13px;letter-spacing:0.4px">🏆 LAST MONTH'S TOP 3 — ${lastMonth} CHAMPIONS 🏆</div>
    <div style="display:flex;justify-content:center;align-items:flex-end;gap:10px;margin-top:12px;flex-wrap:wrap">
        <div style="min-width:78px;background:rgba(192,192,192,0.12);border:1px solid #c0c0c0;border-radius:12px;padding:10px 6px"><div style="font-size:20px">🥈</div><div style="font-weight:800;font-size:11px;text-transform:capitalize;margin-top:2px">${top3[1]?.name||'—'}</div><div style="font-size:10px;color:#9fc4ff;margin-top:3px;font-weight:700">${Math.round(top3[1]?.totalScore||0)} pts</div></div>
        <div style="min-width:86px;background:rgba(255,215,0,0.14);border:1.5px solid gold;border-radius:14px;padding:12px 6px"><div style="font-size:24px">🥇</div><div style="font-weight:900;font-size:12px;text-transform:capitalize;margin-top:2px">${top3[0]?.name||'—'}</div><div style="font-size:10.5px;color:#ffd700;margin-top:3px;font-weight:800">${Math.round(top3[0]?.totalScore||0)} pts</div></div>
        <div style="min-width:78px;background:rgba(205,127,50,0.12);border:1px solid #cd7f32;border-radius:12px;padding:10px 6px"><div style="font-size:20px">🥉</div><div style="font-weight:800;font-size:11px;text-transform:capitalize;margin-top:2px">${top3[2]?.name||'—'}</div><div style="font-size:10px;color:#9fc4ff;margin-top:3px;font-weight:700">${Math.round(top3[2]?.totalScore||0)} pts</div></div>
    </div>
    <div style="font-size:8.5px;margin-top:12px;color:#c9d8f5;line-height:1.5">🎉 Congratulations to our champions! 🎉<br>The administrators will be reaching out to you soon.</div>
</div>`;
        }
    }catch(e){}

    const myLBName=(getLBUser()&&getLBUser().name||'').trim().toLowerCase();
    const isMyLBEntry=e=>!!e&&(e.id===myUid || (!!myLBName && String(e.name||'').trim().toLowerCase()===myLBName));
    // The globally unique Single-player username is the cross-device identity fallback.
    // Firebase UIDs can change when an anonymous profile is linked to an existing Google account.
    // Canonical order is already highest formula output -> lowest. Never infer rank from visual position.
    const first=all[0]||null;
    const second=all[1]||null;
    const third=all[2]||null;
    let podiumHtml=`<div style="display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:8px;align-items:stretch;margin:12px 0">`;
    if(second)podiumHtml+=`<div style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:rgba(192,192,192,0.15);padding:10px 6px;border-radius:12px;border:1px solid #c0c0c0;word-break:break-word"><div style="font-size:20px">🥈</div><div style="font-size:11px;font-weight:800;line-height:1.2;white-space:normal;word-break:break-word;color:var(--text)">${second.name}${isMyLBEntry(second)?' (you)':''}</div><div style="font-size:9px;margin-top:4px;color:var(--muted)">${second.avgScore}% • ${second.avgSpeed}s<br>${second.quizCount}×</div></div>`;
    else podiumHtml+=`<div></div>`;
    if(first)podiumHtml+=`<div style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,rgba(255,215,0,0.28),rgba(255,215,0,0.08));padding:14px 6px;border-radius:14px;border:1.5px solid gold;word-break:break-word"><div style="font-size:26px">🥇</div><div style="font-size:12px;font-weight:900;line-height:1.2;white-space:normal;word-break:break-word;color:var(--text)">${first.name}${isMyLBEntry(first)?' (you)':''}</div><div style="font-size:9px;margin-top:4px;color:var(--muted)">${first.avgScore}% • ${first.avgSpeed}s • ${first.quizCount}×</div><div style="font-size:8px;color:var(--muted)">${first.rankScore.toFixed(1)} pts</div></div>`;
    else podiumHtml+=`<div></div>`;
    if(third)podiumHtml+=`<div style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:rgba(205,127,50,0.15);padding:10px 6px;border-radius:12px;border:1px solid #cd7f32;word-break:break-word"><div style="font-size:20px">🥉</div><div style="font-size:11px;font-weight:800;line-height:1.2;white-space:normal;word-break:break-word;color:var(--text)">${third.name}${isMyLBEntry(third)?' (you)':''}</div><div style="font-size:9px;margin-top:4px;color:var(--muted)">${third.avgScore}% • ${third.avgSpeed}s<br>${third.quizCount}×</div></div>`;
    else podiumHtml+=`<div></div>`;
    podiumHtml+=`</div>`;

    $('lbPodium').innerHTML=hofHtml+podiumHtml;

    if(!all.length){
        $('lbBody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--muted)">No entries yet. Complete a quiz to appear here!</td></tr>';
        return;
    }

    $('lbBody').innerHTML=all.map((u,idx)=>{
        let isMe=isMyLBEntry(u);
        let title=u.rank===1?'🥇 1ST':u.rank===2?'🥈 2ND':u.rank===3?'🥉 3RD':`#${u.rank}`;
        let rowClass=isMe?'class="me"':'';
        return `<tr ${rowClass}>
            <td style="padding:8px 6px;font-weight:800;text-align:center">${u.rank}</td>
           <td style="padding:8px 6px;font-weight:600;word-break:break-word;white-space:normal;min-width:100px;text-transform:capitalize">${u.name}${isMe?'<span style="color:var(--accent);font-size:9px;margin-left:4px">(you)</span>':''}</td>
            <td style="padding:8px 6px;font-weight:800">${u.avgScore}%</td>
            <td style="padding:8px 6px">${u.avgSpeed}s</td>
            <td style="padding:8px 6px;font-weight:700">${u.totalOps||0}</td>
            <td style="padding:8px 6px">${u.quizCount}</td>
            <td style="padding:8px 6px;font-size:10px">${title}<br><span style="font-size:8px;color:var(--muted)">${u.rankScore.toFixed(1)} pts</span></td>
        </tr>`;
    }).join('');
}

// ===== SHARE RESULT — ported and adapted from the multiplayer app's receipt-style card,
// reshaped for a single-player session (subjects/mode/difficulty instead of opponents). =====
const DIFF_LABELS={Easy:'Standard Foundation', Medium:'Advanced Application', Hard:'Elite Masterclass', Olympian:'Olympian Theoretical Tier'};
const MODE_LABELS={spak:'Spak Mode', speed:'Sprint Mode', free:'Read Mode'};

function loadLogoImage(){
    return new Promise(resolve=>{
        let img=new Image();
        img.onload=()=>resolve(img);
        img.onerror=()=>resolve(null);
        img.src='logo.jpg';
    });
}
function drawSealOrLogo(ctx, cx, cy, r, logoImg, emblemChar){
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.closePath();
    ctx.fillStyle='#0d1b3d'; ctx.fill();
    ctx.strokeStyle='#ffd700'; ctx.lineWidth=4; ctx.stroke();
    if(logoImg){
        ctx.clip();
        ctx.drawImage(logoImg, cx-r, cy-r, r*2, r*2);
    }else{
        ctx.fillStyle='#ffd700'; ctx.font=`${Math.floor(r*0.9)}px sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(emblemChar, cx, cy+2);
        ctx.textBaseline='alphabetic';
    }
    ctx.restore();
}

function openShareFormatChoice(){
    if(!lastSoloResult){toast('No result to share yet.');return;}
    let box=document.createElement('div');
    box.style.cssText='display:flex;position:fixed;inset:0;background:rgba(0,0,0,.6);align-items:center;justify-content:center;z-index:9999';
    box.innerHTML=`<div class="card" style="max-width:340px;text-align:center;padding:20px;border-radius:14px">
        <h2 style="margin:0 0 4px">Share Result</h2>
        <p style="font-size:12px;color:var(--muted);margin:0 0 14px">Choose a format</p>
        <button class="btn btn-p" style="width:100%;margin-top:6px" id="shareChooseImg">🖼️ Share as Image</button>
        <button class="btn btn-g" style="width:100%;margin-top:8px" id="shareChoosePdf">📄 Share as PDF</button>
        <button class="btn btn-g" style="width:100%;margin-top:12px;font-size:11px" id="shareChooseCancel">Cancel</button>
    </div>`;
    document.body.appendChild(box);
    let cleanup=()=>box.remove();
    box.addEventListener('click', e=>{ if(e.target===box) cleanup(); });
    box.querySelector('#shareChooseCancel').onclick=cleanup;
    box.querySelector('#shareChooseImg').onclick=async()=>{ cleanup(); toast('Preparing image…'); let cv=await buildSoloResultCanvas(); if(cv) shareOrDownloadCanvas(cv, 'MediSurg - Quiz Result.png', 'MediSurg — Result'); };
    box.querySelector('#shareChoosePdf').onclick=async()=>{ cleanup(); toast('Preparing PDF…'); let cv=await buildSoloResultCanvas(); if(cv) shareOrDownloadCanvasAsPDF(cv, 'MediSurg - Quiz Result.pdf', 'MediSurg — Result'); };
}

async function buildSoloResultCanvas(){
    let d=lastSoloResult;
    if(!d){toast('No result to share yet.');return null;}
    let logoImg=await loadLogoImage();
    let lbUser=getLBUser();
    let W=1000, PAD=40, logoBlock=210, titleBlock=110, headlineBlock=100, metaBlock=44, statsBlock=150, footerBlock=90;
    let H=PAD+logoBlock+titleBlock+headlineBlock+metaBlock+statsBlock+footerBlock+PAD;
    let cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    let ctx=cv.getContext('2d');
    let g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#020818'); g.addColorStop(1,'#050f28');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#ffd700'; ctx.lineWidth=6; ctx.strokeRect(20,20,W-40,H-40);
    ctx.textAlign='center';
    let cursor=PAD;
    drawSealOrLogo(ctx, W/2, cursor+95, 85, logoImg, '🎓');
    cursor+=logoBlock;
    ctx.fillStyle='#ffd700'; ctx.font='900 32px Poppins, sans-serif';
    ctx.fillText('MEDISURG', W/2, cursor+30);
    ctx.fillStyle='#8ea0c8'; ctx.font='600 19px Poppins, sans-serif';
    ctx.fillText((lbUser?lbUser.name.toUpperCase()+' · ':'')+'SINGLE PLAYER', W/2, cursor+60);
    cursor+=titleBlock;
    let pct=d.perc;
    ctx.fillStyle=pct>=70?'#00ff88':pct>=50?'#ffd700':'#ff4757'; ctx.font='900 60px Poppins, sans-serif';
    ctx.fillText(pct+'%', W/2, cursor+60);
    cursor+=headlineBlock;
    let subjLine=(d.subjects||[]).join(', ').toUpperCase()||'PRACTICE';
    let metaLine=`${subjLine} · ${(DIFF_LABELS[d.diff]||d.diff||'').toUpperCase()} · ${(MODE_LABELS[d.mode]||d.mode||'').toUpperCase()}`;
    let topicLine = '';
    ctx.fillStyle='#8ea0c8'; ctx.font='600 16px Poppins, sans-serif';
    ctx.fillText(metaLine, W/2, cursor+18);
    if(topicLine){
        ctx.fillStyle='#c9b24a'; ctx.font='600 13px Poppins, sans-serif';
        ctx.fillText(topicLine, W/2, cursor+36);
    }
    let dt=new Date(d.when);
    ctx.fillStyle='#5d75ac'; ctx.font='600 14px Poppins, sans-serif';
    ctx.fillText(dt.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})+' · '+dt.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}), W/2, cursor+40);
    cursor+=metaBlock;
    let stats=[['CORRECT',`${d.correct}/${d.total}`],['ACCURACY',pct+'%'],['CONFIDENCE',d.confIdx],['AVG TIME',d.avgSec+'s']];
    let boxW=(W-160)/stats.length;
    stats.forEach((s,idx)=>{
        let bx=80+idx*boxW;
        ctx.fillStyle='#00ff88'; ctx.font='900 28px Poppins, sans-serif';
        ctx.fillText(s[1], bx+boxW/2, cursor+55);
        ctx.fillStyle='#8ea0c8'; ctx.font='700 14px Poppins, sans-serif';
        ctx.fillText(s[0], bx+boxW/2, cursor+80);
    });
    cursor+=statsBlock;
    ctx.strokeStyle='#1d356f'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(80,cursor); ctx.lineTo(W-80,cursor); ctx.stroke();
    ctx.fillStyle='#ffd700'; ctx.font='900 16px Poppins, sans-serif';
    ctx.fillText('⚡ MEDISURG', W/2, cursor+38);
    ctx.fillStyle='#5d75ac'; ctx.font='600 13px Poppins, sans-serif';
    ctx.fillText('ALL RIGHTS RESERVED', W/2, cursor+60);
    return cv;
}

function shareOrDownloadCanvas(cv, filename, shareTitle){
    cv.toBlob(async blob=>{
        if(!blob){toast('Could not generate image.');return;}
        let file=new File([blob], filename, {type:'image/png'});
        if(navigator.canShare && navigator.canShare({files:[file]})){
            try{ await navigator.share({files:[file], title:shareTitle}); return; }
            catch(e){ /* user cancelled or share failed — fall through to download */ }
        }
        let url=URL.createObjectURL(blob);
        let a=document.createElement('a'); a.href=url; a.download=filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 4000);
        toast('Result image downloaded.');
    }, 'image/png');
}
// JPEG (not PNG) keeps this a few hundred KB instead of several MB for the same card —
// this card is flat color blocks + text, not a photo, so 0.85 JPEG quality is visually
// indistinguishable from the PNG source at normal viewing size.
async function shareOrDownloadCanvasAsPDF(cv, filename, shareTitle){
    try{
        let { jsPDF }=window.jspdf;
        let jpegUrl=cv.toDataURL('image/jpeg', 0.85);
        let orientation = cv.width>=cv.height ? 'l' : 'p';
        let pdf=new jsPDF({orientation, unit:'px', format:[cv.width, cv.height], compress:true});
        pdf.addImage(jpegUrl, 'JPEG', 0, 0, cv.width, cv.height);
        let blob=pdf.output('blob');
        let file=new File([blob], filename, {type:'application/pdf'});
        if(navigator.canShare && navigator.canShare({files:[file]})){
            try{ await navigator.share({files:[file], title:shareTitle}); return; }
            catch(e){ /* fall through to download */ }
        }
        let url=URL.createObjectURL(blob);
        let a=document.createElement('a'); a.href=url; a.download=filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 4000);
        toast('Result PDF downloaded.');
    }catch(e){ console.warn('[Share] PDF export failed', e); toast('Could not generate PDF.'); }
}


// ===== GRAPH RENDER - CURVED LINES + GLOWING DOTS =====
function drawGraph(canvasId, data, colorVar){
    let c=$(canvasId);if(!c||!data||data.length<1)return;
    let ctx=c.getContext('2d');
    let w=c.offsetWidth||c.width||300;
    c.width=w;
    let h=90;c.height=h;
    ctx.clearRect(0,0,w,h);

    // Resolve CSS variable color
    let color='#00ff88';
    if(colorVar==='spak') color='#00ff88';
    else if(colorVar==='speed') color='#00bfff';
    else if(colorVar==='free') color='#ffd700';

    if(data.length===1){
        // Single point - just draw the dot
        let x=w/2; let y=h-(data[0].score/100)*(h-20)-10;
        ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);
        ctx.fillStyle=color;ctx.fill();
        ctx.shadowColor=color;ctx.shadowBlur=12;ctx.fill();
        return;
    }

    // Build points array
    let pts=data.map((r,k)=>({
        x:k/(data.length-1)*(w-20)+10,
        y:h-(r.score/100)*(h-20)-10
    }));

    // Draw curved line using quadratic bezier
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=2.5;
    ctx.lineJoin='round';
    ctx.lineCap='round';
    ctx.shadowColor=color;
    ctx.shadowBlur=8;

    ctx.moveTo(pts[0].x,pts[0].y);
    for(let k=1;k<pts.length;k++){
        if(k<pts.length-1){
            let cpX=(pts[k].x+pts[k+1].x)/2;
            let cpY=(pts[k].y+pts[k+1].y)/2;
            ctx.quadraticCurveTo(pts[k].x,pts[k].y,cpX,cpY);
        }else{
            ctx.quadraticCurveTo(pts[k-1].x+(pts[k].x-pts[k-2]?.x||0)*0.3, pts[k-1].y, pts[k].x, pts[k].y);
        }
    }
    ctx.stroke();

    // Draw glowing white dots at each point
    pts.forEach(pt=>{
        ctx.beginPath();
        ctx.arc(pt.x,pt.y,4,0,Math.PI*2);
        ctx.fillStyle='#ffffff';
        ctx.shadowColor='#ffffff';
        ctx.shadowBlur=10;
        ctx.fill();
        // Inner colored dot
        ctx.beginPath();
        ctx.arc(pt.x,pt.y,2.5,0,Math.PI*2);
        ctx.fillStyle=color;
        ctx.shadowColor=color;
        ctx.shadowBlur=6;
        ctx.fill();
    });

    // Reset shadow
    ctx.shadowColor='transparent';ctx.shadowBlur=0;
}

// ===== HISTORY RENDER =====
function renderHistory(){
    ['spak','speed','free'].forEach(m=>{
        let store=getStore();let d=store[m]||[];
        let cntEl=$(`cnt_${m}`);if(cntEl)cntEl.textContent=`(${d.length})`;
        if(d.length){drawGraph('g_'+m,d,m);}
        let hEl=$(`h_${m}`);if(!hEl)return;
        try{
            let key=QS_KEY_PREFIX+m;let hist=JSON.parse(localStorage.getItem(key)||'[]').reverse();
            if(!hist.length){hEl.innerHTML='NO HISTORY RECORDED YET.';return;}
            hEl.innerHTML=hist.map(item=>`
                <details style="margin-top:6px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px">
                    <summary style="cursor:pointer;font-size:10.5px;font-weight:700;list-style:none;display:flex;justify-content:space-between;align-items:center">
                        <span>${item.date} • <b style="color:${item.score>=70?'var(--success)':item.score>=50?'var(--accent)':'var(--error)'}">${item.score}%</b> (${item.correct}/${item.total})</span>
                        <span style="font-size:9px;color:var(--muted)">Tap to view history ▼</span>
                    </summary>
                    <div style="margin-top:8px;border-top:1px dashed var(--border);padding-top:6px">
                        ${item.qs.map((q,qi)=>{
                            let ua=item.userAns[qi];
                            return `<div style="margin-bottom:8px;padding:8px;background:var(--card2);border-radius:6px;border-left:3px solid ${ua==null?'#666':ua===q.answer?'var(--success)':'var(--error)'}">
                                <div style="font-size:11px;font-weight:700;margin-bottom:4px;color:var(--text)">${qi+1}. ${q.q}</div>
                                ${q.options.map((opt,oi)=>{
                                    let isCorr=oi===q.answer;let isUser=oi===ua;
                                    return `<div style="font-size:10px;padding:4px 6px;margin:3px 0;border:1px solid ${isCorr?'var(--success)':isUser?'var(--error)':'var(--border2)'};background:${isCorr?'rgba(0,255,136,0.1)':isUser?'rgba(255,71,87,0.1)':'transparent'};border-radius:4px;color:var(--text)">
                                        ${String.fromCharCode(65+oi)}. ${opt} ${isCorr?'✅':''} ${isUser&&!isCorr?'❌ Incorrect':''}
                                    </div>`;
                                }).join('')}
                                ${q.explanation?`<div style="font-size:9px;color:var(--muted);margin-top:4px"><b>Read Explanation:</b> ${q.explanation}</div>`:''}
                            </div>`;
                        }).join('')}
                        <div style="display:flex;gap:6px;margin-top:8px">
                            <button class="btn btn-g" style="font-size:9px;padding:4px 8px" onclick="replayQuiz('${m}',${item.id})">Redo Quiz</button>
                            <button class="btn btn-g" style="font-size:9px;padding:4px 8px;color:var(--error);border-color:rgba(255,71,87,0.3)" onclick="deleteOneQuiz('${m}',${item.id})">Clear history</button>
                        </div>
                    </div>
                </details>
            `).join('');
        }catch(e){hEl.innerHTML='Telemetry structural read error.';}
    });
}

function replayQuiz(modeName,id){
    IS_REDO=true;
    let hw=document.getElementById('historyWrap');if(hw)hw.style.display='none';
    let key=QS_KEY_PREFIX+modeName;
    let hist=JSON.parse(localStorage.getItem(key)||'[]');
    let item=hist.find(h=>h.id===id);if(!item)return;
    Q=item.qs;ans=new Array(Q.length).fill(null);flg=new Set();timedOut=new Set();
    sessionSpeedLogs=new Array(Q.length).fill(0);sc=0;i=0;
    setMode(modeName);
    $('setup').style.display='none';$('res').style.display='none';$('quiz').style.display='block';
    let per=parseInt($('per').value)||30;let tot=parseInt($('tot').value)||15;
    if(modeName==='spak')left=per;
    if(modeName==='speed')left=tot*60;
    buildPal();draw();if(modeName!=='free')startTimer();
    toast('Retake started - Practice mode (no leaderboard)');
    window.scrollTo({top:0,behavior:'smooth'});
}

function deleteOneQuiz(modeName,id){
    if(!confirm('Purge target trace element metrics?'))return;
    let key=QS_KEY_PREFIX+modeName;
    let hist=JSON.parse(localStorage.getItem(key)||'[]').filter(h=>h.id!==id);
    localStorage.setItem(key,JSON.stringify(hist));
    renderHistory();
}

function renderFlag(){
    let arr=getFlagged();
    let ce=$('cnt_flag');if(ce)ce.textContent=`(${arr.length})`;
    if(!arr.length){$('h_flag').innerHTML='NO FLAGGED QUESTION YET.';return;}
    $('h_flag').innerHTML=arr.slice().reverse().map((q)=>{
        if(!q||!q.q)return'';
        let opts=Array.isArray(q.options)?q.options:[];
        return `
        <details style="padding:8px;border-bottom:1px solid var(--border2);background:var(--bg);border-radius:8px;margin-bottom:6px">
            <summary style="cursor:pointer;font-size:11px;font-weight:700;color:var(--text)">${q.subject||'Flagged'}: ${q.q.slice(0,60)}${q.q.length>60?'...':''}</summary>
            <div style="font-size:11.5px;margin-top:8px;line-height:1.5;color:var(--text)">${q.q}</div>
            <div style="margin-top:6px">
                ${opts.map((opt,oi)=>`<div style="font-size:10px;padding:5px;border:1px solid ${oi===q.answer?'var(--success)':'var(--border2)'};border-radius:5px;margin-top:4px;background:${oi===q.answer?'rgba(0,255,136,0.1)':'transparent'};color:var(--text)">${String.fromCharCode(65+oi)}. ${opt} ${oi===q.answer?'✅':''}</div>`).join('')}
            </div>
            ${q.explanation?`<div style="font-size:9.5px;color:var(--muted);margin-top:6px;border-left:2px solid var(--accent);padding-left:6px"><b>Read Explanation:</b> ${q.explanation}</div>`:''}
        </details>`;
    }).join('');
}

function clrH(){
    if(confirm('Are you sure you want to clear history?')){
        localStorage.removeItem(STORE_KEY);localStorage.removeItem(FLAG_KEY);localStorage.removeItem(SEEN_KEY);
        ['spak','speed','free'].forEach(m=>localStorage.removeItem(QS_KEY_PREFIX+m));
        renderHistory();renderFlag();toast('History cleared.');
    }
}

// ===== CALCULATOR ENGINE =====
(function(){
    let d=$('calcD');let g=$('cg');if(!g)return;
    let keys=['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','⌫','(',')'];
    keys.forEach(k=>{
        let b=document.createElement('button');b.textContent=k;
        b.style.cssText='padding:8px 0;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-weight:700;font-size:11px;cursor:pointer';
        b.onclick=()=>{
            if(k==='C')d.value='';
            else if(k==='⌫')d.value=d.value.slice(0,-1);
            else if(k==='='){try{d.value=Function('"use strict";return('+d.value+')')();}catch{d.value='Syntax error';}}
            else d.value+=k;
        };
        g.appendChild(b);
    });
})();

// ===== SUGGESTION BOX =====
document.getElementById('openSuggestionBtn').addEventListener('click',()=>{document.getElementById('suggestionModal').classList.add('active')});
document.getElementById('closeModalBtn').addEventListener('click',()=>{document.getElementById('suggestionModal').classList.remove('active')});
document.getElementById('suggestionModal').addEventListener('click',e=>{if(e.target.id==='suggestionModal')e.currentTarget.classList.remove('active')});
document.getElementById('suggestionForm').addEventListener('submit',e=>{
    e.preventDefault();
    let cat=document.getElementById('category').value;
    let msg=document.getElementById('message').value;
    let formattedText=`*ELITE AI COGNITIVE INSTANCE - REPORT*\n\n• *Telemetry Class:* ${cat}\n• *Structural Report:* ${msg}`;
    let encodedText=encodeURIComponent(formattedText);
    let phoneNumber="";
    let whatsappUrl=`https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl,'_blank');
    toast('Redirecting to WhatsApp secure portal...');
    document.getElementById('suggestionModal').classList.remove('active');
    document.getElementById('suggestionForm').reset();
});

// ===== DRAGGABLE CALCULATOR =====
(function(){
    const calc=$('calc'),head=$('calcH');
    if(!calc||!head||calc.dataset.dragReady==='1')return;
    calc.dataset.dragReady='1';
    let active=false,mode='',pointerId=null,offsetX=0,offsetY=0,raf=0,x=0,y=0,previousTransition='';
    head.style.cursor='move';
    head.style.touchAction='none';
    head.style.userSelect='none';
    head.style.webkitUserSelect='none';
    head.style.webkitTouchCallout='none';

    function coords(e){
        if(e.touches&&e.touches.length)return {x:e.touches[0].clientX,y:e.touches[0].clientY};
        if(e.changedTouches&&e.changedTouches.length)return {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
        return {x:e.clientX,y:e.clientY};
    }
    function start(e,m){
        if(active)return;
        if(m==='pointer'&&(e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0)))return;
        if(m==='mouse'&&e.button!==0)return;
        const p=coords(e),r=calc.getBoundingClientRect();
        active=true;mode=m;pointerId=e.pointerId;
        offsetX=p.x-r.left;offsetY=p.y-r.top;
        previousTransition=calc.style.transition;
        calc.style.transition='none';
        calc.style.position='fixed';
        calc.style.left=r.left+'px';calc.style.top=r.top+'px';
        calc.style.right='auto';calc.style.bottom='auto';calc.style.margin='0';
        calc.style.transform='none';
        if(m==='pointer'){try{head.setPointerCapture(e.pointerId);}catch(_){}}
        if(e.cancelable)e.preventDefault();
    }
    function move(e){
        if(!active)return;
        if(mode==='pointer'&&e.pointerId!==pointerId)return;
        if(mode==='touch'&&e.touches&&e.touches.length!==1)return;
        const p=coords(e),rect=calc.getBoundingClientRect();
        const vw=window.innerWidth||document.documentElement.clientWidth;
        const vh=window.innerHeight||document.documentElement.clientHeight;
        x=Math.max(0,Math.min(Math.max(0,vw-rect.width),p.x-offsetX));
        y=Math.max(0,Math.min(Math.max(0,vh-rect.height),p.y-offsetY));
        if(!raf)raf=requestAnimationFrame(()=>{raf=0;if(active){calc.style.left=x+'px';calc.style.top=y+'px';}});
        if(e.cancelable)e.preventDefault();
    }
    function stop(e){
        if(!active)return;
        if(mode==='pointer'&&e&&e.pointerId!==undefined&&e.pointerId!==pointerId)return;
        active=false;
        if(raf){cancelAnimationFrame(raf);raf=0;}
        calc.style.transition=previousTransition;
        if(mode==='pointer'){try{if(head.hasPointerCapture(pointerId))head.releasePointerCapture(pointerId);}catch(_){}}
        mode='';pointerId=null;
    }
    head.addEventListener('pointerdown',e=>start(e,'pointer'),{passive:false});
    window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',stop);
    window.addEventListener('pointercancel',stop);
    // Explicit touch fallback for Android browsers and WebViews.
    head.addEventListener('touchstart',e=>start(e,'touch'),{passive:false});
    window.addEventListener('touchmove',move,{passive:false});
    window.addEventListener('touchend',stop,{passive:true});
    window.addEventListener('touchcancel',stop,{passive:true});
    if(!window.PointerEvent){
        head.addEventListener('mousedown',e=>start(e,'mouse'),{passive:false});
        window.addEventListener('mousemove',move,{passive:false});
        window.addEventListener('mouseup',stop);
    }
    window.addEventListener('blur',stop);
})();

// Re-draw graphs when details opened
document.querySelectorAll('details').forEach(det=>{
    det.addEventListener('toggle',()=>{if(det.open)renderHistory();});
});
window.addEventListener('load', function(){
    async function checkTrophyBadge(){
        let badge = document.getElementById('trophyBadge');
        if(!badge) return;
        try{
            if(new Date().getDate() > 3){ badge.classList.remove('show'); return; } // only surface for the first few days of a new month
            let prevRaw = await kvGet(`${LB_PATH}/${prevMonth()}`);
            if(prevRaw && Object.keys(prevRaw).length) badge.classList.add('show');
            else badge.classList.remove('show');
        }catch(e){
            badge.classList.remove('show');
        }
    }
    checkTrophyBadge();
    setInterval(checkTrophyBadge, 5*60*1000);
});
