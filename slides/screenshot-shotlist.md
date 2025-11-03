# Admin-Bereich – Screenshot Shotlist

Ziel: Vollständige Bildstrecke zur Erklärung der Admin-Funktionalitäten. Für jede Aufnahme: gewünschter Viewport, URL, Interaktion, was in PowerPoint zu beschriften ist.

Hinweis: Startet lokal die App (z. B. `npm run dev`) und loggt euch mit einem Admin-Account ein. Nutzt den Browser-Vollseiten-Screenshot (DevTools > „Full Size Screenshot“) oder OS-Screenshot. Empfohlene Auflösung: 1440×900.

## 1) Login
- URL: `/admin/login`
- Viewport: 1440×900
- Inhalt: Login-Formular (E-Mail, Passwort), Login-Button, Fehlermeldung-Bereich.
- Beschriftungen: „Authentifizierung“, „Server-Validierung“, „Redirect auf Admin“. 

## 2) Passwort ändern (temporäres Passwort)
- URL: `/admin/user/change-password`
- Viewport: 1440×900
- Inhalt: Formular mit 3 Feldern + Hinweise, Button „Submit“.
- Beschriftungen: „Policy/Validierung“, „Session reset + Redirect“.

## 3) Dashboard/Statistiken
- URL: `/admin/stats`
- Viewport: 1440×900
- Inhalt: Weltkarte (Applications by Country), Donut-Chart (Status), Area-Chart (Zeitverlauf), KPI-Karten.
- Beschriftungen: „KPIs“, „Status-Verteilung“, „Zeitverlauf“, „Länderabdeckung“.

## 4) Bewerberliste – Filter & Tabelle
- URL: `/admin/applicants`
- Viewport: 1440×900
- Interaktion: Filter (Search, Major, Review Status) sichtbar; Pagination unten einblenden.
- Inhalt: Tabelle mit Spalten, Actions-Menü rechts.
- Beschriftungen: „Filter/Suche“, „Sortierung“, „Status-Badge“, „Kontextmenü mit Review-Schritten“.

## 5) Dokumenten-Review (Modal)
- URL: `/admin/applicants`
- Interaktion: In der ersten Tabellenzeile Actions-Menü öffnen → „1. Documents Review“ klicken.
- Viewport: 1440×900 (Fullscreen-Modal)
- Inhalt: Kopfzeile mit Bewerberdaten, Status-Radio-Gruppen je Dokument, Buttons „Continue“ und „Reject“ (mit Confirm-Modal).
- Beschriftungen: „Pflichtdokumente“, „Status speichern“, „Ablehnen (API-Call)“.

## 6) Kursanalyse-Review (Modal)
- URL: `/admin/applicants`
- Interaktion: Actions-Menü → „2. Courses Review“.
- Viewport: 1440×900 (Fullscreen-Modal)
- Inhalt: Kurskarten mit Feldern (Name, Credits, Subject Area) inkl. AI Prediction/Applicant-Werte; rechts Tab „Course Descriptions“ mit PDF-Viewer.
- Beschriftungen: „AI-Vorhersagen vs. manuelle Korrektur“, „PDF-Vorschau/Seiten-Navigation“.

## 7) Personal Skills (Modal)
- URL: `/admin/applicants`
- Interaktion: Actions-Menü → „3. Personal Skills Review“.
- Viewport: 1440×900 (Fullscreen-Modal)
- Inhalt: Formular zum Hinzufügen (Beschreibung + Punkte), Liste der Skills.
- Beschriftungen: „Validierung (zod)“, „Punktelimits“, „Pflege der Liste“.

## 8) Einstellungen – Accounts-Übersicht
- URL: `/admin/settings/accounts`
- Viewport: 1440×900
- Inhalt: Tabelle mit Suche/Sortierung, Rollen-Badges, Actions-Menü (Edit/Activate/Deactivate/Delete), Create-Modal-Button.
- Beschriftungen: „Rollen & Status“, „CRUD-Aktionen“, „Server-Integration (`/api/admin/accounts`)“.

## 9) CSV-Export
- URL: Seite/Komponente mit Download-Button (z. B. `course-analysis` Bereich)
- Interaktion: „Download“ klicken (Button aus `AdminCSVButton.vue`).
- Inhalt: Fokus auf Button und ggf. Download-Bestätigung im Browser.
- Beschriftungen: „/api/admin/exportcsv“, „Berichtsexport“.

---

Tipps für gleichmäßige Screenshots:
- Browser-Zoom auf 100 %, gleiche Auflösung, Light/Dark Mode konsistent.
- Vor jeder Aufnahme kurz warten, bis Ladezustände abgeschlossen sind.
- Falls Tabellen leer sind, Dummy-Daten seeden (siehe `server/tasks/seed*`).
