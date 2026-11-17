/* Eduquest XR — motor didáctico de derivadas. Sin eval() ni servicios externos. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = {
    family:"constant", params:{c:3,m:2,b:1,a:1,q:-2}, x:1,
    showOriginal:true, showDerivative:true, showTangent:true,
    animating:false, animationId:null, camera:null, hands:null, three:null,
    practiceScore:0, practiceIndex:0, finalIndex:0, finalScore:0
  };
  const families = {
    constant:{name:"Función constante",concept:"Una función constante mantiene el mismo valor para cualquier x. Su gráfica es horizontal y su pendiente no cambia.",rule:"d/dx(c) = 0",formula:p=>`f(x) = ${p.c}`,derivative:p=>"f′(x) = 0",f:(x,p)=>p.c,d:()=>0,steps:p=>[`Identificamos la constante c = ${p.c}.`,`La derivada de toda constante es cero.`,`Por tanto, f′(x) = 0.`],question:"Si la función no sube ni baja, ¿cuánto vale su pendiente?",answer:"Cero: la recta es horizontal."},
    identity:{name:"Función idéntica",concept:"La función idéntica asigna a cada número el mismo valor x. Su gráfica es una recta con pendiente constante igual a uno.",rule:"d/dx(x) = 1",formula:()=>"f(x) = x",derivative:()=>"f′(x) = 1",f:x=>x,d:()=>1,steps:()=>["Reconocemos la variable x elevada a la potencia 1.","Aplicamos la regla de la potencia: n·xⁿ⁻¹.","f′(x) = 1·x⁰ = 1."],question:"¿Qué representa el número 1 en la derivada?",answer:"La pendiente constante de la recta."},
    linear:{name:"Función lineal",concept:"En una función lineal la pendiente es constante. El parámetro m determina la inclinación y b indica el corte con el eje vertical.",rule:"d/dx(mx + b) = m",formula:p=>`f(x) = ${p.m}x ${p.b<0?"−":"+"} ${Math.abs(p.b)}`,derivative:p=>`f′(x) = ${p.m}`,f:(x,p)=>p.m*x+p.b,d:(x,p)=>p.m,steps:p=>["Derivamos cada término por separado.",`La derivada de ${p.m}x es ${p.m}.`,`La derivada de la constante ${p.b} es 0.`,`Resultado: f′(x) = ${p.m}.`],question:"¿Qué parámetro determina la pendiente de la recta?",answer:"El coeficiente m."},
    quadratic:{name:"Función cuadrática",concept:"La derivada de una función cuadrática es lineal. Permite conocer la pendiente en cada punto e identificar dónde la tangente es horizontal.",rule:"d/dx(ax² + bx + c) = 2ax + b",formula:p=>`f(x) = ${p.a}x² ${p.m<0?"−":"+"} ${Math.abs(p.m)}x ${p.b<0?"−":"+"} ${Math.abs(p.b)}`,derivative:p=>`f′(x) = ${2*p.a}x ${p.m<0?"−":"+"} ${Math.abs(p.m)}`,f:(x,p)=>p.a*x*x+p.m*x+p.b,d:(x,p)=>2*p.a*x+p.m,steps:p=>["Aplicamos la regla de la potencia al término cuadrático.",`La derivada de ${p.a}x² es ${2*p.a}x.`,`La derivada de ${p.m}x es ${p.m}.`,`La derivada de la constante es 0.`,`Resultado: f′(x) = ${2*p.a}x + (${p.m}).`],question:"¿Qué indica f′(x) = 0 en una función cuadrática?",answer:"Que la tangente es horizontal en ese punto."},
    rational:{name:"Funciones racionales",concept:"Las funciones racionales son cocientes de polinomios. Para derivarlas se identifica si conviene aplicar la regla del producto o la del cociente.",rule:"Producto: (uv)′ = u′v + uv′  |  Cociente: (u/v)′ = (u′v − uv′)/v²",formula:()=>"g(x) = (x + 1)/(x − 2)",derivative:()=>"g′(x) = −3/(x − 2)²",f:x=>Math.abs(x-2)<.08?NaN:(x+1)/(x-2),d:x=>Math.abs(x-2)<.08?NaN:-3/((x-2)**2),steps:()=>["Identificamos u = x + 1 y v = x − 2.","Derivamos: u′ = 1 y v′ = 1.","Aplicamos la regla del cociente: (u′v − uv′)/v².","Sustituimos: [(x − 2) − (x + 1)]/(x − 2)².","Simplificamos: g′(x) = −3/(x − 2)², con x ≠ 2."],question:"¿Qué condición debe cumplir el denominador?",answer:"Debe ser distinto de cero."}
  };
  const fmt = n => Number.isFinite(n) ? (Math.round(n*100)/100).toString() : "no definida";
  function showToast(msg){const t=$("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);}
  function setView(id){
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active-view",v.id===id));
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
    const active=document.querySelector(`.nav-item[data-view="${id}"]`);
    $("pageTitle").textContent=active?active.innerText.trim():"Laboratorio";
    $("sidebar").classList.remove("open");
    if(id==="lab") renderLab();
    if(id==="xr") renderXR();
  }
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-view]");
    if(b){e.preventDefault();setView(b.dataset.view);}
  });
  $("enterBtn")?.addEventListener("click",()=>{$("cover").classList.add("hidden");$("login").classList.remove("hidden");});
  $("loginForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    const name=$("studentName").value.trim(), email=$("studentEmail").value.trim();
    if(name.length<3||!email.includes("@")||!$("consent").checked){$("loginMsg").textContent="Verifica tus datos y acepta el uso académico.";return;}
    $("loginMsg").textContent="";
    $("login").classList.add("hidden");$("app").classList.remove("hidden");
    $("studentBadge").textContent=name;$("evalStudent").textContent=name;$("evalEmail").textContent=email;
    $("tutorWidget").classList.remove("hidden");
    showToast(`¡Bienvenida/o, ${name}!`);
  });
  $("logoutBtn")?.addEventListener("click",()=>{
    stopAnimation();stopCamera();$("tutorWidget").classList.add("hidden");$("tutorPanel").classList.add("hidden");
    $("app").classList.add("hidden");$("login").classList.remove("hidden");$("studentName").value="";$("studentEmail").value="";$("consent").checked=false;
  });
  $("menuBtn")?.addEventListener("click",()=>$("sidebar").classList.toggle("open"));
  $("contrastBtn")?.addEventListener("click",()=>document.documentElement.classList.toggle("hiContrast"));
  $("speakBtn")?.addEventListener("click",()=>speak($("pageTitle").textContent));
  $("speakConcepts")?.addEventListener("click",()=>speak("Explora las cinco familias de funciones y sus derivadas."));
  function speak(text){if("speechSynthesis"in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text));}}
  function parameterUI(){
    const configs={
      constant:[["c","Constante",-5,5,.5,3]],
      identity:[],
      linear:[["m","Pendiente m",-5,5,.5,2],["b","Intercepto b",-5,5,.5,1]],
      quadratic:[["a","Coeficiente a",-3,3,.25,1],["m","Coeficiente b",-5,5,.5,-2],["b","Constante c",-5,5,.5,1]],
      rational:[]
    };
    $("parameterControls").innerHTML=(configs[state.family]||[]).map(([k,label,min,max,step,val])=>`<label>${label}<input type="range" data-param="${k}" min="${min}" max="${max}" step="${step}" value="${state.params[k]??val}"><output>${state.params[k]??val}</output></label>`).join("")||'<p class="muted small">Esta familia utiliza un ejemplo definido.</p>';
    $("parameterControls").querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>{state.params[input.dataset.param]=Number(input.value);input.nextElementSibling.textContent=input.value;renderLab();}));
  }
  function renderLab(){
    const f=families[state.family],p=state.params,x=state.x;
    if(!f||!$("derivativePlot"))return;
    $("lessonName").textContent=f.name;$("conceptText").textContent=f.concept;
    $("functionFormula").textContent=f.formula(p);$("derivativeFormula").textContent=f.derivative(p);
    $("ruleText").textContent=f.rule;$("stepsList").innerHTML=f.steps(p).map(s=>`<li>${s}</li>`).join("");
    $("reflectionQuestion").textContent=f.question;
    $("xPoint").value=x;$("xPointLabel").textContent=fmt(x);
    const slope=f.d(x,p);$("slopeValue").textContent=fmt(slope);
    $("labInterpretation").textContent=state.family==="rational"&&Math.abs(x-2)<.08?"En x = 2 la función no está definida; selecciona otro punto.":`En x = ${fmt(x)}, la pendiente instantánea es ${fmt(slope)}. ${slope>0?"La función crece localmente.":slope<0?"La función decrece localmente.":"La tangente es horizontal."}`;
    const xs=Array.from({length:241},(_,i)=>-6+i*.05),ys=xs.map(v=>f.f(v,p)),ds=xs.map(v=>f.d(v,p));
    const traces=[];
    if(state.showOriginal)traces.push({x:xs,y:ys,type:"scatter",mode:"lines",name:"f(x)",line:{color:"#00C2FF",width:3},connectgaps:false});
    if(state.showDerivative)traces.push({x:xs,y:ds,type:"scatter",mode:"lines",name:"f′(x)",line:{color:"#B8EF2B",width:3,dash:"dot"},connectgaps:false});
    if(state.showTangent&&Number.isFinite(slope)){
      const y0=f.f(x,p),tx=[x-2,x+2],ty=tx.map(v=>y0+slope*(v-x));
      traces.push({x:tx,y:ty,type:"scatter",mode:"lines",name:"Tangente",line:{color:"#FF7A1A",width:2,dash:"dash"}});
      traces.push({x:[x],y:[y0],type:"scatter",mode:"markers",name:"Punto",marker:{color:"#FFFFFF",size:10,line:{color:"#FF7A1A",width:3}}});
    }
    if(window.Plotly)Plotly.react("derivativePlot",traces,{paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(4,18,31,.55)",font:{color:"#F7FBFF"},margin:{l:48,r:20,t:24,b:45},xaxis:{title:"x",gridcolor:"rgba(255,255,255,.12)",zerolinecolor:"#789"},yaxis:{title:"y",gridcolor:"rgba(255,255,255,.12)",zerolinecolor:"#789"},legend:{orientation:"h",y:1.12},uirevision:"eduquest"},{responsive:true,displaylogo:false});
  }
  document.querySelectorAll(".module-btn").forEach(btn=>btn.addEventListener("click",()=>{
    state.family=btn.dataset.family;document.querySelectorAll(".module-btn").forEach(b=>b.classList.toggle("active",b===btn));parameterUI();renderLab();
  }));
  $("xPoint")?.addEventListener("input",e=>{state.x=Number(e.target.value);renderLab();});
  [["showOriginal","showOriginal"],["showDerivative","showDerivative"],["showTangent","showTangent"]].forEach(([id,key])=>$(id)?.addEventListener("change",e=>{state[key]=e.target.checked;renderLab();}));
  $("resetLab")?.addEventListener("click",()=>{state.x=1;state.params={c:3,m:2,b:1,a:1,q:-2};parameterUI();renderLab();});
  function stopAnimation(){state.animating=false;if(state.animationId)cancelAnimationFrame(state.animationId);state.animationId=null;if($("animatePoint"))$("animatePoint").textContent="▶ Animar punto";}
  $("animatePoint")?.addEventListener("click",()=>{
    if(state.animating){stopAnimation();return;}state.animating=true;$("animatePoint").textContent="Ⅱ Pausar";
    let t=0;const tick=()=>{if(!state.animating)return;t+=.025;state.x=-4+((t%8));$("xPoint").value=state.x;renderLab();state.animationId=requestAnimationFrame(tick);};tick();
  });
  function initConcepts(){
    const cards=Object.entries(families).map(([key,f],i)=>`<article class="card"><b>0${i+1} · ${key==="rational"?"REGLAS": "FUNCIÓN"}</b><strong>${f.name}</strong><p>${f.concept}</p><code>${f.derivative(state.params)}</code><button class="btn outline small" data-open-family="${key}">Explorar</button></article>`).join("");
    $("conceptGrid").innerHTML=cards;
    $("conceptGrid").querySelectorAll("[data-open-family]").forEach(b=>b.addEventListener("click",()=>{state.family=b.dataset.openFamily;document.querySelectorAll(".module-btn").forEach(x=>x.classList.toggle("active",x.dataset.family===state.family));parameterUI();setView("lab");}));
  }
  // Exercise bank limited to the five requested families.
  const questions=[
    ["La derivada de f(x)=7 es:",["0","1","7","x"],0,"La derivada de una constante siempre es cero."],
    ["La derivada de f(x)=x es:",["0","1","x","2x"],1,"La derivada de x es uno."],
    ["Si f(x)=4x+3, entonces f′(x) es:",["4x","3","4","7"],2,"La pendiente m=4 permanece constante."],
    ["Si f(x)=x²−5x+2, entonces f′(x) es:",["2x−5","x−5","2x+5","x²−5"],0,"Deriva término a término: 2x−5."],
    ["¿Qué regla se aplica a (x²+1)(x+3)?",["Potencia","Producto","Cociente","Constante"],1,"Es el producto de dos funciones."],
    ["Para derivar (x+1)/(x−2) se utiliza:",["Producto","Cociente","Identidad","Suma"],1,"Es una división de dos funciones."],
    ["La derivada de 3x²+2x es:",["6x+2","3x+2","6x","3x²"],0,"La derivada es 6x+2."],
    ["Si f′(x)=0 en un punto, la tangente allí es:",["Vertical","Horizontal","Curva","No existe siempre"],1,"Pendiente cero significa tangente horizontal."]
  ];
  function renderQuestion(){
    const q=questions[state.practiceIndex%questions.length];$("question").innerHTML=`<b>Pregunta ${state.practiceIndex%questions.length+1} de ${questions.length}</b><p>${q[0]}</p>`;
    $("answers").innerHTML=q[1].map((a,i)=>`<button class="answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join("");
    $("exerciseFeedback").textContent="Selecciona una respuesta.";
    $("answers").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if($("answers").dataset.done)return;$("answers").dataset.done="1";const ok=Number(b.dataset.answer)===q[2];b.classList.add(ok?"correct":"wrong");if(ok)state.practiceScore+=10;$("practiceScore").textContent=state.practiceScore;$("exerciseFeedback").textContent=(ok?"¡Correcto! ":"Revisa: ")+q[3];}));
  }
  $("nextQuestion")?.addEventListener("click",()=>{state.practiceIndex++;$("answers").dataset.done="";renderQuestion();});
  $("resetPractice")?.addEventListener("click",()=>{state.practiceIndex=0;state.practiceScore=0;$("practiceScore").textContent="0";$("answers").dataset.done="";renderQuestion();});
  $("generateChallenge")?.addEventListener("click",()=>{
    const type=$("genType").value;
    const items={quadratic:"f(x) = 2x² − 3x + 4. Encuentra f′(x).",linear:"f(x) = −3x + 5. Encuentra f′(x).",rational:"g(x) = (x + 1)/(x − 2). Deriva usando la regla del cociente."};
    $("generatedChallenge").textContent=items[type]||items.quadratic;
  });
  // Local tutor: safe, constrained to the requested derivative content.
  function tutorAnswer(raw){
    const q=raw.toLowerCase();
    if(/hola|buenas/.test(q))return "¡Hola! Estoy aquí para ayudarte a comprender las derivadas. ¿Qué función quieres estudiar?";
    if(/constante/.test(q))return "La derivada de una constante c es cero: si f(x)=c, entonces f′(x)=0. Su gráfica es horizontal.";
    if(/idéntica|identica|f\\(x\\)\\s*=\\s*x/.test(q))return "Para f(x)=x, aplicamos la regla de la potencia: f′(x)=1·x⁰=1.";
    if(/lineal|mx/.test(q))return "Si f(x)=mx+b, entonces f′(x)=m. La pendiente no cambia y la constante b deriva a cero.";
    if(/cuadrática|cuadratica|x\\^2|x²/.test(q))return "Para f(x)=ax²+bx+c, derivamos término a término: f′(x)=2ax+b. La pendiente depende de x.";
    if(/producto/.test(q))return "Regla del producto: (uv)′=u′v+uv′. Deriva cada factor y sustituye en la fórmula.";
    if(/cociente|racional/.test(q))return "Regla del cociente: (u/v)′=(u′v−uv′)/v², siempre que v(x)≠0.";
    if(/tangente|pendiente/.test(q))return "La pendiente de la recta tangente en x=a es f′(a). La ecuación es y=f(a)+f′(a)(x−a).";
    if(/ejemplo|resolver|paso/.test(q))return "Ejemplo: f(x)=3x²+2x−4. Derivamos: 3·2x + 2·1 − 0. Resultado: f′(x)=6x+2.";
    return "Puedo ayudarte con función constante, idéntica, lineal, cuadrática, regla del producto, regla del cociente, pendiente y recta tangente. Formula tu duda usando uno de esos temas.";
  }
  $("tutorToggle")?.addEventListener("click",()=>$("tutorPanel").classList.toggle("hidden"));
  $("closeTutor")?.addEventListener("click",()=>$("tutorPanel").classList.add("hidden"));
  $("tutorForm")?.addEventListener("submit",e=>{e.preventDefault();const value=$("tutorInput").value.trim();if(!value)return;const box=$("tutorMessages");box.insertAdjacentHTML("beforeend",`<p class="user-message"></p>`);box.lastElementChild.textContent=value;const answer=tutorAnswer(value);box.insertAdjacentHTML("beforeend",`<p class="bot-message"></p>`);box.lastElementChild.textContent=answer;$("tutorInput").value="";box.scrollTop=box.scrollHeight;});
  // Final assessment: ten items, one at a time.
  const finalQs=[...questions,["La derivada de 5x² es:",["5x","10x","10","x²"],1,"La regla de potencia da 10x."],["¿Cuál es la derivada de una función lineal?",["Una constante","Una cuadrática","Cero siempre","La misma función"],0,"La derivada es la pendiente m."]];
  function renderFinal(){const q=finalQs[state.finalIndex];$("finalProgress").textContent=`${state.finalIndex}/10`;$("finalQuestion").innerHTML=`<b>Pregunta ${state.finalIndex+1} de 10</b><p>${q[0]}</p>`;$("finalAnswers").innerHTML=q[1].map((a,i)=>`<button class="answer" data-final="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join("");$("finalFeedback").textContent="Elige una respuesta y pulsa Responder.";}
  $("finalNext")?.addEventListener("click",()=>{const selected=$("finalAnswers").querySelector(".answer.selected");if(!selected){$("finalFeedback").textContent="Selecciona una opción.";return;}const q=finalQs[state.finalIndex],ok=Number(selected.dataset.final)===q[2];if(ok)state.finalScore++;$("finalFeedback").textContent=(ok?"Correcto. ":"Respuesta: ")+q[3];state.finalIndex++;if(state.finalIndex<10){renderFinal();}else{$("finalProgress").textContent="10/10";$("finalScore").textContent=`${state.finalScore*10}/100`;$("finalCertificate").classList.remove("hidden");$("finalCertificate").innerHTML=`<h2>Evaluación completada</h2><p>Resultado: <strong>${state.finalScore*10}/100</strong></p><p>${state.finalScore>=6?"¡Buen trabajo! Continúa practicando.":"Repasa las reglas y vuelve a intentarlo."}</p>`;$("finalNext").disabled=true;}});
  $("finalAnswers")?.addEventListener("click",e=>{const b=e.target.closest("[data-final]");if(!b)return;$("finalAnswers").querySelectorAll(".answer").forEach(x=>x.classList.remove("selected"));b.classList.add("selected","correct");});
  $("finalRestart")?.addEventListener("click",()=>{state.finalIndex=0;state.finalScore=0;$("finalNext").disabled=false;$("finalCertificate").classList.add("hidden");$("finalScore").textContent="—";renderFinal();});
  // Teacher form, local export/import and clipboard.
  $("teacherForm")?.addEventListener("submit",e=>{e.preventDefault();const data={title:$("lessonTitle").value,level:$("lessonLevel").value,time:$("lessonTime").value,objective:$("lessonObjective").value,question:$("lessonQuestion").value,evidence:$("lessonEvidence").value};$("lessonOutput").innerHTML=`<h4>${escapeHtml(data.title)}</h4><p><b>Objetivo:</b> ${escapeHtml(data.objective)}</p><p><b>Reto:</b> ${escapeHtml(data.question)}</p><p><b>Evidencia:</b> ${escapeHtml(data.evidence)}</p>`;localStorage.setItem("eduquestLesson",JSON.stringify(data));});
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  $("clearLesson")?.addEventListener("click",()=>{$("teacherForm").reset();$("lessonOutput").textContent="Completa el formulario para generar el guion.";});
  $("exportLesson")?.addEventListener("click",()=>download("eduquest-secuencia.json",localStorage.getItem("eduquestLesson")||"{}","application/json"));
  $("importLesson")?.addEventListener("change",async e=>{try{const obj=JSON.parse(await e.target.files[0].text());for(const [k,id] of Object.entries({title:"lessonTitle",level:"lessonLevel",time:"lessonTime",objective:"lessonObjective",question:"lessonQuestion",evidence:"lessonEvidence"}))if(obj[k]!=null)$(id).value=obj[k];showToast("Secuencia importada.");}catch{showToast("No se pudo leer el archivo JSON.");}});
  $("copyLesson")?.addEventListener("click",()=>navigator.clipboard?.writeText($("lessonOutput").innerText).then(()=>showToast("Guion copiado."),()=>showToast("No fue posible copiar.")));
  function download(name,content,type){const a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
  // Optional 3D curve built with Three.js. It is supplementary; 2D Plotly remains primary.
  function initThree(){
    const host=$("threeStage");if(!host||!window.THREE||state.three)return;
    try{
      const scene=new THREE.Scene();scene.background=new THREE.Color("#020b16");
      const camera=new THREE.PerspectiveCamera(45,host.clientWidth/host.clientHeight,.1,100);camera.position.set(0,1.8,8);
      const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(host.clientWidth,host.clientHeight);host.appendChild(renderer.domElement);
      const grid=new THREE.GridHelper(10,20,0x00c2ff,0x24445a);grid.position.y=-1.2;scene.add(grid);
      const points=[];for(let x=-4;x<=4;x+=.05)points.push(new THREE.Vector3(x,Math.sin(x)*.8,0));
      const geometry=new THREE.BufferGeometry().setFromPoints(points),material=new THREE.LineBasicMaterial({color:0x00c2ff});
      const curve=new THREE.Line(geometry,material);scene.add(curve);scene.add(new THREE.AmbientLight(0xffffff,1));
      const animate=()=>{if(!host.isConnected)return;curve.rotation.y+=.001;renderer.render(scene,camera);requestAnimationFrame(animate);};animate();
      state.three={renderer,scene,camera};
      new ResizeObserver(()=>{if(!host.clientWidth)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);}).observe(host);
    }catch(err){console.warn("Three.js no disponible",err);}
  }
  function renderXR(){initThree();if(window.Plotly){const xs=Array.from({length:101},(_,i)=>-5+i*.1);Plotly.react("xrPlot",[{x:xs,y:xs.map(x=>x*x/5),type:"scatter",mode:"lines",name:"f(x)=x²/5",line:{color:"#00C2FF",width:3}}],{paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(4,18,31,.55)",font:{color:"#fff"},margin:{l:35,r:10,t:15,b:35}},{responsive:true,displaylogo:false});}}
  // MediaPipe hand gestures: pinch updates x, fist resets; mouse/slider remain fully usable.
  async function startCamera(){
    const video=$("gestureVideo"),canvas=$("gestureCanvas"),ctx=canvas.getContext("2d");
    if(!navigator.mediaDevices?.getUserMedia){$("gestureStatus").textContent="Este navegador no permite acceder a la cámara. Usa los controles alternativos.";return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:640,height:480},audio:false});video.srcObject=stream;await video.play();
      if(!window.Hands||!window.Camera){$("gestureStatus").textContent="MediaPipe no cargó. Los controles táctiles y mouse siguen disponibles.";return;}
      const hands=new Hands({locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
      hands.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:.65,minTrackingConfidence:.6});
      hands.onResults(results=>{
        canvas.width=results.image.width;canvas.height=results.image.height;ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(results.image,0,0,canvas.width,canvas.height);
        const lm=results.multiHandLandmarks||[];
        if(lm.length){
          const hand=lm[0],thumb=hand[4],index=hand[8],pinch=Math.hypot(thumb.x-index.x,thumb.y-index.y);
          const fingers=[8,12,16,20].filter(t=>hand[t].y<hand[t-2].y).length;
          if(pinch<.06){state.x=Math.max(-4,Math.min(4,(index.x-.5)*-8));$("xPoint").value=state.x;renderLab();$("gestureStatus").textContent="Pinza detectada: moviendo el punto de tangencia.";}
          else if(fingers===0){state.x=1;$("xPoint").value=1;renderLab();$("gestureStatus").textContent="Puño detectado: vista restablecida.";}
          else if(fingers>=4){$("gestureStatus").textContent="Palma abierta: mano reconocida. Mueve la mano para explorar.";}
          else $("gestureStatus").textContent="Mano reconocida. Prueba una pinza para mover x.";
        }else $("gestureStatus").textContent="Buscando manos…";
        ctx.restore();
      });
      const camera=new Camera(video,{onFrame:async()=>hands.send({image:video}),width:640,height:480});camera.start();
      state.camera={stream,camera,hands};$("gestureStatus").textContent="Cámara activa. MediaPipe está buscando tus manos.";
    }catch(err){$("gestureStatus").textContent=`No se pudo activar la cámara: ${err.message}. Puedes continuar con mouse y controles.`;}
  }
  function stopCamera(){if(state.camera){state.camera.camera.stop();state.camera.stream.getTracks().forEach(t=>t.stop());state.camera.hands.close();state.camera=null;}if($("gestureVideo"))$("gestureVideo").srcObject=null;if($("gestureCanvas"))$("gestureCanvas").getContext("2d").clearRect(0,0,$("gestureCanvas").width,$("gestureCanvas").height);if($("gestureStatus"))$("gestureStatus").textContent="Cámara desactivada. Puedes usar mouse, teclado y controles táctiles.";}
  $("startCamera")?.addEventListener("click",startCamera);$("stopCamera")?.addEventListener("click",stopCamera);
  $("xrLaunch")?.addEventListener("click",async()=>{if(navigator.xr){try{const ok=await navigator.xr.isSessionSupported("immersive-vr");showToast(ok?"Tu navegador admite WebXR. Usa el botón VR de la escena.":"WebXR inmersivo no está disponible; continúa con la escena 3D.");}catch{showToast("WebXR no está disponible; usa la alternativa 3D.");}}else showToast("WebXR no está disponible en este navegador; usa la escena 3D.");});
  $("xrFallback")?.addEventListener("click",renderXR);
  $("drawGeometry")?.addEventListener("click",()=>setView("lab"));
  $("downloadGraph")?.addEventListener("click",()=>{if(window.Plotly)Plotly.downloadImage("derivativePlot",{format:"png",filename:"eduquest-derivadas"});});
  // Initialization and feature status.
  parameterUI();initConcepts();renderLab();renderQuestion();renderFinal();
  $("mathStatus").textContent=window.math?"Motor matemático disponible":"Motor gráfico activo";
  $("mathDot").classList.add("ok");$("xrStatus").textContent=window.THREE?"Three.js disponible":"3D opcional";$("xrDot").classList.toggle("ok",!!window.THREE);
  if($("compareRows"))$("compareRows").innerHTML=[1,2,3].map(i=>`<div class="form-grid"><label>Función ${i}<input id="cmpF${i}" placeholder="Ej. x^2 + 3*x"></label><label>Tu derivada<input id="cmpD${i}" placeholder="Ej. 2*x"></label></div>`).join("");
  $("checkAll")?.addEventListener("click",()=>{
    if(!window.math){$("compareResult").textContent="El motor math.js no está disponible.";return;}
    const results=[];for(let i=1;i<=3;i++){const f=$(`cmpF${i}`).value.trim(),d=$(`cmpD${i}`).value.trim();if(!f&&!d)continue;try{const derivative=math.derivative(f,"x").toString();results.push(`Función ${i}: derivada calculada = ${derivative}. ${d?"Compara tu respuesta con este resultado.":""}`);}catch{results.push(`Función ${i}: no se pudo interpretar la expresión.`);}}
    $("compareResult").textContent=results.join("\\n")||"Escribe al menos una función.";
  });
  $("finalRestart")?.click();
})();