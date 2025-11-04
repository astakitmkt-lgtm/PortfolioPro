# PortfolioPro

Gestione di un portafoglio progetti con report settimanali per PM, dashboard centralizzata e creazione/assegnazione progetti. Stack: Express (TS) + React (Vite) con storage in-memory.

## Requisiti
- Node.js 18+

## Setup

In due terminal:

Backend:
```bash
cd server
npm install
npm run dev
```
Avvia su `http://localhost:4000`.

Frontend:
```bash
cd client
npm install
npm run dev
```
Apri `http://localhost:5173` (proxy su `/api` verso backend).

## Endpoints principali
- `GET /api/projects` elenco progetti
- `POST /api/projects` crea progetto
- `PUT /api/projects/:id` aggiorna progetto
- `GET /api/managers` elenco PM
- `POST /api/managers` crea PM
- `POST /api/reports` crea report settimanale

## Modelli (PRINCE2/PMI)
- Project: name, businessCaseSummary, objectives, scope, constraints, assumptions, dates, budgetPlanned, sponsor, projectManagerId, methodology, stage, statusRAG, risksSummary, issuesSummary, dependencies, benefitsSummary, toleranceSummary, priority, percentComplete, forecastEndDate
- WeeklyReport: projectId, weekStart/weekEnd, summary, accomplishments, plansNextWeek, blockers, risksUpdates, issuesUpdates, decisions, actions, lessonsLearned, budgetSpentToDate, scheduleRAG, scopeRAG, qualityRAG, overallRAG, percentComplete
- ProjectManager: name, email

## Note
- Dati in memoria: riavvio = reset.
- Per produzione, sostituire con DB (es. Postgres/Prisma) e auth.


