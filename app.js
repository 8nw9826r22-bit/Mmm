(function(){
  var KEY='streak.days.v1';
  var days={};
  try{days=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(days))}catch(e){}}
  function pad(n){return n<10?'0'+n:''+n}
  function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function fromKey(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
  function addDays(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);return x}
  function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())}

  var view=today(); view.setDate(1);
  var $=function(id){return document.getElementById(id)};

  function currentStreak(){
    var d=today();
    if(!days[key(d)]) d=addDays(d,-1);
    var c=0;
    while(days[key(d)]){c++;d=addDays(d,-1)}
    return c;
  }
  function bestStreak(){
    var ks=Object.keys(days).filter(function(k){return days[k]}).sort();
    var best=0,run=0,prev=null;
    ks.forEach(function(k){
      var d=fromKey(k);
      run=(prev&&key(addDays(prev,1))===k)?run+1:1;
      if(run>best)best=run; prev=d;
    });
    return best;
  }

  function render(){
    var t=today(), tk=key(t);
    $('todayLabel').textContent=t.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    var cur=currentStreak(), best=bestStreak();
    $('current').textContent=cur;
    $('unit').textContent=cur===1?'day streak':'day streak';
    $('best').textContent='Best: '+best+(best===1?' day':' days');
    var done=!!days[tk];
    var b=$('mark');
    b.textContent=done?'Done for today':'Mark today as done';
    b.classList.toggle('done',done);

    $('monthLabel').textContent=view.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    var grid=$('grid'); grid.innerHTML='';
    var first=new Date(view.getFullYear(),view.getMonth(),1);
    var offset=(first.getDay()+6)%7; // Monday first
    var dim=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    var cells=Math.ceil((offset+dim)/7)*7;
    for(var i=0;i<cells;i++){
      var n=i-offset+1, cell=document.createElement('div'), cls='day';
      if(n<1||n>dim){cls+=' out';cell.className=cls;cell.innerHTML='<button tabindex="-1"></button>';grid.appendChild(cell);continue}
      var d=new Date(view.getFullYear(),view.getMonth(),n), k=key(d);
      if(k>tk)cls+=' future';
      if(k===tk)cls+=' today';
      if(days[k])cls+=' done';
      cell.className=cls;
      var btn=document.createElement('button');
      btn.textContent=n; btn.setAttribute('data-k',k);
      btn.setAttribute('aria-label',d.toDateString()+(days[k]?', done':''));
      cell.appendChild(btn); grid.appendChild(cell);
    }
  }
  function haptic(){try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}
  function toggle(k){
    if(days[k])delete days[k]; else days[k]=1;
    save(); haptic(); render();
  }

  var dow=$('dow');
  ['M','T','W','T','F','S','S'].forEach(function(l){var d=document.createElement('div');d.textContent=l;dow.appendChild(d)});

  $('grid').addEventListener('click',function(e){
    var b=e.target.closest('button[data-k]'); if(b)toggle(b.getAttribute('data-k'));
  });
  $('mark').addEventListener('click',function(){toggle(key(today()))});
  $('prev').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()-1,1);render()});
  $('next').addEventListener('click',function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);render()});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)render()});
  render();

  if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
