(() => {
  const scenarios = {
    support:{
      query:'How do I reset SSO after replacing my phone?',confidence:'96% confidence',purpose:'Support / known answer',complexity:'Low',dataClass:'Internal',reuse:'High · 0.96',
      policy:['Standard support','tenant-scoped access'],cache:['Policy-aware reuse','effective-at time · version match'],quality:['Verified answer','source required'],budget:['Low budget','under $0.001'],
      trace:'support_faq → semantic_hit(.96) → policy_version_match → serve',tokens:'420 <small>/ 3,200</small>',latency:'84 ms',cost:'−93%',hit:true,
      nodes:[
        ['Admit request','Known support intent is safe for automated handling.','allow','neutral'],
        ['Build minimal context','Keep identity, product tier, and the current SSO policy.','420 tokens','save'],
        ['Reuse approved','Cached answer matches the policy version effective at request time.','version matched','save'],
        ['Skip model routing','Cached answer already clears the quality threshold.','no model call','save'],
        ['Serve cached answer','Attach source version and an escalation option.','84 ms','save'],
        ['Record avoided call','Attribute saved cost while monitoring user resolution.','−93% cost','save']
      ]
    },
    analysis:{
      query:'Compare conversion rate by region and explain last week’s drop.',confidence:'92% confidence',purpose:'Analytics / live data',complexity:'Medium',dataClass:'Internal · live',reuse:'Low · changing data',
      policy:['Analytics access','row-level permissions'],cache:['Read bypassed','fresh result required'],quality:['Grounded analysis','figures must reconcile'],budget:['Medium budget','under $0.04'],
      trace:'analytics → live_data → balanced_model + sql_tool → reconcile',tokens:'4,180 <small>/ 7,900</small>',latency:'2.8 s',cost:'−38%',hit:false,
      nodes:[
        ['Authorize data access','Confirm the user can read regional conversion data.','rows permitted','protect'],
        ['Assemble schema context','Send metric definitions and relevant tables—not raw history.','−47% context','save'],
        ['Require fresh result','Semantic reuse is rejected because the metrics changed.','cache bypass','protect'],
        ['Route balanced plan','Choose a tool-capable model that clears the analysis quality floor.','balanced model','spend'],
        ['Run SQL + explain','Query governed tables, then produce the narrative from returned rows.','tool + model','spend'],
        ['Reconcile figures','Check totals, attach query lineage, and write an evidence-scoped result.','quality · .91','protect']
      ]
    },
    planning:{
      query:'Build a 90-day launch plan across product, sales, and support.',confidence:'89% confidence',purpose:'Strategic planning',complexity:'High',dataClass:'Internal',reuse:'Very low · novel task',
      policy:['Standard business','cross-team context'],cache:['Reuse denied','novel deliverable'],quality:['High reasoning','critic pass required'],budget:['High-value budget','under $0.18'],
      trace:'strategic_plan → curated_context → reasoning_model → critic_pass',tokens:'12,600 <small>/ 21,400</small>',latency:'8.4 s',cost:'+14%',hit:false,
      nodes:[
        ['Admit high-value task','Expected planning value justifies a larger inference budget.','value: high','spend'],
        ['Curate planning context','Select goals, constraints, owners, and dependencies; compress history.','−41% context','save'],
        ['Reject prior answers','Similar plans are evidence only—not reusable final responses.','novel output','protect'],
        ['Route reasoning model','Pay for deeper planning because cheaper routes miss dependencies.','reasoning route','spend'],
        ['Generate + critique','Draft milestones, then run a focused critic for gaps and conflicts.','two passes','spend'],
        ['Score plan utility','Record acceptance and edits; do not cache the personalized output.','learn only','neutral']
      ]
    },
    sensitive:{
      query:'Summarize this employee’s medical accommodation request.',confidence:'98% confidence',purpose:'Sensitive summarization',complexity:'Medium',dataClass:'Restricted · health',reuse:'None · prohibited',
      policy:['Restricted workflow','need-to-know access'],cache:['Read/write disabled','sensitive content'],quality:['Approved processing','redaction required'],budget:['Governed budget','cost is secondary'],
      trace:'restricted_data → isolated_context → approved_model → redact + audit',tokens:'2,240 <small>/ 3,100</small>',latency:'1.9 s',cost:'policy-first',hit:false,
      nodes:[
        ['Apply restricted policy','Require authorized role and a valid processing purpose.','restricted','protect'],
        ['Isolate private context','Keep content inside the approved boundary with minimal fields.','local scope','protect'],
        ['Disable all caching','Do not read similar records or persist prompt and response content.','no cache','protect'],
        ['Route approved model','Use only the private endpoint allowed for health-related data.','approved route','protect'],
        ['Execute without logs','Suppress content logging and apply a strict output schema.','private run','protect'],
        ['Redact + audit','Remove unnecessary identifiers and store only compliance metadata.','audit event','protect']
      ]
    }
  };
  const themeToggle=document.getElementById('themeToggle');
  function syncThemeControl(){
    if(!themeToggle)return;
    const light=document.documentElement.dataset.theme==='light';
    themeToggle.querySelector('.theme-icon').textContent=light?'☾':'☀';
    themeToggle.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
    themeToggle.title=light?'Switch to dark mode':'Switch to light mode';
    const themeMeta=document.querySelector('meta[name="theme-color"]');
    if(themeMeta)themeMeta.content=light?'#f3f7f7':'#071016';
  }
  if(themeToggle){
    syncThemeControl();
    themeToggle.addEventListener('click',()=>{
      const next=document.documentElement.dataset.theme==='light'?'dark':'light';
      document.documentElement.dataset.theme=next;
      try{localStorage.setItem('token-economy-theme',next)}catch{}
      syncThemeControl();
    });
  }
  const buttons=[...document.querySelectorAll('.scenario-btn')];
  const nodes=[...document.querySelectorAll('.flow-node')];
  const packet=document.getElementById('packet');
  const classifier=document.querySelector('.local-classifier');
  const simulator=document.querySelector('.simulator');
  const playControl=document.getElementById('playControl');
  let current='support',step=0,playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches,timer;

  function animateStep(){
    if(!nodes.length)return;
    nodes.forEach((node,index)=>{node.classList.toggle('active',index===step);node.classList.toggle('completed',index<step);});
    if(packet)packet.style.left=`calc(${8+step*16.75}% - 5px)`;
    step=(step+1)%nodes.length;
  }
  function renderScenario(name){
    current=name;const data=scenarios[name];
    if(classifier)classifier.dataset.scenario=name;
    if(simulator)simulator.dataset.scenario=name;
    buttons.forEach(button=>{const selected=button.dataset.scenario===name;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));});
    const setText=(id,value)=>{const element=document.getElementById(id);if(element)element.textContent=value};
    setText('queryValue',data.query);setText('confidenceValue',data.confidence);setText('purposeValue',data.purpose);setText('complexityValue',data.complexity);setText('dataValue',data.dataClass);setText('reuseValue',data.reuse);setText('pathLabel',data.purpose);
    const complexityElement=document.getElementById('complexityValue'),dataElement=document.getElementById('dataValue'),reuseElement=document.getElementById('reuseValue');
    if(complexityElement)complexityElement.dataset.level=data.complexity.toLowerCase();
    if(dataElement)dataElement.dataset.level=data.dataClass.startsWith('Restricted')?'restricted':data.dataClass.includes('live')?'live':'internal';
    if(reuseElement)reuseElement.dataset.level=data.reuse.startsWith('High')?'high-reuse':data.reuse.startsWith('None')?'none':'low-reuse';
    [['controlPolicy',data.policy[0]],['controlPolicyNote',data.policy[1]],['controlCache',data.cache[0]],['controlCacheNote',data.cache[1]],['controlQuality',data.quality[0]],['controlQualityNote',data.quality[1]],['controlBudget',data.budget[0]],['controlBudgetNote',data.budget[1]]].forEach(([id,value])=>setText(id,value));
    document.getElementById('traceText').textContent=data.trace;
    document.getElementById('tokensValue').innerHTML=data.tokens;
    document.getElementById('latencyValue').textContent=data.latency;
    document.getElementById('costValue').textContent=data.cost;
    data.nodes.forEach((decision,index)=>{const node=nodes[index];node.querySelector('h2').textContent=decision[0];node.querySelector('p').textContent=decision[1];node.querySelector('.node-state').textContent=decision[2];node.dataset.tone=decision[3];});
    packet.classList.toggle('cache-hit',data.hit);step=0;animateStep();
  }
  function startTimer(){clearInterval(timer);if(playing&&nodes.length)timer=setInterval(animateStep,950)}
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>{renderScenario(button.dataset.scenario);startTimer()});
    button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const direction=event.key==='ArrowRight'?1:-1;const target=buttons[(index+direction+buttons.length)%buttons.length];target.focus();target.click();});
  });
  if(playControl)playControl.addEventListener('click',()=>{playing=!playing;playControl.textContent=playing?'Ⅱ':'▶';playControl.setAttribute('aria-label',playing?'Pause architecture animation':'Play architecture animation');playControl.title=playing?'Pause animation':'Play animation';startTimer()});
  document.querySelectorAll('.method-trigger').forEach(trigger=>trigger.addEventListener('click',()=>{const card=trigger.closest('.method-card'),open=card.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))}));
  if(nodes.length){renderScenario(current);startTimer()}
})();
