# -*- coding: utf-8 -*-
"""Serwer prototypu: pliki statyczne z ../mockup + API agenta, rozpoznawania mowy i syntezy mowy.
Uruchomienie: python3 server.py [port]   (domyślnie 8790)"""
import json, os, sys, time, uuid, threading, urllib.request, urllib.error, traceback
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import agent, tlumacz

ROOT = os.environ.get('MOCKUP') or os.path.join(os.path.dirname(HERE), 'mockup')
LOG = os.environ.get('AGENT_LOG') or os.path.join(HERE, 'agent.log')
_lock = threading.Lock()
KEYS = {}
TTS_CACHE = {}
BLOKADA = os.path.join(HERE, 'BLOKADA')
ODDAJ = 'Oddaj klucz'
def zablokowane(): return os.path.exists(BLOKADA)
def k(name):
    if name == 'zgodny':
        if zablokowane() or not agent.ZGODNY_MODEL: return None
        return os.environ.get('MODEL_API_KEY') or (k('openai') if agent.ZGODNY_BAZA == agent.OPENAI_BAZA_DOMYSLNA else None) or 'bez-klucza'
    if zablokowane():
        KEYS.clear(); return None
    if name not in KEYS or (not KEYS[name] and time.time() - KEYS.get(name + '@t', 0) > 60):   # brak klucza sprawdzamy raz na minutę
        KEYS[name + '@t'] = time.time()
        KEYS[name] = agent.klucz({'anthropic': 'anthropic_api_key', 'openai': 'openai_api_key', 'elevenlabs': 'elevenlabs_api_key'}[name], {'anthropic': 'ANTHROPIC_API_KEY', 'openai': 'OPENAI_API_KEY', 'elevenlabs': 'ELEVENLABS_API_KEY'}[name])
    return KEYS[name]

def log(x):
    x = dict(x, ts=time.strftime('%Y-%m-%d %H:%M:%S'))
    with _lock:
        with open(LOG, 'a', encoding='utf-8') as f: f.write(json.dumps(x, ensure_ascii=False) + '\n')

# --- znak mObywatela: każde urządzenie pokazuje zmieniający się żeton; kto go zeskanuje, przekazuje dane jego właścicielowi ---
ZN = {'devs': {}, 'skrz': {}, 'skan': {}}
def zn_clean():
    t = time.time()
    for d in [d for d, v in ZN['devs'].items() if t - v['t'] > 120]:
        ZN['devs'].pop(d, None); ZN['skrz'].pop(d, None); ZN['skan'].pop(d, None)
def zn_kto(tok, dev):
    now = time.time()
    for d, v in ZN['devs'].items():
        if d == dev or now - v['t'] > 15: continue
        if v['token'] == tok or (v.get('prev') == tok and now - v['tt'] < 60): return d, v
    return None, None

STT_MODEL = os.environ.get('STT_MODEL', 'gpt-4o-mini-transcribe')
TTS_MODEL = os.environ.get('TTS_MODEL', 'gpt-4o-mini-tts')
TTS_VOICE = os.environ.get('TTS_VOICE', 'coral')
TTS_INSTR = ('Mów po polsku, z naturalną polską wymową i akcentem, bez obcego akcentu. Ton: spokojna, życzliwa urzędniczka, '
             'która konkretnie pomaga. Tempo umiarkowane, wyraźnie wymawiaj liczby, daty i numery.')
STT_PROMPT = 'Rozmowa z asystentem mObywatel. Słownictwo: mObywatel, mDowód, PESEL, KDR, Karta Dużej Rodziny, OC, CEPiK, e-Doręczenia, ZUS, 800 plus, mStłuczka, PCC, Face ID, Toyota, Warta, Skoda, Transporter, Fiat Panda, Golf, legitymacja, mandat, VAT, JPK.'

# ElevenLabs: głos i rozpoznawanie mowy; bez klucza, bez głosu albo po błędzie (np. skończone kredyty) wracamy do OpenAI
EL_VOICE = os.environ.get('EL_VOICE', 'H3IcxEgdFxIEJAqMc0Bc')   # Joanna (Voice Library, polski); wymaga doładowanego konta
EL_TTS_MODEL = os.environ.get('EL_TTS_MODEL', 'eleven_flash_v2_5')   # Flash: najtańszy i najszybszy; jakość: eleven_multilingual_v2
EL_STT_MODEL = os.environ.get('EL_STT_MODEL', 'scribe_v2')
EL_KEYTERMS = ['mObywatel', 'mDowód', 'PESEL', 'Karta Dużej Rodziny', 'CEPiK', 'e-Doręczenia', 'ZUS', '800 plus', 'mStłuczka', 'Face ID']
EL_PRZERWA = 900   # po błędzie ElevenLabs tyle sekund idziemy prosto do OpenAI
EL_STOP = {}
def el_ok(co): return bool(k('elevenlabs')) and time.time() > EL_STOP.get(co, 0) and (co != 'tts' or EL_VOICE)
def el_pobierz(req):
    for i in range(2):   # połączenie z ElevenLabs potrafi się zerwać przy nawiązywaniu, wtedy jedna ponowna próba
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read()
        except urllib.error.HTTPError: raise
        except (urllib.error.URLError, ConnectionError, OSError):
            if i: raise
