# Uzgodnienie płci w mObywatelu — projekt na mObywatel Challenge

## Problem: procedura istnieje tylko w orzecznictwie

Od marca 2025 r. sprawy o zmianę oznaczenia płci toczą się w trybie nieprocesowym, ale ich podstawą jest uchwała SN stosowana przez analogię, a nie przepis ustawy. Każdy sąd rejonowy może ją ocenić inaczej.

| Data | Zdarzenie | Znaczenie |
| --- | --- | --- |
| 2026 (opisane 24.04.2026) | [Sąd Rejonowy w Białymstoku pyta TSUE](https://www.prawo.pl/prawnicy-sady/uchwala-sn-dotyczaca-korekty-plci-sklad-z-sedziami-powolanymi-od-2018-r,1543451.html) | Czy uchwałę III CZP 6/24 uznać za niebyłą z powodu składu i czy zmiana ma działać wstecz |
| 3.07.2026 | [Rozporządzenie MS z 26.06.2026 (Dz.U. poz. 897)](https://bip.brpo.gov.pl/sites/default/files/2026-08/Odpowiedz_MS_plec_metrykalna_uzgodnienie_24_08_2026.pdf) zmienia Regulamin urzędowania sądów | Usunięto odesłanie do art. 189 k.p.c.; resort zakłada, że praktyka z uchwały „się utrwali”, ustawy nie zapowiada |
| 4.03.2025 | [Uchwała pełnego składu Izby Cywilnej SN, III CZP 6/24](https://www.sn.pl/sites/orzecznictwo/Orzeczenia3/III%20CZP%206-24-2.pdf) | Tryb nieprocesowy, art. 36 PASC przez analogię, bez pozywania rodziców; małżonek uczestnikiem; skutek na przyszłość |
| 4.03.2025 | [Prokurator Generalny nie bierze udziału w posiedzeniu SN](https://www.gov.pl/web/prokuratura-krajowa/komunikat-ws-postepowania-dot-uzgodnienia-plci3) | Wcześniej próbował cofnąć wniosek; SN uznał to za niedopuszczalne (7.06.2024) |
| 2015 | Sejm uchwala ustawę o uzgodnieniu płci | Ustawa nie weszła w życie |
| 22.09.1995 | Uchwała SN III CZP 118/95 | Pozwanymi w sprawie są rodzice — reguła obowiązująca przez 30 lat |
| 22.06.1989 | Uchwała 7 sędziów SN III CZP 37/89 | Transpłciowość nie jest podstawą sprostowania aktu urodzenia |

Dlaczego obecny stan jest niestabilny:

1. **Brak przepisu.** Procedurę stosuje się przez analogię do przepisu o sprostowaniu błędów w aktach. Rozporządzenie o urzędowaniu sądów porządkuje tylko ich pracę i nie może tworzyć trybu postępowania.
2. **Uchwała nie wiąże sądów powszechnych.** Zasada prawna wiąże wyłącznie składy SN, co [potwierdza RPO](https://www.rpo.gov.pl/sites/default/files/2023-12/Do_TK_SN_uchwala_zasady_prawne_uzasadnienie_19.12.2023.pdf). Sąd Rejonowy w Zwoleniu ([I Ns 69/25](https://dlajurysty.pl/orzeczenia/pokaz/154743/I-Ns-69-25)) zastosował ją, ale wprost zaznaczył, że nie był nią związany.
3. **Sędziowie podważający Sąd Najwyższy.** W składzie, który podjął uchwałę, zasiadało 19 sędziów powołanych na wniosek KRS ukształtowanej ustawą z 2017 r. Część sędziów i [komentatorów](https://www.kwartalnikiustitia.pl/wp-content/uploads/2026/04/1-4-55-2025-Prawo-cywilne-1.pdf) traktuje to jako powód, by uchwałę pominąć — nawet gdy, jak sąd w Białymstoku, sami chcą dla wnioskodawców dalej idącej ochrony niż SN. Sąd rejonowy pyta więc TSUE, czy wolno mu uznać za niebyłe rozstrzygnięcie pełnego składu Izby Cywilnej SN, a wnioskodawca czeka. Nie wie, czy jego sprawa pójdzie według uchwały, według starych zasad, czy utknie do czasu odpowiedzi z Luksemburga. Z perspektywy obywatela to nie obrona praworządności, tylko jej brak. Odpowiedzią nie jest kolejna uchwała, lecz ustawa, której żaden sąd nie może pominąć.
4. **Spór o skutek.** Ten sam białostocki sąd, który kwestionuje skład SN, proponuje własną, dalej idącą wykładnię: zmianę ze skutkiem od dnia sporządzenia aktu urodzenia, a nie od uprawomocnienia orzeczenia. W jednej sprawie próbuje więc uchwałę jednocześnie podważyć i poprawić. O skutkach zmian stanu cywilnego powinien decydować ustawodawca, a nie pojedynczy skład — inaczej rozbieżne orzeczenia oznaczają rozbieżne dokumenty.
5. **Wymogi europejskie.** TSUE w sprawie [C-4/23 Mirin](https://curia.europa.eu/jcms/jcms/p1_4584831/cs) przypomniał za ETPC, że państwa muszą zapewnić jasną i przewidywalną procedurę uznania płci. Dziś Polska ma procedurę przewidywalną tylko do momentu, w którym trafi się na sędziego o innym poglądzie.

## Rozwiązanie: sprawa „Oznaczenie płci” w mObywatelu

Funkcja jest wbudowana w prototyp mobywatel.ai Janusza Cieszyńskiego (licencja MIT) jako nowa sprawa w rozmowie: działa w trybie skryptowym i z asystentem AI. Na górze ekranu stale widnieje informacja, że to nie jest prawdziwa usługa rządowa. Przebieg:

1. **Wejście.** Podpowiedź „Chcę zmienić oznaczenie płci” na ekranie rozmowy albo dowolna prośba o zmianę płci, tranzycję lub oznaczenie niebinarne.
2. **Przełącznik.** Karta z wpisem z rejestru PESEL i jednym przełącznikiem K | M | X. Pod nim opis skutków: nowy PESEL i forma nazwiska, a przy X — PESEL bez zmian i oznaczenie X w dowodzie i paszporcie.
3. **Imię (opcjonalnie).** Propozycje albo własne imię; zmiana w tej samej sprawie, za jedną opłatą.
4. **Oświadczenie i Face ID.** Osoba stanu wolnego składa je do USC. Osoba w związku małżeńskim — do sądu, z małżonkiem jako uczestnikiem (projekt art. 36c); aplikacja przygotowuje i składa wniosek.
5. **Czas na namysł albo postanowienie.** 30 dni i potwierdzenie albo postanowienie sądu w skrzynce. W pokazie można przejść od razu do tego dnia; wniosek da się wycofać.
6. **Wpis i dalsze kroki.** Nowy PESEL, zaktualizowane karty w portfelu, a potem lista gotowych wniosków:
   - dowód osobisty (bezpłatnie, wizyta na odciski palców);
   - paszport (umówiona wizyta) i wymiana prawa jazdy (zawiera PESEL);
   - zmiana imienia w USC, jeśli nie została złożona w kroku 3;
   - jedna zgoda na przekazanie danych do ZUS, NFZ, urzędu skarbowego i pracodawcy;
   - nowe świadectwa i dyplomy bez wzmianki o zmianie;
   - odpis skrócony aktu urodzenia w skrzynce.

W pokazie osoba Kacper przechodzi ścieżkę przez USC, a Marta, Jan i Ewa — ścieżkę sądową.

W obecnym stanie prawnym kroki 2–6 nie mają podstawy w ustawie. Prototyp pokazuje funkcję po wejściu w życie zmian z ostatniej części tego dokumentu; do tego czasu aplikacja mogłaby jedynie przygotować wniosek do sądu rejonowego.

## Uzasadnienie: prostsza procedura, mniej biurokracji, pewne prawo

Projekt zamienia sprawę sądową opartą na analogii w zwykłą sprawę administracyjną z przepisem, terminem i odwołaniem. Różnice w jednym zestawieniu:

|  | Dziś (uchwała III CZP 6/24) | Po zmianie |
| --- | --- | --- |
| Podstawa prawna | Art. 36 PASC stosowany przez analogię | Nowy art. 36a PASC |
| Kto rozstrzyga | Sąd rejonowy | Kierownik USC; odwołanie do wojewody, skarga do WSA |
| Uczestnicy | Wnioskodawca, małżonek | Wnioskodawca (małżonek — ścieżka sądowa, patrz niżej) |
| Dowody | Według uznania sądu, często opinie lekarzy i biegłych | Oświadczenie pod rygorem odpowiedzialności karnej |
| Przewidywalność | Zależy od poglądu sędziego na uchwałę i jej skład | Jeden przepis w całym kraju |
| Skutek w czasie | Sporny (białostockie pytanie do TSUE) | Ustawowo: od dnia wpisu, z ochroną danych sprzed zmiany |
| Aktualizacja rejestrów | Wnioskodawca obchodzi urzędy z odpisem orzeczenia | Z urzędu; dokumenty zamawiane w aplikacji |

Korzyści w czterech punktach:

- **Deregulacja i cyfryzacja.** Jedna sprawa w telefonie zamiast pozwu, rozprawy, odpisów i kilku wizyt w urzędach. To naturalny ciąg dalszy [ustawy o aplikacji mObywatel z 26 maja 2023 r.](https://eli.gov.pl/eli/DU/2023/1234/ogl/pol/pdf), która dała państwu cyfrowy dokument tożsamości.
- **Odciążenie sądów.** Sprawy o ustalenie płci są w Regulaminie urzędowania sądów oznaczone jako pilne, więc wyprzedzają inne. Przeniesienie ich do USC zwalnia czas sędziów dla spraw, które naprawdę wymagają sądu.
- **Pewność prawa.** Ustawę stosuje każdy sędzia i każdy urzędnik, bez względu na to, co sądzi o składzie Sądu Najwyższego. Nie trzeba czekać na odpowiedź TSUE na pytania z Białegostoku ani na koniec sporu o status sędziów. Obywatel dostaje ten sam wynik w Białymstoku i w Szczecinie.
- **Rodzina poza salą sądową.** Rodzice nie są stroną, a małżonek zachowuje głos tam, gdzie zmiana dotyczy jego małżeństwa. Bezpieczniki (czas na namysł, karencja, szczególne zasady dla małoletnich) chronią przed decyzjami pochopnymi.

Projekt realizuje też standard europejski: TSUE w sprawie [Mirin](https://curia.europa.eu/jcms/jcms/p1_4584831/cs) wymaga jasnej i przewidywalnej procedury, a samookreślenie stosuje już [12 państw Europy](https://rainbowmap.ilga-europe.org/categories/legal-gender-recognition/), m.in. Niemcy, Hiszpania, Szwajcaria i Irlandia.

## Propozycje zmian w prawie

Proponujemy jedną ustawę zmieniającą: tryb administracyjny dla osób stanu wolnego (małoletnich za zgodą rodziców), skodyfikowany tryb sądowy dla osób w związku małżeńskim oraz automatyczną aktualizację rejestrów. Oznaczenie X wchodzi w drugim etapie, po dostosowaniu systemów.

### 1. Prawo o aktach stanu cywilnego — nowy rozdział 4a „Zmiana oznaczenia płci”

**Art. 36a.** 1. Pełnoletnia osoba niepozostająca w związku małżeńskim, której tożsamość płciowa trwale różni się od oznaczenia płci w akcie urodzenia, może złożyć wniosek o zmianę tego oznaczenia do dowolnego kierownika urzędu stanu cywilnego. 2. Wniosek zawiera oświadczenie wnioskodawcy o jego tożsamości płciowej, składane pod rygorem odpowiedzialności karnej za złożenie fałszywego oświadczenia, oraz może zawierać wskazanie nowego imienia lub imion. Wniosek można złożyć w aplikacji mObywatel. 3. Wnioskodawca potwierdza wniosek nie wcześniej niż po upływie 30 dni i nie później niż przed upływem 6 miesięcy od jego złożenia. Brak potwierdzenia w tym terminie oznacza wycofanie wniosku. 4. Po potwierdzeniu kierownik urzędu stanu cywilnego niezwłocznie zamieszcza w akcie urodzenia wzmiankę dodatkową. Odmowa następuje w drodze decyzji, od której przysługuje odwołanie do wojewody. 5. Kolejny wniosek można złożyć nie wcześniej niż po upływie roku od zamieszczenia wzmianki.

**Art. 36b.** 1. Za małoletniego wniosek, o którym mowa w art. 36a, składają jego przedstawiciele ustawowi albo małoletni za ich zgodą, bez względu na wiek małoletniego. 2. Małoletni, który ukończył 13 lat, musi wyrazić zgodę na zmianę. 3. W braku porozumienia między rodzicami rozstrzyga sąd opiekuńczy (art. 97 § 2 Kodeksu rodzinnego i opiekuńczego).

**Art. 36c.** Wobec osoby pozostającej w związku małżeńskim zmianę oznaczenia płci orzeka sąd rejonowy w postępowaniu nieprocesowym; małżonek jest uczestnikiem postępowania. Przepis przenosi do ustawy rozwiązanie przyjęte w uchwale III CZP 6/24.

**Art. 36d.** 1. Zmiana oznaczenia płci wywołuje skutki od dnia zamieszczenia wzmianki i nie wpływa na prawa i obowiązki powstałe wcześniej, w szczególności wynikające z pokrewieństwa, przysposobienia i ubezpieczeń społecznych. 2. Odpis skrócony aktu urodzenia i zaświadczenia wydawane po zmianie nie ujawniają poprzedniego oznaczenia płci ani poprzedniego imienia.

### 2. Ustawa o ewidencji ludności

- Kierownik USC z urzędu przekazuje zmianę do rejestru PESEL; numer PESEL zmienia się jak dziś na podstawie art. 19 ust. 1 pkt 2 („zmiana płci”), bez osobnego wniosku.
- Etap 2: w art. 15 dodanie przepisu, że przy oznaczeniu X numer PESEL nie ulega zmianie, a cyfra płci nie ma dla tej osoby znaczenia prawnego. Słownik płci w rejestrach rozszerzony do trzech wartości zgodnych z ICAO 9303 (K, M, X).

### 3. Ustawa o zmianie imienia i nazwiska

- Zmiana oznaczenia płci jest z mocy ustawy ważnym powodem zmiany imienia.
- Imię wskazane we wniosku z art. 36a zmienia się w tej samej sprawie, za jedną opłatą skarbową (37 zł, jak dziś za zmianę imienia).
- Nazwisko o formie męskiej lub żeńskiej przybiera z urzędu formę odpowiadającą nowemu oznaczeniu; osoba z oznaczeniem X wybiera formę we wniosku.

### 4. Dokumenty

- **Dowód osobisty:** wymiana bez opłaty (jak dziś); wniosek w mObywatelu z danymi z rejestru. Etap 2: oznaczenie X, dopuszczone przez rozporządzenie UE 2019/1157, które odsyła do standardu ICAO.
- **Paszport i prawo jazdy:** zwolnienie z opłaty przy wymianie z powodu zmiany oznaczenia płci; w paszporcie etap 2 — oznaczenie X zgodne z ICAO 9303.
- **Świadectwa szkolne, dyplomy, świadectwa pracy:** obowiązek wydania nowego dokumentu z aktualnymi danymi na wniosek, bez wzmianki o zmianie.

### 5. Ustawa o aplikacji mObywatel

- Dopisanie do katalogu usług w art. 3 ust. 1 usługi złożenia i potwierdzenia wniosku z art. 36a oraz usługi „jednej zgody” na przekazanie zaktualizowanych danych do ZUS, NFZ, KAS i wskazanego pracodawcy.

### 6. Przepisy przejściowe i wejście w życie

- Prawomocne orzeczenia wydane przed wejściem ustawy w życie, w tym na podstawie uchwały III CZP 6/24, zachowują moc. Zamyka to spór o ich ważność.
- Sprawy w toku sąd na wniosek uczestnika umarza i przekazuje do USC; w przeciwnym razie prowadzi je według nowego art. 36c lub dotychczasowych zasad.
- Etap 1 (K/M): 6 miesięcy od ogłoszenia. Etap 2 (X w rejestrach i dokumentach): 24 miesiące.

**Otwarta kwestia: oznaczenie X a zawarcie małżeństwa.** Przeszkodą nie jest art. 18 Konstytucji, który obejmuje małżeństwo ochroną, ale go nie definiuje ani nie zakazuje innych związków — tak odczytał go NSA w wyroku z 20 marca 2026 r. o transkrypcji, po [wyroku TSUE C-713/23](https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-11/cp250147pl.pdf). Ograniczenie wynika z ustawy: art. 1 § 1 Kodeksu rodzinnego i opiekuńczego wymaga oświadczeń mężczyzny i kobiety. Ustawa powinna więc wprost rozstrzygnąć, jak ten przepis stosuje się do osoby z oznaczeniem X.

## Źródła

- [Uchwała SN z 4.03.2025, III CZP 6/24 (sn.pl)](https://www.sn.pl/sites/orzecznictwo/Orzeczenia3/III%20CZP%206-24-2.pdf)
- [Prawo.pl: pytania SR w Białymstoku do TSUE (24.04.2026)](https://www.prawo.pl/prawnicy-sady/uchwala-sn-dotyczaca-korekty-plci-sklad-z-sedziami-powolanymi-od-2018-r,1543451.html)
- [RPO: wystąpienie do MS i odpowiedź MS (lipiec–wrzesień 2026)](https://bip.brpo.gov.pl/pl/content/rpo-prawne-uzgodnienie-plci-ms-odpowiedz)
- [Odpowiedź MS z 24.08.2026 (PDF)](https://bip.brpo.gov.pl/sites/default/files/2026-08/Odpowiedz_MS_plec_metrykalna_uzgodnienie_24_08_2026.pdf)
- [Prokuratura Krajowa: komunikat o posiedzeniu SN 4.03.2025](https://www.gov.pl/web/prokuratura-krajowa/komunikat-ws-postepowania-dot-uzgodnienia-plci3)
- [RPO: stanowisko w sprawie mocy wiążącej zasad prawnych SN (2023)](https://www.rpo.gov.pl/sites/default/files/2023-12/Do_TK_SN_uchwala_zasady_prawne_uzasadnienie_19.12.2023.pdf)
- [SR w Zwoleniu, I Ns 69/25](https://dlajurysty.pl/orzeczenia/pokaz/154743/I-Ns-69-25)
- [Kwartalnik Iustitia: komentarz do uchwały III CZP 6/24](https://www.kwartalnikiustitia.pl/wp-content/uploads/2026/04/1-4-55-2025-Prawo-cywilne-1.pdf)
- [TSUE, C-4/23 Mirin — komunikat prasowy](https://curia.europa.eu/jcms/jcms/p1_4584831/cs)
- [ILGA-Europe Rainbow Map 2026: uznanie płci](https://rainbowmap.ilga-europe.org/categories/legal-gender-recognition/)
- [Bundesregierung: Selbstbestimmungsgesetz (3 miesiące, roczna karencja)](https://www.bundesregierung.de/breg-de/service/gesetzesvorhaben/selbstbestimmungsgesetz-2215426)
- [Rząd Finlandii: ustawa o uznaniu płci z 2023 r. (30 dni na namysł)](https://valtioneuvosto.fi/en/-/1271139/act-on-legal-recognition-of-gender-enters-into-force-on-3-april-2023)
- [Ustawa o ewidencji ludności, art. 19 (zmiana PESEL)](https://arslege.pl/ustawa-o-ewidencji-ludnosci/k1025/s12139/)
- [gov.pl: słownik płci K/M/X wg ICAO 9303 i rozporządzenia 2019/1157](https://www.gov.pl/web/ia/4-stosowanie-referencyjnych-slownikow)
- [Ustawa z 26.05.2023 o aplikacji mObywatel](https://eli.gov.pl/eli/DU/2023/1234/ogl/pol/pdf)
- [mObywatel Challenge — zasady](https://mobywatel.ai)
