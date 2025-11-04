# Guida al Deployment di PortfolioPro

Questa guida ti aiuterà a fare il deployment di PortfolioPro su Render.com (gratuito) o Railway.app.

## Opzione 1: Render.com (Consigliato - Gratuito)

### Prerequisiti
1. Account su [Render.com](https://render.com) (gratuito)
2. Repository GitHub già configurato

### Passi per il Deployment

#### 1. Preparazione Backend + Frontend Unificato

Il setup attuale serve il backend su una porta e il frontend su un'altra. Per Render, configuriamo il backend per servire anche il frontend in produzione.

#### 2. Deploy su Render

1. **Vai su Render Dashboard** → "New +" → "Web Service"

2. **Connetti il Repository GitHub**
   - Seleziona il repository `PortfolioPro`
   - Assicurati che sia connesso

3. **Configurazione del Service**
   - **Name**: `portfoliopro` (o come preferisci)
   - **Environment**: `Node`
   - **Region**: Scegli la più vicina (es. Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server` (per ora, poi modificheremo)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Environment Variables**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render assegna automaticamente, ma specificalo)

5. **Clicca "Create Web Service"**

6. **Attendi il Build** (può richiedere 5-10 minuti)

#### 3. Dopo il Deploy

Render ti darà un URL tipo: `https://portfoliopro-xxxx.onrender.com`

### Problema con SQLite su Render

⚠️ **IMPORTANTE**: Render ha file system ephemeral (non persistente). Il database SQLite verrà perso ad ogni riavvio.

**Soluzioni**:
1. **Usa PostgreSQL** (gratuito su Render) - Consigliato
2. **Usa un volume persistente** (solo su piani a pagamento)

## Opzione 2: Railway.app (Alternativa)

Railway offre un free tier più generoso.

1. Vai su [Railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Seleziona il repository
4. Railway rileva automaticamente Node.js
5. Configura le variabili d'ambiente
6. Deploy automatico!

## Opzione 3: Vercel (Solo Frontend) + Render (Backend)

1. Frontend su Vercel (gratuito, ottimo per React)
2. Backend su Render
3. Configura il frontend per puntare all'URL del backend

## Configurazione CORS

Assicurati che il backend accetti richieste dal frontend remoto aggiornando `server/src/index.ts` con gli URL corretti.

## Note Importanti

- **Database**: SQLite non è ideale per produzione. Considera PostgreSQL
- **HTTPS**: Render e Railway forniscono SSL automaticamente
- **Domain**: Puoi aggiungere un dominio personalizzato
- **Monitoring**: Render offre log e monitoring base

## Prossimi Passi

1. ✅ Deploy backend
2. ⬜ Configura database persistente (PostgreSQL)
3. ⬜ Deploy frontend (o servirlo dal backend)
4. ⬜ Configura dominio personalizzato
5. ⬜ Setup backup automatici

