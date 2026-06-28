# Design: Redesign formato generazione US e Task

**Data:** 2026-06-28  
**File coinvolti:** `backend/app/services/ai_service.py` (solo `SYSTEM_PROMPT`)  
**Scope:** Solo modifica al prompt — zero cambiamenti a schema, DB, frontend.

---

## Problema

Il formato attuale genera:
- **User Story title**: `"As a [role], I want [goal] so that [reason]"` — stile inglese generico nel titolo
- **Task description**: steps tecnici concreti in prosa libera

L'utente vuole il formato Agile italiano standard, con criteri di accettazione espliciti e ruoli specifici.

---

## Soluzione: Approccio A — solo prompt

Nessuna modifica allo schema `GenerateResponse` / `TaskGenerated` / `UserStoryGenerated`. Il campo `description` del Task già esiste come stringa libera — basta cambiare cosa il modello ci mette dentro.

---

## Formato User Story

**title:** `"US N — Titolo area funzionale"`

Esempi:
- `"US 1 — Creazione modulo e configurazione"`
- `"US 2 — Identificazione e creazione dei modelli Odoo"`

**description:** frase breve di contesto (max 1 riga) oppure stringa vuota. Serve solo come label del raggruppamento.

---

## Formato Task

**title:** nome descrittivo corto, senza numero, senza verbo imperativo.

Esempi:
- `"Creazione modulo docmon_ai"`
- `"Installazione libreria OpenAI"`
- `"Configurazione API Key nei settings"`

**description:** formato italiano story + criteri di accettazione:

```
Come [ruolo specifico], voglio [azione concreta con artefatti], in modo da [beneficio tangibile].

Criteri di accettazione:
- criterio 1
- criterio 2
- criterio 3
```

Regole per la description:
- Ruolo specifico: "sviluppatore backend", "amministratore", "utente autenticato" — mai solo "utente"
- L'azione deve nominare artefatti concreti (file path, model class, endpoint, config key)
- Il beneficio deve essere tangibile, non generico ("in modo da avere una base installabile", non "in modo da migliorare il sistema")
- 3–5 criteri di accettazione, verificabili e concreti
- Linguaggio: italiano se l'input è in italiano, inglese se inglese (regola già esistente)

---

## Cosa NON cambia

- Schema JSON (`user_stories`, `tasks`, tutti i campi)
- Frontend rendering
- DB models
- Pipeline di parsing (`extract_final_output`, `parse_and_validate`)
- Campi `effort`, `effort_hours`, `confidence`, `assumptions` — restano invariati
- Regola TASK SPECIFICITY (artefatti concreti nel titolo) — si applica ora al campo `title` del task
- Validazione NOT_A_PROJECT
- Gestione `tasks_only` mode

---

## Esempio output atteso

```json
{
  "user_stories": [
    {
      "id": "us_1",
      "title": "US 1 — Creazione modulo e configurazione",
      "description": "",
      "order": 1,
      "tasks": [
        {
          "id": "task_1",
          "user_story_id": "us_1",
          "title": "Creazione modulo docmon_ai",
          "description": "Come sviluppatore, voglio creare il modulo Odoo docmon_ai con manifest, struttura cartelle e dipendenza da docmon, in modo da avere una base installabile e separata dal modulo community.\n\nCriteri di accettazione:\n- Il modulo è installabile in Odoo 18 senza errori\n- Il manifest dichiara depends: ['docmon'] e licenza OEEL-1\n- La struttura rispetta le convenzioni Odoo (models/, views/, security/, data/)",
          "order": 1,
          "effort": "S",
          "effort_hours": { "min": 1, "max": 2 },
          "confidence": 0.95,
          "assumptions": []
        }
      ]
    }
  ]
}
```

---

## Implementazione

Modifica unica: riscrivere la sezione OUTPUT del `SYSTEM_PROMPT` in `backend/app/services/ai_service.py`:

1. Cambiare l'istruzione sul titolo della US: da `"As a [role], I want..."` a `"US N — <titolo area>"`
2. Cambiare l'istruzione sulla description della US: frase breve o stringa vuota
3. Cambiare l'istruzione sul titolo del Task: nome descrittivo corto senza numero
4. Cambiare l'istruzione sulla description del Task: formato `Come... voglio... in modo da...` + `Criteri di accettazione:`
5. Aggiornare la regola TASK SPECIFICITY per riferirsi al titolo del task (non alla description)
6. Invalidare la cache esistente (già automatica per nuovi input; i vecchi TTL scadono in 10 min)
