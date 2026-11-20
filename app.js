const STORAGE_KEY = "sales-control-v1";
const GOAL_KEY = "sales-control-goal-v1";
const money = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
const readSales = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
let sales = readSales();
const byId = id => document.getElementById(id);
const dialog = byId("sale-dialog");
const today = new Date();
byId("sale-date").value = [today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
function render(){
  const active = sales.filter(s => s.status !== "Cancelada");
  const total = active.reduce((sum,s) => sum + s.amount,0);
  const goal = Number(localStorage.getItem(GOAL_KEY) || 0);
  const pct = goal > 0 ? Math.min(100,Math.round(total/goal*100)) : 0;
  byId("sales-count").textContent = active.length;
  byId("revenue").textContent = money(total);
  byId("goal-progress").textContent = goal ? pct+"%" : "—";
  byId("goal-caption").textContent = goal ? money(Math.max(0,goal-total))+" restantes" : "Defina sua meta mensal";
  byId("goal-value").textContent = money(goal);
  byId("goal-input").value = goal || "";
  byId("progress-bar").style.width = pct+"%";
  byId("goal-hint").textContent = goal ? money(total)+" de "+money(goal)+" registrados neste período." : "Cadastre uma meta para acompanhar o progresso.";
  const rows = [...sales].sort((a,b)=>b.createdAt-a.createdAt).slice(0,8);
  byId("sales-list").innerHTML = rows.length ? rows.map(s=>'<tr><td>'+escapeHtml(s.customer)+'</td><td>'+new Date(s.date+"T12:00:00").toLocaleDateString("pt-BR")+'</td><td>'+s.type+'</td><td><b>'+money(s.amount)+'</b></td></tr>').join("") : '<tr><td colspan="4" class="empty">Nenhuma venda registrada.</td></tr>';
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
byId("new-sale").addEventListener("click",()=>dialog.showModal());
byId("close-dialog").addEventListener("click",()=>dialog.close());
byId("cancel-dialog").addEventListener("click",()=>dialog.close());
byId("sale-form").addEventListener("submit",event=>{
  event.preventDefault();
  const customer=byId("customer").value.trim();
  const amount=Number(byId("amount").value);
  const date=byId("sale-date").value;
  if(!customer||!Number.isFinite(amount)||amount<=0||!date)return;
  sales.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),customer,amount:Math.round(amount*100)/100,date,type:byId("sale-type").value,status:"Registrada",createdAt:Date.now()});
  localStorage.setItem(STORAGE_KEY,JSON.stringify(sales));
  byId("sale-form").reset();
  byId("sale-date").value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
  dialog.close();render();
});
byId("save-goal").addEventListener("click",()=>{
  const value=Number(byId("goal-input").value);
  if(!Number.isFinite(value)||value<0){alert("Informe uma meta válida.");return;}
  localStorage.setItem(GOAL_KEY,String(Math.round(value*100)/100));render();
});
byId("see-all").addEventListener("click",()=>document.querySelector("#vendas").scrollIntoView({behavior:"smooth"}));
render();