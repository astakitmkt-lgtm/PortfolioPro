# Deploy PortfolioPro su Fly.io

## Prerequisiti

1. Account su [Fly.io](https://fly.io) (gratuito)
2. Fly CLI installato: `curl -L https://fly.io/install.sh | sh`
3. Repository GitHub configurato

## Quick Start

### 1. Login su Fly.io

```bash
fly auth login
```

### 2. Crea l'App

```bash
fly launch
```

Quando richiesto:
- **App name**: `portfoliopro` (o un nome unico)
- **Region**: `fra` (Frankfurt) o quello più vicino
- **Postgres**: No (stiamo usando SQLite)
- **Redis**: No
- **Deploy now**: No (prima configuriamo)

### 3. Crea il Volume Persistente

```bash
fly volumes create portfoliopro_data --size 1 --region fra
```

Questo crea un volume di 1GB per il database SQLite.

### 4. Configura le Variabili d'Ambiente (Opzionale)

```bash
# Per seedare il database al primo deploy
fly secrets set SEED_DB=true

# Per permettere seed anche in produzione (opzionale)
fly secrets set NODE_ENV=production
```

### 5. Deploy

```bash
fly deploy
```

Il primo deploy può richiedere 5-10 minuti.

### 6. Apri l'App

```bash
fly open
```

Oppure visita: `https://portfoliopro.fly.dev`

## Comandi Utili

```bash
# Vedi i log
fly logs

# SSH nella VM
fly ssh console

# Vedi lo stato
fly status

# Scale up/down
fly scale count 1

# Vedi le metriche
fly dashboard
```

## Database Persistente

Il database SQLite è salvato nel volume montato `/app/data`. Il volume persiste anche dopo riavvii o deploy.

### Backup del Database

```bash
# Scarica il database
fly ssh sftp shell
# Poi: get /app/data/portfoliopro.db
```

### Restore del Database

```bash
fly ssh sftp shell
# Poi: put portfoliopro.db /app/data/portfoliopro.db
```

## Configurazione Avanzata

### Auto-scaling

Modifica `fly.toml`:

```toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0  # 0 = si ferma quando non usato (gratis!)
```

### Custom Domain

```bash
fly certs add yourdomain.com
```

Poi configura DNS per puntare a Fly.io.

## Troubleshooting

### Database non persiste

Verifica che il volume sia montato:
```bash
fly ssh console
ls -la /app/data
```

### Build fallisce

Controlla i log:
```bash
fly logs
```

### App non si avvia

Verifica le variabili d'ambiente:
```bash
fly secrets list
```

## Costi

- **Free Tier**: 
  - 3 VM condivise
  - 3GB storage
  - 160GB outbound traffic/mese
  - **Totale: $0/mese** per uso moderato

- **Paid**: Da $1.94/mese per VM dedicata

## Vantaggi Fly.io

✅ Volumes persistenti gratuiti (perfetto per SQLite)  
✅ Auto-scaling (si ferma quando non usato)  
✅ Edge computing globale  
✅ SSL automatico  
✅ Deploy veloce  
✅ Ottima documentazione  

## Prossimi Passi

1. ✅ Deploy su Fly.io
2. ⬜ Configura dominio personalizzato
3. ⬜ Setup backup automatici
4. ⬜ Monitoraggio e alerting
5. ⬜ CI/CD con GitHub Actions

