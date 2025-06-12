# Zum Projekt beitragen (Contributing)

Wir freuen uns, dass du überlegst, zu diesem Projekt beizutragen! Jede Hilfe ist willkommen. Um den Prozess für alle einfach und transparent zu halten, lies bitte diese kurze Anleitung.

## Unser Entwicklungs-Workflow

Wir verwenden eine einfache "GitFlow"-Strategie, um die Code-Basis stabil und übersichtlich zu halten.

### Branching-Strategie

* **`main`**: Dieser Branch enthält ausschließlich produktiven, stabilen Code. Es werden keine direkten Änderungen an diesem Branch vorgenommen, nur fertige Versionen aus `develop` werden hierher gemerged.
* **`develop`**: Dies ist der Haupt-Entwicklungsbranch. Er enthält die neuesten, fertig entwickelten Features, die auf die nächste Veröffentlichung warten.
* **Feature-Branches**: Jede neue Funktion oder jeder Bugfix wird in einem eigenen Branch entwickelt. Der Name sollte beschreibend sein, z. B. `feature/neuer-export` oder `fix/login-fehler`. Feature-Branches werden immer von `develop` aus erstellt.

### Dein erster Code-Beitrag

1.  **Erstelle einen neuen Branch:** Stelle sicher, dass du auf dem `develop`-Branch bist und dieser aktuell ist. Erstelle dann deinen neuen Feature-Branch:
    ```bash
    git checkout develop
    git pull
    git checkout -b feature/deine-neue-funktion
    ```

2.  **Entwickle lokal:** Nimm deine Änderungen am Code vor und teste sie gründlich.

3.  **Commite deine Änderungen:** Mache regelmäßige, kleine Commits mit aussagekräftigen Nachrichten.
    ```bash
    git add .
    git commit -m "feat: Füge eine neue Export-Funktion hinzu"
    ```

4.  **Pushe deinen Branch:** Lade deinen Feature-Branch auf GitHub hoch.
    ```bash
    git push origin feature/deine-neue-funktion
    ```

5.  **Erstelle einen Pull Request:** Gehe auf die GitHub-Seite deines Projekts. GitHub wird deinen neuen Branch erkennen und dir vorschlagen, einen "Pull Request" zu erstellen. Erstelle einen Pull Request von deinem `feature/...`-Branch in den `develop`-Branch. Gib ihm einen klaren Titel und eine Beschreibung deiner Änderungen.

Nach einem Review wird dein Code in den `develop`-Branch gemerged. Fertig!