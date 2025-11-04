# 🚀 Guida Installazione PortfolioPro - Passo Passo

## 📋 Passo 1: Verifica che hai Node.js installato

1. **Apri il Terminale** (lo trovi in Applicazioni > Utility > Terminale, oppure premi ⌘+Spazio, scrivi "Terminale" e premi Invio)

2. **Scrivi questo comando** e premi Invio:
   ```bash
   node --version
   ```

3. **Cosa vedi?**
   - ✅ Se vedi un numero tipo `v18.17.0` o superiore → **Perfetto! Vai al Passo 2**
   - ❌ Se vedi "comando non trovato" → **Devi installare Node.js**

### Se NON hai Node.js:

1. Vai su: https://nodejs.org/
2. Clicca sul pulsante verde "LTS" (la versione consigliata)
3. Scarica il file `.pkg` per macOS
4. Apri il file scaricato dalla cartella **Download** (Scarica)
5. Segui l'installazione guidata:
   - Clicca "Continua" quando appare la schermata di benvenuto
   - Clicca "Continua" per accettare i termini
   - Clicca "Installa" (potrebbe chiederti la password del Mac)
   - Aspetta che finisca
6. Quando finisce, chiudi e riapri il Terminale
7. Riprova `node --version` per verificare

---

## 📂 Passo 2: Vai nella cartella del progetto

Nel Terminale, scrivi questo comando (uno alla volta) e premi Invio dopo ogni comando:

```bash
cd /Users/Teo/Documents/GitHub/PortfolioPro
```

Verifica di essere nella cartella giusta:
```bash
pwd
```

Dovresti vedere: `/Users/Teo/Documents/GitHub/PortfolioPro`

---

## 🖥️ Passo 3: Installa il Backend (Server)

1. **Vai nella cartella server:**
   ```bash
   cd server
   ```

2. **Installa tutte le librerie necessarie:**
   ```bash
   npm install
   ```
   
   ⏱️ **Aspetta** che finisca (ci vogliono 1-2 minuti). Vedrai tante righe con i nomi delle librerie.

3. **Quando vedi il prompt tornato** (quella riga con il nome del tuo Mac tipo `Teo-MacBook-Pro:server teo$`), significa che è finito! ✅

---

## 🖥️ Passo 4: Installa il Frontend (Client)

1. **Torna alla cartella principale:**
   ```bash
   cd ..
   ```

2. **Vai nella cartella client:**
   ```bash
   cd client
   ```

3. **Installa tutte le librerie necessarie:**
   ```bash
   npm install
   ```
   
   ⏱️ **Aspetta** anche qui (1-2 minuti).

4. **Quando vedi il prompt tornato**, è finito! ✅

---

## 🎬 Passo 5: Avvia il Backend (Server)

**IMPORTANTE: Avrai bisogno di 2 finestre del Terminale aperte!**

### Terminale 1 - Backend:

1. **Apri una NUOVA finestra del Terminale**:
   - Premi **⌘+N** (comando + N) oppure
   - Vai nel menu in alto: **Terminale > Nuova Finestra** (o **Shell > Nuova Finestra**)

2. **Vai nella cartella server:**
   ```bash
   cd /Users/Teo/Documents/GitHub/PortfolioPro/server
   ```

3. **Avvia il server:**
   ```bash
   npm run dev
   ```

4. **Cosa vedi?**
   - Dovresti vedere: `PortfolioPro API running on http://localhost:4000`
   - Se vedi questo messaggio, **il server è partito!** ✅
   - **LASCIA QUESTO TERMINALE APERTO** (non chiudere questa finestra!)

---

## 🌐 Passo 6: Avvia il Frontend (Client)

### Terminale 2 - Frontend:

1. **Apri un'altra NUOVA finestra del Terminale** (⌘+N)

2. **Vai nella cartella client:**
   ```bash
   cd /Users/Teo/Documents/GitHub/PortfolioPro/client
   ```

3. **Avvia il client:**
   ```bash
   npm run dev
   ```

