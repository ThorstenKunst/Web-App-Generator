Grundsätze für den Komponenten-Baukasten
Jede Komponente in diesem System folgt einem klaren Set an Regeln und Prinzipien. Dies stellt sicher, dass alle Bausteine konsistent, wartbar und performant sind.

Grundsätze für ALLE Komponenten
Diese vier Regeln gelten für jede einzelne Komponente, von <app-header> bis <input-field>.

Gekapseltes Shadow DOM
Jede Komponente muss ein eigenes Shadow DOM verwenden (attachShadow({ mode: 'open' })). Dies schützt das interne Styling und die Struktur der Komponente vor Einflüssen von außen und umgekehrt.

Styling nur innerhalb der Komponente
Es wird niemals Inline-Styling (style="...") verwendet. Alle CSS-Regeln gehören in einen <style>-Block innerhalb des Shadow DOM. Es werden klare, einfache Klassennamen verwendet.

Konfiguration über HTML-Attribute
Komponenten werden deklarativ über HTML-Attribute konfiguriert (z.B. <section-box title="Mein Titel">). Innerhalb der Komponente wird mit this.getAttribute('...') auf diese Werte zugegriffen.

Reaktion auf Attribut-Änderungen
Für dynamische Attribute (wie z.B. disabled) wird der attributeChangedCallback verwendet, um die Komponente bei Änderungen automatisch neu zu rendern oder anzupassen.

Zusätzliche Grundsätze für FORMULAR-Komponenten
Formular-Komponenten (wie <input-field>, <toggle-switch>) sind das Herzstück der Dateneingabe und folgen zusätzlichen, strengeren Regeln, damit sie sich wie native HTML-Formularelemente verhalten.

Standardisierte Attribute
Jede Formular-Komponente unterstützt die folgenden Standard-Attribute:

label: Die sichtbare Beschriftung für den Benutzer.

name: Der Name des Feldes, der beim Abschicken von Formularen verwendet wird (entspricht dem name-Attribut eines <input>).

value: Der initiale Wert des Feldes.

disabled: Ein boolesches Attribut, um die Komponente zu deaktivieren.

JavaScript-Properties für den Zustand
Der Zustand einer Komponente muss über JavaScript-Properties zugänglich sein.

component.value: Gibt den aktuellen Wert zurück oder setzt ihn.

component.checked (für Toggles/Checkboxes): Gibt true oder false zurück oder setzt den Zustand.

Synchronisation von Attribut und Zustand
Wenn ein Benutzer mit der Komponente interagiert (z.B. Text eingibt), muss sich nicht nur die .value-Property ändern, sondern auch das value-Attribut auf dem HTML-Element selbst (this.setAttribute('value', ...)) aktualisiert werden. Dies sorgt für einen konsistenten und im DOM sichtbaren Zustand.

change-Event auslösen
Wenn sich der Wert einer Komponente durch Benutzerinteraktion ändert, muss sie ein change-Event auslösen (this.dispatchEvent(new Event('change'))). Nur so kann die übergeordnete Anwendungslogik in app.js auf Änderungen reagieren.

Umgang mit <slot> (Klärung deines "Slot-frei"-Vorschlags)
Deine Idee, Komponenten "slot-frei" zu halten, ist für viele Komponenten genau richtig, aber wir sollten sie etwas präzisieren:

End-Komponenten wie <input-field> oder <form-button> sind in sich geschlossen. Sie brauchen keine externen Inhalte und sind daher slot-frei. Das macht sie robust und einfach.

Container-Komponenten wie <section-box> oder <app-header> sind dazu da, andere Komponenten zu umschließen. Ihre Kernaufgabe ist es, Struktur zu geben. Sie müssen daher Slots verwenden, um diesen Inhalt aufnehmen zu können.

Die Regel lautet also: Verwende Slots gezielt und nur dort, wo sie für die Komposition von Komponenten absolut notwendig sind (primär in Struktur-Komponenten).