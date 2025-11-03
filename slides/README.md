# Admin-Bereich Präsentation (.pptx)

> Hinweis: Die generierte `admin-portal-admin.pptx` ist nicht Teil des Repos. Erstelle sie bei Bedarf mit dem unten beschriebenen Skript.

Diese Präsentation stellt die Admin-Funktionen des Bewerbungsportals nicht‑technisch vor. Sie enthält Platzhalter für Screenshots, klare Titel/Bullets und Sprechernotizen.

## Erzeugen

1) Abhängigkeit installieren (einmalig):

   pip install python-pptx

2) Präsentation generieren:

   python scripts/generate_admin_pptx.py

Die Datei wird unter `slides/admin-portal-admin.pptx` erstellt.

## Screenshots einfügen

- Öffne die `admin-portal-admin.pptx` in PowerPoint.
- Jeder Slide enthält unten einen grau gestrichelten Rahmen mit der Beschriftung „Screenshot hier einfügen …“. Ziehe deinen Screenshot dort hinein oder ersetze den Rahmen durch das Bild.
- Nutze die Shotlist als Referenz: `slides/screenshot-shotlist.md`.

Empfohlene Benennung (optional, für saubere Ablage):
- `slides/screenshots/01-login.png`
- `slides/screenshots/02-change-password.png`
- `slides/screenshots/03-dashboard.png`
- `slides/screenshots/04-applicants.png`
- `slides/screenshots/05-review-documents.png`
- `slides/screenshots/06-review-courses.png`
- `slides/screenshots/07-review-skills.png`
- `slides/screenshots/08-settings-accounts.png`
- `slides/screenshots/09-export.png`

## Inhaltliche Quelle

- Talking Points: `slides/admin-pages-talking-points.md`
- Shotlist: `slides/screenshot-shotlist.md`

Die Folien sind bewusst nicht-technisch formuliert (Zielgruppe: bisheriges manuelles Prüfteam).
