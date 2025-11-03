# Admin Pages – Präsentationsnotizen

## 1. Projektvorstellung: Admin Pages für Masterbewerbungen
- Kontext: Übergang vom manuellen Bewerbungsmanagement zur Web-Anwendung.
- Ziel: Standardisierter, transparenter und effizienter Review-Prozess.
- Agenda: Überblick, Hauptseiten, Workflows, Rollen, Export, Ausblick.

## 2. Ausgangssituation: Manueller Prozess
- Verteilte Dokumente/Medienbrüche, inkonsistente Statusführung.
- Aufwendig: Koordination, Nachfragen, Zusammenführen von Informationen.
- Kaum Auswertungen, geringe Transparenz über Forts
- 
- chritt und Engpässe.

## 3. Ziele und Mehrwert
- Einheitlicher Workflow mit klaren Schritten (Dokumente → Kurse → Skills).
- Nachvollziehbarkeit: konsistente Status, Timestamps, zentrale Datenhaltung.
- Effizienz: Filter/Suche, Automatisierung, CSV-Export für Berichte.

## 4. Systemüberblick (Architektur)
- Frontend: Nuxt 3, Admin-Bereich unter `app/pages/admin/*`.
- Auth: `app/middleware/auth.ts` (Route-Schutz, Password-Policy bei temporären Passwörtern).
- APIs: `server/api/admin/*` (Accounts, Applicants, Review, Export, Settings, Roles).
- Datenbank/Utilities: `server/database/*`, `server/utils/*` (u. a. Dokumenten- und PDF-Handling, Storage).

## 5. Login und Zugriff
- Login-Seite: `app/pages/admin/login.vue` → `/api/auth/login`.
- Route-Middleware: nicht eingeloggte Nutzer → Redirect auf Login.
- Temporäre Passwörter erzwingen Passwort-Änderung (`/admin/user/change-password`).

## 6. Dashboard und Statistiken
- Komponente: `app/components/admin/stats.vue` (eingebunden in `app/pages/admin/stats.vue`).
- Kennzahlen: Total Applications, Acceptance Rate, Completed Reviews, Different Countries.
- Visualisierungen: Weltkarte (Länder), Donut (Status-Verteilung), Area-Chart (Zeitverlauf).
- Datenquellen: `/api/applicants`, `/api/application`, `/api/admin/settings`.

## 7. Bewerberübersicht
- Seite: `app/pages/admin/applicants.vue` → `/api/admin/applicants`.
- Funktionen: Suche, Filter (Major/Review-Status), Sortierung, Pagination.
- Review-Status-Badge und Aktionsmenü (Modals für Review-Schritte, Delete).
- Zeigt Anzahl und Paging-Header (`X-Total-Count`).

## 8. Review: Dokumente
- Komponente: `app/components/admin/review/Documents.vue`.
- Pflichtdokumente als Status (RadioGroup): CV, Schul-, Bachelorzeugnis, Transcript, Kursbeschreibung, Englisch, ggf. Tests.
- Aktionen: Speichern, Ablehnen (POST `/api/admin/applicants/{id}` mit `status: rejected`).
- API: POST `/api/admin/review/documents` (persistiert Einzelstatus je Dokument).

## 9. Review: Kursanalyse
- Komponente: `app/components/admin/review/CourseAnalysis.vue`.
- Kursliste mit AI-Vorhersagen (Name, Credits, Subject Area) und manueller Bestätigung/Korrektur.
- PDF-Vorschau via `PdfViewer` (Kursbeschreibungen/Transcript), synchrones Scrollen per `page`.
- Unterstützt spätere Automatisierung (siehe Utilities: `coursePrediction`, `courseDescriptionMatcher`).

## 10. Review: Personal Skills
- Komponente: `app/components/admin/review/PersonalSkills.vue`.
- Erfassung von Skills mit Punkten (bis 25), Liste pflegen (hinzufügen/entfernen).
- Validierung via `zod` (Min/Max).

## 11. Einstellungen: Accounts & Rollen
- Seite: `app/pages/admin/settings/accounts.vue` → `/api/admin/accounts`.
- Funktionen: Suche, Sortierung, Rollenanzeige, Aktivieren/Deaktivieren, Bearbeiten, Löschen.
- Rollen-API: `server/api/admin/roles/index.get.ts`.
- Seed-Rollen (Beispiel): admin, user, guest (`server/tasks/seedRoles.ts`).

## 12. Benutzer: Passwort ändern
- Seite: `app/pages/admin/user/change-password.vue` → `/api/admin/user/change-password`.
- Validierung (Passwortlänge, Bestätigung), Session-Clear, Redirect zu Login.

## 13. Export & Berichte
- CSV-Export: `app/components/course-analysis/AdminCSVButton.vue` → `/api/admin/exportcsv`.
- Nutzung für Reporting/Controlling und Datentransfer.

## 14. Sicherheit & Datenschutz
- Authentifizierung, Route-Gating (Middleware) und Passwort-Policies.
- Rollenbasierter Zugriff auf Admin-Funktionen.
- Sichere Dateispeicherung (Objektspeicher; vgl. `server/utils/minio.ts`).

## 15. Ausblick
- Audit-Logs (Änderungshistorie), Benachrichtigungen/Reminders.
- Erweiterte KPIs/Filter, feinere Rollen/Scopes.
- Weitere Automatisierungen (Dokumenten-Validierung, Kurse-Matching).

---

Hinweise für die Live-Demo
- Start mit `/admin/login`, dann `/admin/stats` für Überblick.
- Wechsel zu `/admin/applicants`, Filter und Aktionen zeigen.
- Dokumenten-Review-Modal öffnen, Status setzen, Ablehnung demonstrieren.
- Kursanalyse anzeigen, AI-Vorschläge vs. manuelle Korrektur zeigen, PDF-Vorschau.
- Einstellungen → Accounts: Rollen/Berechtigungen demonstrieren.
- CSV-Export-Button auslösen (zeigt Download-Flow).
