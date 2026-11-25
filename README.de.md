# Reaction Snake

Ein neonfarbenes Snake-Arcade-Spiel mit Fokus auf schnelle Reaktionen, präzise Steuerung und effiziente Darstellung. Das Spiel ist auf Offline-Nutzung ausgelegt.

**Spielen:** https://vanil-kwon.github.io/reaction-snake/  
**Sprachen:** Deutsch · English · Русский

[English documentation](README.md) · [Русская документация](README.ru.md)

## Funktionen
- Fünf Spielmodi: Klassisch, Reflex, Überleben, Präzision und Täglich.
- 16 kosmetische Snake-Skins, 40 Erfolge und ein ausgewogenes lokales Münzsystem.
- 40 Erfolge, darunter geheime Erfolge.
- Anzeige der Reaktionszeit, Punktestand und persönlicher Bestwerte.
- Soundeffekte und prozedurale Hintergrundmusik mit der Web Audio API.
- Helles und dunkles Design, getrennte Schalter für Sound und Musik sowie reduzierte visuelle Effekte.
- Responsive Touch-Steuerung und Tastatureingabe.
- Installierbare Web-App-Unterstützung und Offline-Caching über einen Service Worker.
- Benutzeroberfläche auf Deutsch, Englisch und Russisch.
- Lokale Spielstände: Fortschritt und Einstellungen bleiben im Browser auf dem jeweiligen Gerät.

## Spielmodi

| Modus | Spielprinzip |
| --- | --- |
| Klassisch | Klassische Snake-Regeln. Vermeide Wände und den eigenen Schwanz. |
| Reflex | Fünf Reaktionsrunden: Warte auf das grüne Signal und tippe so schnell wie möglich. Zu frühes Tippen zählt als Fehlstart. |
| Überleben | Drei Leben; mit steigendem Punktestand erscheinen Hindernisse. Mit 20 Punkten gewinnst du. |
| Präzision | Triff 15 Ziele. Jedes läuft nach 4,2 Sekunden ab; drei Fehler beenden den Lauf. |
| Täglich | Eine tägliche Herausforderung mit festgelegtem Zufalls-Seed. Mit 25 Punkten ist sie abgeschlossen. |

## Münzen und Fortschritt

- Für jede eingesammelte Kugel gibt es 1 Münze.
- Abschlussbonus: Reflex 8, Überleben 12, Präzision 10 Münzen; Täglich gibt einmal pro lokalem Kalendertag 20 Münzen.
- Erfolge bringen zusätzliche einmalige Belohnungen.
- Skins kosten zwischen 45 und 940 Münzen. Sie sind rein kosmetisch und bieten keinen Spielvorteil.
- Münzen und Freischaltungen bleiben auf dem Gerät. Es gibt keine Käufe, Werbung oder Pay-to-win-Upgrades.

## Steuerung
- **Touchscreen:** Wische in die gewünschte Richtung.
- **Tastatur:** Pfeiltasten oder WASD.
- **Pause:** Leertaste oder P.

## Sprache

Öffne **Einstellungen → Sprache** und wähle Deutsch, English oder Русский. Die Sprache wird sofort angewendet und lokal gespeichert. Nach dem Zwischenspeichern der Dateien kann das Spiel offline gestartet werden.

## Leistung und Datenschutz

- Das Spielfeld wird mit HTML Canvas 2D und requestAnimationFrame gerendert.
- In den Einstellungen lassen sich visuelle Effekte reduzieren, um die Darstellung auf leistungsschwächeren Geräten zu entlasten.
- Es gibt keine Spielanalyse und keinen externen Analytics-Dienst.
- Bestwerte, Münzen, Skins, Erfolge und Einstellungen werden lokal im Browser gespeichert. Das Löschen der Website-Daten kann diesen Fortschritt entfernen.
- Ein Konto oder Spielserver ist nicht erforderlich.

## Lokal starten

Da das Spiel einen Service Worker verwendet, sollte es über einen lokalen HTTP-Server und nicht direkt als HTML-Datei gestartet werden.

    python -m http.server 8000

Danach http://localhost:8000/site/ im Browser öffnen.

## Projektstruktur

    site/
      index.html
      manifest.json
      service-worker.js
    .github/workflows/deploy.yml
    README.md
    README.ru.md
    README.de.md

GitHub Pages veröffentlicht den Inhalt des Ordners site/.

## Entwicklungshinweise

Das Spiel basiert auf HTML, CSS und Vanilla JavaScript. Es benötigt zur Laufzeit weder ein Framework noch externe JavaScript-Abhängigkeiten. Änderungen sollten Offline-Unterstützung, Kompatibilität lokaler Spielstände, präzise Steuerung und geringe Rendering-Kosten erhalten.

## Lizenz

Im Repository ist derzeit keine Lizenz angegeben. Solange keine Lizenz hinzugefügt wurde, sollte der Code nicht als uneingeschränkt wiederverwendbar betrachtet werden.