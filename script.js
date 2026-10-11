const $=id=>document.getElementById(id), USE="ss_v3_used", HIST="ss_v3_history";
const used=()=>Number(localStorage.getItem(USE)||0), left=()=>Math.max(0,5-used());
function refresh(){$("free").textContent=left()} refresh();
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.view").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("item").oninput=()=>$("count").textContent=$("item").value.length+"/60";
function history(){try{return JSON.parse(localStorage.getItem(HIST)||"[]")}catch{return[]}}
function saveHistory(x){localStorage.setItem(HIST,JSON.stringify([x,...history()].slice(0,20)));renderHistory()}
function renderHistory(){let h=history();$("historyList").innerHTML=h.length?h.map(x=>`<div class="hist"><b>${escapeHtml(x.title)}</b><br><small>${escapeHtml(x.date)}</small></div>`).join(""):'<div class="empty">История пока пустая.</div>'}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
renderHistory(); $("clearHistory").onclick=()=>{localStorage.removeItem(HIST);renderHistory()};
$("limitClose").onclick=()=>$("limit").classList.add("hidden");
$("generate").onclick=()=>{let item=$("item").value.trim();if(!item)return $("item").focus();if(!left())return $("limit").classList.remove("hidden");
let brand=$("brand").value.trim(),size=$("size").value.trim(),cat=$("category").value,cond=$("condition").value,d=$("details").value.trim(),title=[brand,item,size].filter(Boolean).join(" · ");
let desc=`${title}\n\nСостояние: ${cond.toLowerCase()}.\nКатегория: ${cat.toLowerCase()}.`+(d?`\n\nПодробности: ${d}.`:"")+`\n\nГотово к продаже.`;
let tags=[item,brand,cat,size,"продажа"].filter(Boolean).map(v=>"#"+v.toLowerCase().replace(/[^а-яёa-z0-9]+/gi,""));
localStorage.setItem(USE,used()+1);refresh();$("title").textContent=title;$("desc").textContent=desc;$("tags").innerHTML=tags.map(t=>`<span>${escapeHtml(t)}</span>`).join("");$("empty").classList.add("hidden");$("result").classList.remove("hidden");window.copyText=title+"\n\n"+desc+"\n\n"+tags.join(" ");saveHistory({title,date:new Date().toLocaleString("ru-RU")})};
$("copy").onclick=async()=>{await navigator.clipboard.writeText(window.copyText||"");$("copy").textContent="Скопировано ✓";setTimeout(()=>$("copy").textContent="Скопировать всё",1200)};
$("photoFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let u=URL.createObjectURL(f);$("preview").src=u;$("preview").classList.remove("hidden");$("photoEmpty").textContent="Фото выбрано. Нажми «Подготовить карточку»."};
$("preparePhoto").onclick=()=>{if(!$("photoFile").files[0])return alert("Сначала выбери фото товара.");$("photoEmpty").classList.add("hidden");$("photoReady").classList.remove("hidden");$("photoSummary").textContent="Режим: "+$("photoMode").value+". Пожелания: "+($("photoPrompt").value.trim()||"без дополнительных пожеланий")};
