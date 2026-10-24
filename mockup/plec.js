/* ---------- Oznaczenie płci: usługa projektowana (wymaga zmiany ustawy, patrz README) ----------
   Jeden przełącznik K | M | X i jedno oświadczenie. Osoba stanu wolnego: wniosek do USC, 30 dni na namysł,
   potwierdzenie. Osoba w związku małżeńskim: wniosek do sądu z udziałem małżonka (projekt art. 36c PASC).
   Po wpisie aplikacja proponuje dalsze kroki: dokumenty, imię, instytucje, świadectwa. Dane fikcyjne. */
const PLEC_LABEL={K:'Kobieta',M:'Mężczyzna',X:'Niebinarna (X)'};
const PLEC_SUB={K:'kobieta',M:'mężczyzna',X:'niebinarna'};
const PLEC_ZRODLO='Usługa projektowana, wymaga zmiany ustawy';
const PLEC_MALZ={marta:'Tomasz Kowalski (mąż)',jan:'Agnieszka Wiśniewska (żona)',ewa:'Krzysztof Nowak (mąż)'};
const PLEC={teraz:OS.plec,nowa:null,imie:null,wniosek:null,wpisano:false,zrobione:{}};

function jestPlec(t){const n=norm(t);return /\bplec\b|\bplci\b|tranzycj|niebinarn|oznaczeni\w* plci/.test(n)}
function plecMiasto(){return (OS.moje.adres||'').split(',').pop().trim()||'Warszawa'}
function plecUSC(){const m=plecMiasto();return {Warszawa:'USC m.st. Warszawy',Kraków:'USC w Krakowie',Lublin:'USC w Lublinie',Gdańsk:'USC w Gdańsku'}[m]||'USC, '+m}
function plecNazwisko(g){
 const n=OS.nazwisko;if(g==='X'||g===PLEC.teraz)return n;
 if(g==='M')return n.replace(/(s|c|dz)ka$/,'$1ki');
 return n.replace(/(s|c|dz)ki$/,'$1ka');
}
function plecImie(){return PLEC.imie||OS.imie}
function plecPelne(){return plecImie()+' '+plecNazwisko(PLEC.nowa)}
function plecPesel(p,g){
 if(g==='X'||!/^\d{11}$/.test(p))return p;
 const d=p.split('').map(Number);
 if((d[9]%2===0)!==(g==='K'))d[9]=(d[9]+1)%10;
 const w=[1,3,7,9,1,3,7,9,1,3];d[10]=(10-d.slice(0,10).reduce((s,x,i)=>s+x*w[i],0)%10)%10;
 return d.join('');
}
const dataMies=n=>{const d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('pl-PL',{day:'2-digit',month:'2-digit',year:'numeric'})};

function plecNote(g){
 if(!g||g===PLEC.teraz)return `<div class="pn">To Twoje obecne oznaczenie. Przestaw przełącznik, aby wybrać nowe.</div>`;
 if(g==='X')return `<div class="pn"><b>Oznaczenie niebinarne</b><ul><li>W dowodzie i paszporcie pojawi się X, zgodnie ze standardem ICAO.</li><li>Numer PESEL się nie zmieni.</li><li>Kodeks rodzinny wymaga dziś do zawarcia małżeństwa oświadczeń mężczyzny i kobiety. Jak dotyczy to oznaczenia X, określi ustawa.</li></ul></div>`;
 return `<div class="pn"><b>Co się zmieni</b><ul><li>Wzmianka w akcie urodzenia i nowy numer PESEL.</li><li>Nazwisko: ${plecNazwisko(g)}.</li><li>Prawa sprzed zmiany, np. rodzicielstwo, zostają bez zmian.</li></ul></div>`;
}

