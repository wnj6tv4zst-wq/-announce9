const P=["ピッチャー","キャッチャー","ファースト","セカンド","サード","ショート","レフト","センター","ライト"];
const A=[
["1","宮田たいせい"],["2","北濱いつき"],["3","上野きしん"],
["4","久田ゆうと"],["5","山崎はると"],["6","川元きざし"],
["7","天徳寺りき"],["8","田畑かいと"],["9","竹平かずき"],
["10","久田ひろと"],["11","稲川あん"],["12","北濱なお"],
["13","山崎ゆいと"]
];

const L=[
["1","10","久田ひろと"],["2","1","宮田たいせい"],
["3","2","北濱いつき"],["4","3","上野きしん"],
["5","6","川元きざし"],["6","5","山崎はると"],
["7","7","天徳寺りき"],["8","4","久田ゆうと"],
["9","9","竹平かずき"]
];

let D={
"ピッチャー":["6","川元きざし"],
"キャッチャー":["2","北濱いつき"],
"ファースト":["3","上野きしん"],
"セカンド":["5","山崎はると"],
"サード":["4","久田ゆうと"],
"ショート":["10","久田ひろと"],
"レフト":["7","天徳寺りき"],
"センター":["1","宮田たいせい"],
"ライト":["9","竹平かずき"]
};

let gs=0,gi=null,br=0,bi=null,h=[];

const $=x=>document.getElementById(x);
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
const say=t=>$("out").textContent=t;

function log(t){
 h.unshift(new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})+" "+t);
 $("history").innerHTML=h.map(x=>"・"+x).join("<br>");
}

function init(){
 let o=A.map(x=>`<option value="${x[0]}|${x[1]}">${x[0]}番 ${x[1]}</option>`).join("");
 ["changePlayer","outPlayer","inPlayer"].forEach(x=>$(x).innerHTML=o);

 $("batter").innerHTML=L.map((x,i)=>
 `<option value="${i}">${x[0]}番 背番号${x[1]} ${x[2]}</option>`
 ).join("");

 let po=P.map(x=>`<option>${x}</option>`).join("");
 $("changePos").innerHTML=po;
 $("inPos").innerHTML='<option value="">選択なし</option>'+po;
 renderDefense();
}

function renderDefense(){
 $("defTable").innerHTML="<tr><th>守備</th><th>選手</th></tr>"+
 P.map(x=>`<tr><td>${x}</td><td>${D[x][0]}番 ${D[x][1]}くん</td></tr>`).join("");
}

function getPlayer(id){
 let x=$(id).value.split("|");
 return x;
}

function startGameTimer(){
 if(gi)return;
 gi=setInterval(()=>{
  gs++;
  $("gameTimer").textContent=fmt(gs);
 },1000);
 log("試合開始");
}

function stopGameTimer(){
 clearInterval(gi);
 gi=null;
}

function resetGameTimer(){
 stopGameTimer();
 gs=0;
 $("gameTimer").textContent="00:00";
}

function startBreak(sec,name){
 clearInterval(bi);
 br=sec;
 $("breakTimer").textContent=fmt(br);

 say(`ただいまより${name}を設けます。
選手の皆さんは休憩し、水分補給をお願いいたします。`);

 log(name+"開始");

 bi=setInterval(()=>{
  br--;
  $("breakTimer").textContent=fmt(Math.max(br,0));

  if(br<=0){
   clearInterval(bi);
   bi=null;
   if(navigator.vibrate)navigator.vibrate([200,100,200]);

   say(`${name}を終了します。
まもなく試合を再開いたします。`);
  }
 },1000);
}

function pauseBreak(){
 clearInterval(bi);
 bi=null;
}

function restartGame(){
 say("まもなく試合を再開いたします。選手の皆さんは守備位置についてください。");
}

function nextBatter(){
 let x=L[Number($("batter").value)];
 say(`次は、${x[0]}番、背番号${x[1]}、${x[2]}くん。`);
}

function advanceBatter(){
 let b=$("batter");
 b.value=(Number(b.value)+1)%L.length;
 nextBatter();
}

function changeDefense(){
 let pos=$("changePos").value;
 let n=getPlayer("changePlayer");
 let old=D[pos];

 D[pos]=n;
 renderDefense();

 say(`守備位置の変更をお知らせします。
${pos}、${old[1]}くんに代わりまして、
${n[0]}番、${n[1]}くんが入ります。`);

 log(pos+" "+old[1]+"→"+n[1]);
}

function playerChange(){
 let o=getPlayer("outPlayer");
 let n=getPlayer("inPlayer");
 let pos=$("inPos").value;

 if(pos){
  D[pos]=n;
  renderDefense();
 }

 let t=`選手の交代をお知らせします。
${o[0]}番、${o[1]}くんに代わりまして、
${n[0]}番、${n[1]}くんが入ります。`;

 if(pos)t+=`
守備位置は${pos}です。`;

 say(t);
 log("選手交代 "+o[1]+"→"+n[1]);
}

function correction(){
 let w=$("wrongText").value||"〇〇";
 let c=$("correctText").value||"△△";

 say(`訂正いたします。
先ほどのアナウンスは、${w}ではなく、${c}でした。
失礼いたしました。`);
}

function preset(k){
 let T={
 start:"ただいまより、試合を開始いたします。",
 end:"これで試合を終了いたします。ありがとうございました。",
 foul:"ファウルボールには十分ご注意ください。",
 heat:"気温が高くなっております。こまめな水分補給をお願いいたします。",
 lastInning:"規定時間となりましたので、この回が最終回となります。",
 gameEndTime:"規定時間となりましたので、本イニングをもちまして試合終了となります。",
 tiebreak:"ただいまより大会規定により、タイブレークを行います。",
 tiebreak12:"ただいまより大会規定により、タイブレークを行います。無死一・二塁から試合を開始いたします。"
 };
 say(T[k]);
}

async function copyText(){
 try{
  await navigator.clipboard.writeText($("out").textContent);
  alert("コピーしました！");
 }catch(e){
  alert("長押ししてコピーしてください");
 }
}

function speakText(){
 if(!("speechSynthesis" in window))return;

 let u=new SpeechSynthesisUtterance($("out").textContent);
 u.lang="ja-JP";
 speechSynthesis.cancel();
 speechSynthesis.speak(u);
}

init();