4. **Cosa vedi?**
   - Dovresti vedere qualcosa tipo: `Local: http://localhost:5173`
   - **LASCIA ANCHE QUESTO TERMINALE APERTO!**

---

## 🎉 Passo 7: Apri la WebApp nel Browser

1. **Apri il tuo browser** (Safari, Chrome, Firefox, ecc.)

2. **Vai su questo indirizzo:**
   - Clicca sulla barra degli indirizzi (in alto)
   - Scrivi o incolla: `http://localhost:5173`
   - Premi Invio

3. **Cosa vedi?**
   - Dovresti vedere la pagina "PortfolioPro" con:
     - Un menu in alto (Dashboard, Nuovo Progetto)
     - Una tabella con i progetti (all'inizio sarà vuota)

---

## 🧪 Passo 8: Prova l'applicazione!

### Test 1: Crea un Progetto

1. Clicca su **"Nuovo Progetto"** nel menu
2. Compila il form:
   - **Nome**: Scrivi un nome, tipo "Progetto Test"
   - **Descrizione**: Scrivi una descrizione
   - **Metodologia**: Lascia "Ibrido" o scegli un'altra
   - **Project Manager**: Lascia "(non assegnato)" per ora
3. Clicca **"Crea"**
4. Dovresti vedere un messaggio "Progetto creato"

### Test 2: Vai alla Dashboard

1. Clicca su **"Dashboard"** nel menu
2. Dovresti vedere il progetto che hai appena creato nella tabella!

### Test 3: Compila un Report Settimanale

1. Dalla Dashboard, clicca su **"Report settimanale"** accanto al progetto
2. Compila il form:
   - **Sommario**: Scrivi cosa è successo questa settimana
   - **Risultati**: Scrivi cosa hai fatto
   - **Piano prossima settimana**: Scrivi cosa farai
   - **Stato**: Scegli Green, Amber o Red
   - **Avanzamento**: Scrivi un numero da 0 a 100
3. Clicca **"Invia report"**
4. Dovresti vedere "Report inviato"

---

## ❓ Problemi? (FAQ)

### "Il comando non funziona" o "comando non trovato: cd"
- Assicurati di aver premuto **Invio** dopo ogni comando
- Controlla che non ci siano errori di battitura
- Se copi e incolli, assicurati di non copiare spazi extra all'inizio o alla fine

### "npm: comando non trovato"
- Non hai Node.js installato → Vai al Passo 1 e installalo

### "Port 4000 già in uso" o "Port 5173 già in uso" o "EADDRINUSE"
- Qualcun altro programma sta usando quella porta
- Chiudi altri programmi che potrebbero usare quelle porte
- Oppure riavvia il Mac (Apple menu > Riavvia)

### "La pagina non si carica"
- Controlla che ENTRAMBI i terminali siano ancora aperti e in esecuzione
- Controlla che non ci siano errori rossi nei terminali
- Prova a ricaricare la pagina (⌘+R)

### "Errore durante npm install" o messaggi di errore rossi
- Controlla la connessione internet
- Riprova: `npm install` nella cartella dove hai avuto l'errore
- Se vedi errori tipo "permission denied" (permesso negato), prova a scrivere: `sudo npm install` (ti chiederà la password del Mac)

---

## 🛑 Come Fermare l'Applicazione

Quando hai finito di usare l'app:

1. **Vai nei 2 terminali** dove hai avviato `npm run dev`
2. **Clicca sul terminale** per attivarlo
3. **Premi** `Ctrl + C` (Control + C) in ogni terminale
4. Questo fermerà il server e il client

---

## ✅ Tutto Fatto!

Ora hai PortfolioPro installato e funzionante! 🎊

Ogni volta che vuoi usare l'app, devi:
1. Aprire 2 terminali
2. Avviare il backend (Terminale 1: `cd server` → `npm run dev`)
3. Avviare il frontend (Terminale 2: `cd client` → `npm run dev`)
4. Aprire il browser su `http://localhost:5173`

Buon divertimento! 🚀