const SP={
 async start(){
  if(PLEC.wpisano){await say('Zmiana oznaczenia płci jest już wpisana. Kolejną zgłosisz najwcześniej za rok. Mogę pomóc w dalszych krokach.');return SP.dalej()}
  if(PLEC.wniosek){await say('Twój wniosek już czeka.');return SP.czeka()}
  await say('Oznaczenie płci zmienisz jednym oświadczeniem, bez pozwu i zaświadczeń lekarskich. Wybierz nowe oznaczenie.');
  const c=await card(`<div class="ui plec">${hd('id','Oznaczenie płci')}
   <div class="body">W rejestrze PESEL: <b>${PLEC_LABEL[PLEC.teraz]}</b></div>
   <div class="seg" role="radiogroup" aria-label="Oznaczenie płci">${['K','M','X'].map(g=>`<button type="button" role="radio" aria-checked="${g===PLEC.teraz}" data-g="${g}">${g}<small>${PLEC_SUB[g]}</small>${g===PLEC.teraz?'<em>teraz</em>':''}</button>`).join('')}</div>
   <div class="pnote">${plecNote(PLEC.teraz)}</div>
   <div class="actions"><button class="btn ghost">Anuluj</button><button class="btn primary" disabled>Dalej</button></div>${srcH('Rejestr PESEL · '+PLEC_ZRODLO)}</div>`);
  const seg=c.querySelector('.seg'),dal=c.querySelector('.btn.primary');let wyb=PLEC.teraz;
  const ustaw=g=>{wyb=g;seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-checked',b.dataset.g===g));c.querySelector('.pnote').innerHTML=plecNote(g);dal.disabled=g===PLEC.teraz;end()};
  seg.querySelectorAll('button').forEach(b=>b.onclick=()=>ustaw(b.dataset.g));
  seg.addEventListener('keydown',e=>{const o=['K','M','X'];let i=o.indexOf(wyb);if(e.key==='ArrowRight')i=(i+1)%3;else if(e.key==='ArrowLeft')i=(i+2)%3;else return;e.preventDefault();ustaw(o[i]);seg.querySelector(`[data-g="${o[i]}"]`).focus()});
  c.querySelector('.btn.ghost').onclick=()=>act(()=>{c.querySelector('.actions').remove();say('Anulowałem. Nic nie zostało wysłane.')});
  dal.onclick=()=>{if(dal.disabled)return;act(()=>{c.querySelector('.actions').remove();c.classList.add('done');PLEC.nowa=wyb;addUser(PLEC_LABEL[wyb]);SP.imie()})};
 },
 async imie(){
  await say('Chcesz przy okazji zmienić imię? Zrobię to w tej samej sprawie, za jedną opłatą.');
  const p={K:['Maja','Julia'],M:['Michał','Adam'],X:['Alex','Sasza']}[PLEC.nowa];
  const wpisz=t=>{const x=t.trim().replace(/\s+/g,' ').split(' ').slice(0,2).map(s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join(' ');PLEC.imie=x&&x!==OS.imie?x:null;SP.oswiadczenie()};
  chips([...p.map(n=>({label:n,go:()=>{PLEC.imie=n;SP.oswiadczenie()}})),
   {label:'Zostaję przy imieniu '+OS.imie,go:()=>{PLEC.imie=null;SP.oswiadczenie()}},
   {label:'Wpiszę inne',go:async()=>{await say('Napisz imię poniżej, najwyżej dwa.');const f=t=>wpisz(t);f.plec=1;pending=f;input.focus()}}]);
  const f=t=>wpisz(t);f.plec=1;pending=f;
 },
 async oswiadczenie(){
  const malz=PLEC_MALZ[OS.id],g=PLEC.nowa;
  const rows=[['Teraz',PLEC_LABEL[PLEC.teraz]],['Nowe oznaczenie',PLEC_LABEL[g]],['Imię i nazwisko po zmianie',plecPelne()]];
  if(malz){
   await say(`Jesteś w związku małżeńskim, więc w projekcie ustawy zmianę zatwierdza sąd, a ${malz.includes('żona')?'żona':'mąż'} jest uczestnikiem sprawy. Wniosek przygotuję i złożę stąd.`);
   rows.push(['Tryb','sąd rejonowy, postępowanie nieprocesowe'],['Uczestnik',malz],['Opłata','37 zł, razem ze zmianą imienia']);
  }else{
   rows.push(['Urząd',plecUSC()],['Czas na namysł','30 dni, potem potwierdzasz'],['Opłata','37 zł, razem ze zmianą imienia']);
  }
  await confirmCard({icon:'id',title:'Oświadczenie o zmianie oznaczenia płci',source:'Rejestr PESEL, rejestr stanu cywilnego · '+PLEC_ZRODLO,
   body:`Oświadczam, że moja tożsamość płciowa trwale odpowiada oznaczeniu „${PLEC_LABEL[g]}”.`,rows,
   note:'Oświadczenie składasz pod rygorem odpowiedzialności karnej za fałszywe oświadczenie. Do wpisu możesz je wycofać.',
   label:'Podpisz i wyślij',then:async()=>{
    PLEC.wniosek={nr:'OP/2026/'+(400+Math.floor(Math.random()*500))+' '+(100+Math.floor(Math.random()*900)),sad:!!malz,od:dPlus(30),do:dataMies(6)};
    if(malz){
     await result({title:'Wniosek złożony w sądzie',source:'Twoje sprawy',rows:[['Numer sprawy',PLEC.wniosek.nr],['Sąd','sąd rejonowy, '+plecMiasto()],['Uczestnik',malz+', dostał powiadomienie w mObywatelu'],['Dalej','postanowienie doręczymy do Twojej skrzynki']]});
    }else{
     await result({title:'Wniosek złożony',source:plecUSC(),rows:[['Numer sprawy',PLEC.wniosek.nr],['Potwierdzisz','od '+PLEC.wniosek.od+' do '+PLEC.wniosek.do],['Do tego czasu','możesz wycofać wniosek tutaj']]});
    }
    await SP.czeka();
   }});
 },
 async czeka(){
  const w=PLEC.wniosek;
  await say(w.sad?'Dam Ci znać, gdy sąd wyda postanowienie. W pokazie możesz przejść od razu do tego dnia.':'Przypomnę Ci o potwierdzeniu za 30 dni. W pokazie możesz przejść od razu do tego dnia.');
  chips([{label:w.sad?'Przejdź do postanowienia (pokaz)':'Przewiń o 30 dni (pokaz)',go:w.sad?SP.postanowienie:SP.potwierdz},
   {label:'Wycofaj wniosek',go:SP.wycofaj}]);
 },
 async wycofaj(){
  PLEC.wniosek=null;PLEC.nowa=null;PLEC.imie=null;
  await result({title:'Wniosek wycofany',source:'Twoje sprawy',rows:[['Oznaczenie płci','bez zmian']]});
 },
 async potwierdz(){
  await say('Minęło 30 dni. Potwierdzić zmianę? Kolejną zgłosisz najwcześniej za rok.');
  await confirmCard({icon:'id',title:'Potwierdzenie zmiany oznaczenia płci',source:plecUSC()+' · '+PLEC_ZRODLO,rows:[['Nowe oznaczenie',PLEC_LABEL[PLEC.nowa]],['Imię i nazwisko',plecPelne()],['Numer sprawy',PLEC.wniosek.nr]],label:'Potwierdź zmianę',then:SP.wpis,onCancel:async()=>{await say('Nic nie zmieniłem. Wniosek czeka do '+PLEC.wniosek.do+'.');chips([{label:'Wycofaj wniosek',go:SP.wycofaj}])}});
 },
 async postanowienie(){
  await info({icon:'mail',title:'Postanowienie sądu',source:'e-Doręczenia, sąd rejonowy, '+plecMiasto()+' · '+PLEC_ZRODLO,rows:[['Rozstrzygnięcie','zmiana oznaczenia płci na: '+PLEC_LABEL[PLEC.nowa]],['Imię i nazwisko',plecPelne()],['Prawomocne','tak'],['Wpis','sąd przekazał postanowienie do '+plecUSC()]]});
  await SP.wpis();
 },
 async wpis(){
  const stary=OS.moje.pesel,nowy=plecPesel(stary,PLEC.nowa),pelne=plecPelne();
  PLEC.wpisano=true;PLEC.teraz=PLEC.nowa;
  // dokumenty w portfelu pokazują nowe dane
  DOCS.forEach(d=>{
   if(d.plate)return;
   d.holder=pelne.toUpperCase();
   if(d.f)d.f=d.f.map(([k,v])=>[k,k==='PESEL'?nowy:v]);
   if(d.rows)d.rows=d.rows.map(([k,v])=>[k==='Posiadaczka'||k==='Posiadacz'?(PLEC.nowa==='K'?'Posiadaczka':'Posiadacz'):k,k==='Imię'?plecImie():k==='Nazwisko'?plecNazwisko(PLEC.nowa):k==='PESEL'?nowy:v]);
   if(d.id==='dowod'){d.line='PESEL '+nowy;delete d.screen}
  });
  OS.moje.pesel=nowy;OS.moje.imie_nazwisko=pelne;
  renderStack();if(typeof buildAlt==='function'&&VARIANT!=='stos')buildAlt();layout();
  await result({title:'Zmiana wpisana',source:plecUSC()+', godz. '+now(),rows:[['Akt urodzenia','wzmianka dodatkowa'],['Oznaczenie płci',PLEC_LABEL[PLEC.nowa]],['Imię i nazwisko',pelne],['PESEL',nowy===stary?'bez zmian':nowy+' (nowy)'],['mDowód','zaktualizowany']]});
  await SP.dalej();
 },
 async dalej(){
  await say('Przygotowałem wnioski z nowymi danymi. Wybierz, co chcesz załatwić teraz.');
  const it=[['dowod','id','Nowy dowód osobisty','bezpłatnie, zdjęcie z rejestru'],['paszport','doc','Paszport','umówię wizytę w punkcie paszportowym'],['pj','car','Prawo jazdy','wymiana, bo zawiera PESEL'],
   ...(PLEC.imie?[]:[['imie','doc','Zmiana imienia','osobny wniosek do USC']]),
   ['instytucje','shield','Powiadom instytucje','ZUS, NFZ, urząd skarbowy, pracodawca'],['swiad','doc','Świadectwa i dyplomy','nowe, bez wzmianki o zmianie'],['odpis','doc','Odpis aktu urodzenia','skrócony, od razu w skrzynce']];
  const c=await card(`<div class="ui list">${hd('check','Dalsze kroki')}${it.map(([k,i,h,s])=>`<button class="it" data-k="${k}"><span class="pip${PLEC.zrobione[k]?' g':''}"></span><span class="x"><b>${h}</b><small>${s}</small></span><span class="go">${PLEC.zrobione[k]?'Zrobione':'Załatw'}</span></button>`).join('')}${srcH('Rejestr PESEL, Twoje sprawy · '+PLEC_ZRODLO)}</div>`);
  c.querySelectorAll('.it').forEach(b=>b.onclick=()=>act(()=>{addUser(b.querySelector('b').textContent);SP.krok[b.dataset.k](()=>{PLEC.zrobione[b.dataset.k]=1;b.querySelector('.go').textContent='Zrobione';b.querySelector('.pip').classList.add('g')})}));
 },
 krok:{
  async dowod(ok){
   await say('Wniosek wyślę stąd. W ciągu 30 dni pójdziesz do urzędu na odciski palców i podpis, tam też odbierzesz dowód.');
   await confirmCard({icon:'id',title:'Wniosek o dowód osobisty',source:'Rejestr PESEL, Rejestr Dowodów Osobistych',rows:[[PLEC.nowa==='K'?'Wnioskodawczyni':'Wnioskodawca',plecPelne()],['Powód','zmiana danych'],['Zdjęcie','z rejestru, możesz dodać nowe'],['Wizyta w urzędzie','do '+dPlus(30)+', odciski palców i podpis'],['Opłata','bezpłatnie']],label:'Podpisz i wyślij',
    then:async()=>{ok();await result({title:'Wniosek złożony',source:'Twoje sprawy',rows:[['Numer wniosku','DO/2026/'+(100+Math.floor(Math.random()*900))+' 214'],['Teraz','idź do urzędu do '+dPlus(30)],['Odbiór','osobiście w tym samym urzędzie']]})}});
  },
  async paszport(ok){
   await say('Wniosek paszportowy osoby dorosłej składa się osobiście. Dane mam gotowe, umówię Cię na wizytę.');
   await confirmCard({icon:'doc',title:'Wizyta w punkcie paszportowym',source:'Rejestr PESEL · '+PLEC_ZRODLO,rows:[['Osoba',plecPelne()],['Oznaczenie płci w paszporcie',PLEC.nowa==='X'?'X':PLEC.nowa==='K'?'K/F':'M/M'],['Punkt','urząd wojewódzki, '+plecMiasto()],['Termin',dPlus(9)+', 10:20'],['Opłata','bezpłatnie przy zmianie oznaczenia płci']],label:'Umów wizytę',
    then:async()=>{ok();await result({title:'Wizyta umówiona',source:'Twoje sprawy',rows:[['Kiedy',dPlus(9)+', 10:20'],['Zabierz','dowód osobisty lub mDowód, aktualne zdjęcie']]})}});
  },
  async pj(ok){
   await confirmCard({icon:'car',title:'Wymiana prawa jazdy',source:'CEPiK, rejestr PESEL · '+PLEC_ZRODLO,rows:[['Kierowca',plecPelne()],['Powód','zmiana danych (PESEL)'],['Zdjęcie','z Rejestru Dowodów Osobistych'],['Odbiór','wydział komunikacji, '+plecMiasto()],['Opłata','bezpłatnie przy zmianie oznaczenia płci']],note:'mPrawo jazdy w aplikacji już pokazuje nowe dane.',label:'Wyślij wniosek',
    then:async()=>{ok();await result({title:'Wniosek o wymianę wysłany',source:'Twoje sprawy',rows:[['Gotowe','zwykle do 30 dni, dostaniesz powiadomienie']]})}});
  },
  async imie(ok){
   await say('Zmiana oznaczenia płci to ważny powód zmiany imienia. Jak masz mieć na imię?');
   const p={K:['Maja','Julia'],M:['Michał','Adam'],X:['Alex','Sasza']}[PLEC.nowa]||['Alex'];
   const dalej=async n=>{await confirmCard({icon:'doc',title:'Wniosek o zmianę imienia',source:plecUSC(),rows:[['Obecne imię',plecImie()],['Nowe imię',n],['Powód','zmiana oznaczenia płci'],['Opłata','37 zł']],label:'Podpisz i wyślij',then:async()=>{ok();await result({title:'Wniosek wysłany do USC',source:'Twoje sprawy',rows:[['Decyzja','do 30 dni, do Twojej skrzynki']]})}})};
   chips(p.map(n=>({label:n,go:()=>dalej(n)})));
   const f=t=>dalej(t.trim().split(' ')[0].replace(/^./,x=>x.toUpperCase()));f.plec=1;pending=f;
  },
  async instytucje(ok){
   await say('Komu przekazać nowe dane? Każda instytucja dostanie tylko imię, nazwisko i PESEL.');
   multi(['ZUS','NFZ','Urząd skarbowy','Pracodawca'],async sel=>{
    await confirmCard({icon:'shield',title:'Przekazanie zaktualizowanych danych',source:'Rejestr PESEL · '+PLEC_ZRODLO,rows:[['Do',sel.join(', ')],['Dane','imię, nazwisko, PESEL'],['Bez','informacji o poprzednich danych']],label:'Przekaż dane',
     then:async()=>{ok();await result({title:'Dane przekazane',source:'godz. '+now(),rows:sel.map(s=>[s,'przyjęto'])});await say('Banku i innych firm nie powiadomię za Ciebie. W skrzynce masz potwierdzenie zmiany danych, które możesz im pokazać.')}});
   });
  },
  async swiad(ok){
   await say('Które dokumenty mam zamówić z nowymi danymi?');
   multi(['Świadectwo maturalne','Dyplom ukończenia studiów','Świadectwa pracy'],async sel=>{
    await confirmCard({icon:'doc',title:'Wnioski o nowe dokumenty',source:'Rejestr PESEL · '+PLEC_ZRODLO,rows:[['Dokumenty',sel.join(', ')],['Dane','aktualne imię, nazwisko i PESEL'],['Wzmianka o zmianie','brak']],label:'Wyślij wnioski',
     then:async()=>{ok();await result({title:'Wnioski wysłane',source:'Twoje sprawy',rows:sel.map(s=>[s,'w realizacji'])})}});
   });
  },
  async odpis(ok){ok();await result({title:'Odpis skrócony aktu urodzenia',source:'Skrzynka e-Doręczeń, godz. '+now(),rows:[['Dane','aktualne, bez poprzedniego oznaczenia'],['Opłata','bezpłatnie w aplikacji']]})}
 }
};
S.plec=SP.start;

/* wejście: wpisana prośba, podpowiedź na pustym ekranie rozmowy */
{const _r=route;route=function(t){if(pending&&pending.plec)return _r(t);if(!pending&&jestPlec(t))return S.plec();return _r(t)}}
OSOBY[OSOBA_ID].sugg.splice(1,0,['Chcę zmienić oznaczenie płci','nowa usługa, bez sądu']);