def el_blad(co, e):
    EL_STOP[co] = time.time() + EL_PRZERWA
    msg = e.read().decode('utf-8', 'replace')[:300] if isinstance(e, urllib.error.HTTPError) else str(e)
    log(dict(t='el_err', co=co, code=getattr(e, 'code', None), msg=msg))

def multipart(fields, files):
    b = uuid.uuid4().hex
    out = b''
    for n, v in fields.items():
        for v in (v if isinstance(v, list) else [v]):
            out += ('--%s\r\nContent-Disposition: form-data; name="%s"\r\n\r\n%s\r\n' % (b, n, v)).encode()
    for n, (fn, ct, data) in files.items():
        out += ('--%s\r\nContent-Disposition: form-data; name="%s"; filename="%s"\r\nContent-Type: %s\r\n\r\n' % (b, n, fn, ct)).encode() + data + b'\r\n'
    out += ('--%s--\r\n' % b).encode()
    return out, 'multipart/form-data; boundary=' + b

def stt(data, ctype, lang='pl'):
    """Zwraca (tekst, dostawca)."""
    c = ctype.lower()
    ext = next((e for k_, e in [('webm', 'webm'), ('mp4', 'mp4'), ('m4a', 'm4a'), ('aac', 'm4a'), ('ogg', 'ogg'), ('mpeg', 'mp3'), ('mp3', 'mp3'), ('wav', 'wav')] if k_ in c), 'webm')
    kod = (tlumacz.JEZYKI.get(lang) or tlumacz.JEZYKI['pl'])[2]
    plik = {'file': ('nagranie.' + ext, ctype.split(';')[0] or 'audio/webm', data)}
    if el_ok('stt'):
        pola = {'model_id': EL_STT_MODEL, 'tag_audio_events': 'false', 'keyterms': EL_KEYTERMS}
        if kod: pola['language_code'] = kod
        body, ct = multipart(pola, plik)
        req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': k('elevenlabs'), 'Content-Type': ct})
        try:
            return json.loads(el_pobierz(req)).get('text', '').strip(), 'elevenlabs'
        except Exception as e: el_blad('stt', e)
    pola = {'model': STT_MODEL, 'prompt': STT_PROMPT if lang == 'pl' else 'mObywatel, mDowód, PESEL, ZUS, CEPiK, Face ID', 'response_format': 'json'}
    if kod: pola['language'] = kod
    body, ct = multipart(pola, plik)
    req = urllib.request.Request('https://api.openai.com/v1/audio/transcriptions', data=body, headers={'Authorization': 'Bearer ' + k('openai'), 'Content-Type': ct})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read()).get('text', '').strip(), 'openai'

def tts(text, lang='pl'):
    """Zwraca (mp3, dostawca)."""
    if el_ok('tts'):
        d = dict(text=text[:3500], model_id=EL_TTS_MODEL, apply_text_normalization='on')
        if 'multilingual_v2' not in EL_TTS_MODEL: d['language_code'] = lang
        req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_64' % EL_VOICE, data=json.dumps(d).encode(),
                                     headers={'xi-api-key': k('elevenlabs'), 'Content-Type': 'application/json'})
        try:
            return el_pobierz(req), 'elevenlabs'
        except Exception as e: el_blad('tts', e)
    ins = TTS_INSTR if lang == 'pl' or lang not in tlumacz.JEZYKI else ('Speak %s with natural native pronunciation and accent. Tone: calm, friendly public-service clerk who helps concretely. Moderate pace; pronounce numbers, dates and codes clearly. Polish names and addresses: pronounce them the Polish way.' % tlumacz.JEZYKI[lang][0])
    body = json.dumps(dict(model=TTS_MODEL, voice=TTS_VOICE, input=text[:3500], instructions=ins, response_format='mp3')).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, headers={'Authorization': 'Bearer ' + k('openai'), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read(), 'openai'

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=ROOT, **kw)
    def log_message(self, *a): pass
    def end_headers(self):
        if not self.path.startswith('/api/'): self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def js(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8'); self.send_header('Content-Length', str(len(b))); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(b)
    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        return self.rfile.read(n) if n else b''
    def do_GET(self):
        p = urlparse(self.path).path
        if p == '/api/health':
            if zablokowane(): return self.js(dict(agent=True, stt=True, tts=False, provider='brak', model='brak', blokada=True))
            prov = agent.PROVIDER
            glos = bool(k('openai') or k('elevenlabs'))
            return self.js(dict(agent=bool(k(prov)), stt=glos, tts=bool(k('openai') or el_ok('tts')), provider=prov,
                                glos=dict(stt='elevenlabs' if el_ok('stt') else 'openai', tts='elevenlabs' if el_ok('tts') else 'openai'), model=agent.OPENAI_MODEL if prov == 'openai' else agent.ZGODNY_MODEL if prov == 'zgodny' else (agent._model_ok or agent.MODELE[0])))
        if p in ('/api/i18n', '/api/i18n.js'):
            from urllib.parse import parse_qs
            lang = (parse_qs(urlparse(self.path).query).get('lang') or ['pl'])[0]
            d = tlumacz.slownik(lang) if lang in tlumacz.JEZYKI and lang != 'pl' else {}
            if p == '/api/i18n': return self.js(dict(lang=lang, t=d))
            b = ('window.I18N=%s;window.__i18nStart&&window.__i18nStart();' % json.dumps(d, ensure_ascii=False)).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/javascript; charset=utf-8'); self.send_header('Cache-Control', 'no-cache')
            self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b); return
        if p == '/api/znak/kto':
            from urllib.parse import parse_qs
            q = parse_qs(urlparse(self.path).query)
            try: tok = int((q.get('t') or ['-1'])[0])
            except ValueError: tok = -1
            dev = (q.get('dev') or [''])[0]
            with _lock:
                d, v = zn_kto(tok, dev)
                if d: ZN['skan'][d] = time.time()
            log(dict(t='znak_kto', ok=bool(d), kind=v and v['kind'], cel=v and v.get('cel')))
            if not d: return self.js(dict(dev=None))
            return self.js(dict(dev=d, kind=v['kind'], kto=v.get('kto'), cel=v.get('cel'), zakres=v.get('zakres')))
        if p == '/v2' or p.startswith('/v2/'):
            self.send_response(301); self.send_header('Location', '/'); self.end_headers(); return
        if p == '/komputer':
            self.path = '/komputer.html'
        if p == '/aplikacja' or p == '/aplikacja/':
            q = urlparse(self.path).query
            self.path = '/index.html' + ('?' + q if q else '')
        return super().do_GET()
    def do_POST(self):
        p = urlparse(self.path).path
        try:
            if p == '/api/agent':
                req = json.loads(self.body() or b'{}')
                if zablokowane():
                    msgs = req.get('messages', []) + [{'role': 'assistant', 'content': [{'type': 'text', 'text': ODDAJ}]}]
                    log(dict(t='blokada', path=p))
                    return self.js(dict(messages=msgs, stan=req.get('stan'), events=[dict(t='text', html=ODDAJ, plain=ODDAJ)], czeka=None))
                if not k(agent.PROVIDER): return self.js(dict(error='brak klucza API modelu'), 503)
                t0 = time.time()
                user = req.get('messages', [])[-1] if req.get('messages') else None
                log(dict(t='req', osoba=req.get('osoba'), conv=req.get('conv'), user=user.get('content') if user and isinstance(user.get('content'), str) else None, confirm=req.get('confirm')))
                msgs, stan, events, czeka = agent.run(req.get('messages', []), req.get('stan'), req.get('confirm'), {'anthropic': k('anthropic') if agent.PROVIDER == 'anthropic' else None, 'openai': k('openai'), 'zgodny': k('zgodny') if agent.PROVIDER == 'zgodny' else None}, lambda x: log(dict(x, conv=req.get('conv'))), osoba=req.get('osoba'), jezyk=req.get('lang') or 'pl')
                log(dict(t='resp', conv=req.get('conv'), ms=int((time.time() - t0) * 1000), events=[e.get('t') for e in events], czeka=czeka))
                return self.js(dict(messages=msgs, stan=stan, events=events, czeka=czeka))
            if p == '/api/i18n/brak':
                raw = self.body()
                if len(raw) > 60000: return self.js(dict(error='za duzo'), 413)
                req = json.loads(raw or b'{}'); lang = req.get('lang')
                if lang not in tlumacz.JEZYKI or lang == 'pl': return self.js(dict(t={}))
                teksty = [str(x)[:700] for x in (req.get('teksty') or [])][:150]
                d = tlumacz.przetlumacz(lang, teksty)   # tylko słownik; braki trafiają do rejestru, bez tłumaczenia maszynowego
                log(dict(t='i18n', lang=lang, n=len(teksty), brak=len(teksty) - len(d)))
                return self.js(dict(t=d))
            if p == '/api/znak/beat':
                req = json.loads(self.body() or b'{}'); dev = str(req.get('dev', ''))[:40]
                try: tok = int(req.get('token')) & 0xffff
                except (TypeError, ValueError): return self.js(dict(error='zly zeton'), 400)
                with _lock:
                    zn_clean(); now = time.time(); v = ZN['devs'].get(dev)
                    zajety = any(d != dev and now - w['t'] < 15 and tok in (w['token'], w.get('prev')) for d, w in ZN['devs'].items())
                    if v is None: v = ZN['devs'][dev] = dict(token=tok, prev=None, tt=now)
                    elif v['token'] != tok: v['prev'], v['token'], v['tt'] = v['token'], tok, now
                    v.update(t=now, kind='web' if req.get('kind') == 'web' else 'telefon', kto=str(req.get('kto') or '')[:80], cel=req.get('cel'), zakres=req.get('zakres'))
                    otrz = ZN['skrz'].pop(dev, [])
                    skanuje = now - ZN['skan'].get(dev, 0) < 45
                    if otrz: ZN['skan'].pop(dev, None)
                return self.js(dict(otrzymane=otrz, skanuje=skanuje and not otrz, zmien=zajety))
            if p == '/api/znak/przekaz':
                raw = self.body()
                if len(raw) > 20000: return self.js(dict(error='za duzo danych'), 413)
                req = json.loads(raw or b'{}'); to = req.get('to')
                with _lock:
                    if to not in ZN['devs']: return self.js(dict(ok=False, error='odbiorca niedostepny'), 404)
                    ZN['skrz'].setdefault(to, []).append(dict(ok=bool(req.get('ok')), dane=req.get('dane') if req.get('ok') else None, t=time.time()))
                log(dict(t='znak_przekaz', ok=bool(req.get('ok')), kind=ZN['devs'][to]['kind']))
                return self.js(dict(ok=True))
            if p == '/api/glos':   # diagnostyka nagrań porzuconych w przeglądarce (cisza, brak mikrofonu)
                raw = self.body()[:2000]
                try: d = json.loads(raw or b'{}')
                except ValueError: d = {}
                log(dict(t='glos_diag', **{k_: d[k_] for k_ in list(d)[:12] if isinstance(k_, str)}))
                return self.js(dict(ok=True))
            if p == '/api/stt':
                data = self.body()
                if zablokowane(): return self.js(dict(text='🎤 nagranie'))
                if not (k('openai') or el_ok('stt')): return self.js(dict(error='brak klucza do rozpoznawania mowy'), 503)
                from urllib.parse import parse_qs
                lang = (parse_qs(urlparse(self.path).query).get('lang') or ['pl'])[0]
                t0 = time.time(); txt, kto = stt(data, self.headers.get('Content-Type') or 'audio/webm', lang if lang in tlumacz.JEZYKI else 'pl')
                try: diag = json.loads(self.headers.get('X-Glos') or '{}')
                except ValueError: diag = None
                log(dict(t='stt', ms=int((time.time() - t0) * 1000), bytes=len(data), text=txt, kto=kto, ctype=self.headers.get('Content-Type'), diag=diag))
                return self.js(dict(text=txt))
            if p == '/api/tts':
                req = json.loads(self.body() or b'{}')
                if zablokowane(): return self.js(dict(error='blokada'), 503)
                if not (k('openai') or el_ok('tts')): return self.js(dict(error='brak klucza do syntezy mowy'), 503)
                t0 = time.time(); txt = req.get('text', '').strip()
                lang = req.get('lang') if req.get('lang') in tlumacz.JEZYKI else 'pl'
                data, kto = TTS_CACHE.get((lang, txt)), 'cache'
                if data is None:
                    data, kto = tts(txt, lang)
                    if len(TTS_CACHE) > 300: TTS_CACHE.clear()
                    TTS_CACHE[(lang, txt)] = data
                self.send_response(200); self.send_header('Content-Type', 'audio/mpeg'); self.send_header('Cache-Control', 'no-store')
                self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data)
                log(dict(t='tts', ms=int((time.time() - t0) * 1000), chars=len(req.get('text', '')), bytes=len(data), kto=kto))
                return
            self.js(dict(error='nie ma takiego adresu'), 404)
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:400]; log(dict(t='err', path=p, code=e.code, msg=msg)); self.js(dict(error=msg), 502)
        except Exception as e:
            log(dict(t='err', path=p, msg=str(e), tb=traceback.format_exc()[-800:])); self.js(dict(error=str(e)), 500)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT') or 8790)
    host = os.environ.get('HOST') or '127.0.0.1'
    try:
        import wiedza; threading.Thread(target=wiedza._wczytaj, daemon=True).start()   # baza kart gov.pl wczytuje się w tle (kilka sekund)
    except Exception as e: print('wiedza:', e)
    srv = ThreadingHTTPServer((host, port), H)
    print('mObywatel: http://%s:%d  (pliki: %s)' % ('127.0.0.1' if host in ('0.0.0.0', '::') else host, port, ROOT), flush=True)
    srv.serve_forever()
