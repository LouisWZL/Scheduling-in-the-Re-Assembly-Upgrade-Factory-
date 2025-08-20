# Re-Assembly Upgrade Factory - Simulationsplattform für Kreislaufwirtschaft

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Installation und Setup](#installation-und-setup)
3. [Plattform-Architektur](#plattform-architektur)
4. [Datenmodell](#datenmodell)
5. [Benutzeroberfläche](#benutzeroberfläche)
6. [Hauptfunktionen](#hauptfunktionen)
7. [Simulationssystem](#simulationssystem)
8. [Entwicklung](#entwicklung)

## Überblick

### Was ist die Re-Assembly Upgrade Factory?

Die Re-Assembly Upgrade Factory ist eine **Simulationsplattform für Kreislaufwirtschaft**, die speziell für die Evaluation von Auftragsabwicklungsalgorithmen in Re-Assembly-Fabriken entwickelt wurde. Diese Plattform unterstützt die Dissertation von Manuel Lauer und simuliert den kompletten Prozess der Wiederaufbereitung und Verbesserung von Produkten.

### Kernkonzept

In einer Re-Assembly Upgrade Factory werden gebrauchte Produkte (z.B. Fahrzeuge) entgegengenommen, inspiziert, in ihre Baugruppen zerlegt, aufgearbeitet oder durch bessere Komponenten ersetzt und wieder zusammengebaut. Dies ist ein wichtiger Baustein der Kreislaufwirtschaft, da Produkte nicht entsorgt, sondern wiederverwertet und sogar verbessert werden.

### Projektziele

Das Evaluierungsmodell zielt darauf ab, einen Simulationshintergrund für die Bewertung von Auftragsabwicklungsalgorithmen zu schaffen:

**Phase I**: Produkt-Definition | Prozess-Definition | Fabrik-Definition  
**Phase II**: Innovationsmodul für Auftragsplanungs-Ansätze  
**Phase III**: Innovationsmodul für Beschaffungsplanungs-Ansätze  
**Phase IV**: Performance-Messung

### Kernfragen

Die Plattform beantwortet folgende zentrale Fragen:

- Wie viele Aufträge befinden sich aktuell in welcher Phase der Auftragsabwicklung?
- Wie lang ist die Durchlaufzeit ab der Inspektionsphase?
- Welche Kosten entstehen bei Änderungen im Produktionssystem und in der Beschaffung von Komponenten?

## Installation und Setup

### Voraussetzungen

- **Node.js** Version 18 oder höher (Download: https://nodejs.org)
- **npm** (wird automatisch mit Node.js installiert)
- Ein moderner Webbrowser (Chrome, Firefox, Safari oder Edge)

### Schritt-für-Schritt Installation

1. **Repository herunterladen oder klonen**
   ```bash
   git clone [repository-url]
   cd ce-app
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
   Dieser Befehl installiert alle notwendigen Pakete und Bibliotheken.

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```
   Der Server startet automatisch und führt dabei auch die Datenbank-Initialisierung durch.
   Die Anwendung ist dann unter `http://localhost:3000` erreichbar.

### Alternative Befehle

```bash
# Mit anderen Package Managern
yarn dev      # mit Yarn
pnpm dev      # mit pnpm  
bun dev       # mit Bun

# Produktionsversion
npm run build  # Produktions-Build erstellen
npm run start  # Produktionsserver starten

# Datenbank-Verwaltung
npm run db:seed         # Datenbank mit Beispieldaten füllen
npx prisma studio       # Datenbank-GUI öffnen
npx prisma db push      # Schema-Änderungen anwenden
npx prisma generate     # Prisma Client generieren

# Code-Qualität
npm run lint            # Code-Qualität prüfen
```

## Plattform-Architektur

### Technologie-Stack

- **Frontend-Framework**: [Next.js](https://nextjs.org) 15.3.3 (React-basiert)
- **Programmiersprache**: TypeScript (typsicheres JavaScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI-Komponenten**: [shadcn/ui](https://ui.shadcn.com/) (basierend auf Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Datenbank**: SQLite mit [Prisma](https://www.prisma.io/) ORM
- **Visualisierung**: 
  - JointJS für Prozess- und Strukturdiagramme
  - Recharts für statistische Auswertungen
  - Three.js für 3D-Modelle

### Ordnerstruktur

```
ce-app/
├── app/                      # Next.js App-Router Seiten
│   ├── page.tsx             # Hauptseite mit Simulation
│   ├── factory-configurator/ # Factory-Konfiguration
│   └── actions/             # Server-seitige Funktionen
├── components/              # React-Komponenten
│   ├── ui/                 # shadcn/ui Basis-Komponenten
│   ├── simulation/         # Simulationslogik
│   │   ├── auftragsabwicklung/  # 8 Algorithmen
│   │   ├── terminierung/        # 8 Algorithmen
│   │   └── beschaffung/         # 8 Algorithmen
│   ├── dialogs/           # Dialog-Fenster
│   └── forms/             # Formulare
├── contexts/              # React Context für State-Management
├── lib/                   # Hilfsfunktionen und Utilities
├── prisma/                # Datenbank
│   ├── schema.prisma     # Datenmodell-Definition
│   ├── seed.ts          # Beispieldaten-Generator
│   └── dev.db           # SQLite Datenbankdatei
└── public/               # Statische Dateien
    ├── images/          # Bilder
    └── svg/            # SVG-Grafiken
```

## Datenmodell

Die Plattform verwendet ein relationales Datenmodell, das alle Aspekte einer Re-Assembly Factory abbildet:

### 🏭 ReassemblyFactory (Fabrik)

Die zentrale Einheit der Simulation. Jede Fabrik hat:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID (automatisch generiert) |
| `name` | String | Bezeichnung der Fabrik |
| `kapazität` | Int | Maximale Anzahl gleichzeitiger Produkte in der Halle |
| `schichtmodell` | Enum | EINSCHICHT (8h), ZWEISCHICHT (16h), DREISCHICHT (24h) |
| `anzahlMontagestationen` | Int | Anzahl der Arbeitsplätze (Standard: 10) |
| `targetBatchAverage` | Int | Ziel-Durchschnittszustand der Baugruppen in % (Standard: 65) |
| `pflichtUpgradeSchwelle` | Int | Schwellwert für automatische Pflicht-Upgrades in % (Standard: 30) |
| `beschaffung` | Json | Beschaffungs-Historie und Konfiguration |
| `auftraege` | Auftrag[] | Alle Aufträge dieser Fabrik |
| `produkte` | Produkt[] | Verfügbare Produkte |
| `baugruppentypen` | Baugruppentyp[] | Definierte Baugruppentypen |
| `baugruppen` | Baugruppe[] | Verfügbare Baugruppen |

### 📦 Produkt

Das Basisprodukt, das in der Fabrik bearbeitet wird (z.B. "Volkswagen Polo"):

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `bezeichnung` | String | Name des Produkts (z.B. "Volkswagen Polo") |
| `seriennummer` | String | Eindeutige Seriennummer |
| `factory` | ReassemblyFactory | Zugehörige Fabrik |
| `varianten` | Produktvariante[] | Verfügbare Varianten (Basic, Premium) |
| `baugruppentypen` | Baugruppentyp[] | Welche Arten von Baugruppen dieses Produkt hat |
| `graphData` | Json | Visuelle Produktstruktur als JointJS-Graph |
| `processGraphData` | Json | Prozessablauf als JointJS-Graph |

### 🎯 Produktvariante

Spezifische Ausführungen eines Produkts (z.B. "Polo GTI 2017"):

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `produkt` | Produkt | Basis-Produkt |
| `bezeichnung` | String | Name der Variante (z.B. "Polo GTI 2017") |
| `typ` | VariantenTyp | `basic`, `premium` oder `basicAndPremium` |
| `glbFile` | String? | Pfad zum 3D-Modell (optional) |
| `links` | Json | Verbindungen zwischen Baugruppen |
| `auftraege` | Auftrag[] | Alle Aufträge für diese Variante |

### 🔧 Baugruppentyp

Kategorien von Baugruppen (z.B. "Karosserie", "Fahrwerk", "Motor"):

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `bezeichnung` | String | Name des Typs (z.B. "Karosserie") |
| `factory` | ReassemblyFactory | Zugehörige Fabrik |
| `produkte` | Produkt[] | Produkte mit diesem Baugruppentyp |
| `baugruppen` | Baugruppe[] | Konkrete Baugruppen dieses Typs |

### ⚙️ Baugruppe

Konkrete Bauteile (z.B. "Motor V6", "Getriebe Automatik"):

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `bezeichnung` | String | Name der Baugruppe |
| `artikelnummer` | String | Eindeutige Artikelnummer |
| `variantenTyp` | VariantenTyp | Für welche Varianten verfügbar |
| `verfuegbar` | Int | Lagerbestand |
| `baugruppentyp` | Baugruppentyp | Kategorie der Baugruppe |
| `demontagezeit` | Int? | Zeit zum Ausbauen in Minuten |
| `montagezeit` | Int? | Zeit zum Einbauen in Minuten |
| `prozesse` | Prozess[] | Zugeordnete Bearbeitungsprozesse |

### 📋 Auftrag

Ein Kundenauftrag zur Bearbeitung eines Produkts:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `kunde` | Kunde | Auftraggeber |
| `produktvariante` | Produktvariante | Gewünschte Produktvariante |
| `phase` | AuftragsPhase | Aktuelle Bearbeitungsphase |
| `factory` | ReassemblyFactory | Bearbeitende Fabrik |
| `liefertermine` | Liefertermin[] | Terminhistorie |
| `terminierung` | Json | Terminierungs-Informationen |
| `phaseHistory` | Json | Historie aller Phasenwechsel mit Zeitstempeln |
| `graphData` | Json | Auftragsspezifischer Baugruppen-Graph |
| `processGraphDataBg` | Json | Prozess-Graph (Baugruppen-Ebene) |
| `processGraphDataBgt` | Json | Prozess-Graph (Baugruppentyp-Ebene) |
| `processSequences` | Json | Mögliche Prozessreihenfolgen |
| `baugruppenInstances` | BaugruppeInstance[] | Spezifische Baugruppen für diesen Auftrag |

### 🔄 Auftragsphasen (AuftragsPhase Enum)

Jeder Auftrag durchläuft folgende Phasen:

1. **AUFTRAGSANNAHME**: Auftrag wurde erfasst und wartet auf Bearbeitung
2. **INSPEKTION**: Produkt wird untersucht und Zustand bewertet
3. **REASSEMBLY_START**: Zerlegung und Bearbeitung beginnt
4. **REASSEMBLY_ENDE**: Wiederzusammenbau abgeschlossen
5. **QUALITAETSPRUEFUNG**: Finale Qualitätskontrolle
6. **AUFTRAGSABSCHLUSS**: Auftrag fertiggestellt und bereit zur Auslieferung

### 🔨 BaugruppeInstance

Repräsentiert eine spezifische Baugruppe in einem Auftrag:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `baugruppe` | Baugruppe | Original-Baugruppe |
| `austauschBaugruppe` | Baugruppe? | Ersatz-Baugruppe (bei Austausch) |
| `auftrag` | Auftrag | Zugehöriger Auftrag |
| `zustand` | Int | Qualität von 0-100% (0 = sehr schlecht, 100 = sehr gut) |
| `reAssemblyTyp` | ReAssemblyTyp? | Art der Bearbeitung |

**ReAssemblyTyp Enum**:
- `PFLICHT`: Muss ersetzt werden (Zustand unter Schwellwert)
- `UPGRADE`: Freiwilliges Upgrade auf Kundenwunsch
- `null`: Keine Bearbeitung nötig

### 👤 Kunde

Kundendaten für Aufträge:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `vorname` | String | Vorname |
| `nachname` | String | Nachname |
| `email` | String? | E-Mail-Adresse (optional) |
| `telefon` | String? | Telefonnummer (optional) |
| `adresse` | String? | Anschrift (optional) |
| `auftraege` | Auftrag[] | Alle Aufträge des Kunden |

### 📅 Liefertermin

Terminverwaltung für Aufträge:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `auftrag` | Auftrag | Zugehöriger Auftrag |
| `typ` | String | Art des Termins (z.B. "GROB_ZEITSCHIENE") |
| `datum` | DateTime | Geplanter Liefertermin |
| `istAktuell` | Boolean | Markiert den aktuell gültigen Termin |
| `bemerkung` | String? | Notizen oder Änderungsgründe |

### 🛠️ Prozess

Arbeitsschritte an Baugruppen:

| Attribut | Typ | Beschreibung |
|----------|-----|--------------|
| `id` | String | Eindeutige ID |
| `name` | String | Bezeichnung (z.B. "Montieren", "Einölen", "Schleifen") |
| `baugruppen` | Baugruppe[] | Zugeordnete Baugruppen |

## Benutzeroberfläche

### Hauptansicht (Dashboard)

Die Hauptansicht ist in fünf Hauptbereiche unterteilt:

#### 1. Kopfzeile (Header)

Die Kopfzeile enthält alle Steuerungselemente für die Simulation:

- **Factory-Auswahl**: Dropdown zur Auswahl der aktiven Fabrik
- **Simulationssteuerung**:
  - ▶️ Play/Pause-Button zum Starten/Stoppen der Simulation
  - 🔄 Reset-Button zum Zurücksetzen auf Anfangszustand
  - Geschwindigkeitsregler (0.5x bis 2x Geschwindigkeit)
  - Digitale Uhr mit aktueller Simulationszeit
  - Status-Indikator:
    - 🟢 Grün (pulsierend): Simulation läuft
    - 🟠 Orange: Simulation pausiert
    - 🔴 Rot: Simulation gestoppt/zurückgesetzt
- **Algorithmus-Auswahl**: Drei Dropdown-Menüs für:
  - Auftragsabwicklung (8 Varianten)
  - Terminierung (8 Varianten)
  - Beschaffung (8 Varianten)
- **Auto-Aufträge**: 
  - Checkbox zum Aktivieren
  - Einstellungen-Icon für Konfiguration:
    - Minimum-Schwelle (Standard: 30 Aufträge)
    - Batch-Größe (Standard: 20 neue Aufträge)

#### 2. Linke Seitenleiste

Enthält die Auftragsübersicht und Steuerung:

- **Auftragsgenerierung** (oben):
  - ➖ Button: Anzahl verringern
  - Anzeige der aktuellen Anzahl
  - ➕ Button: Anzahl erhöhen
  - "Aufträge erstellen" Button
- **Auftragsübersicht**: Akkordeon-Listen gruppiert nach Phasen
  - Jede Phase zeigt Anzahl der Aufträge
  - Klickbare Einträge mit:
    - Kundenname
    - Produktvariante
    - Badge für Variantentyp (Basic/Premium)
  - Beim Klick wird Auftrag zur Detailansicht geladen
- **Factory-Einstellungen** (unten):
  - Baugruppenzustand-Konfiguration:
    - Durchschnittlicher Zustand (Slider)
    - Pflicht-Upgrade Schwelle (Slider)
    - Speichern-Button

#### 3. Hauptbereich

Zeigt Details zum ausgewählten Auftrag:

- **Auftragsdetails-Karte**: 
  - Titel: "Auftrag [ID]" mit Phase-Badge
  - Zweispaltiges Layout mit:
    - Kunde (Name mit Icon)
    - Produktvariante (mit Typ-Badge)
    - Aktuelle Phase
    - Liefertermin
    - Auftrag eingegangen am
- **Baugruppen-Graph**: 
  - Visuelle Darstellung der Produktstruktur
  - Farbcodierung nach Zustand:
    - 🟢 Grün: Guter Zustand (>70%)
    - 🟡 Gelb: Mittlerer Zustand (30-70%)
    - 🔴 Rot: Schlechter Zustand (<30%)
  - Zoom-Kontrollen (+/- Buttons)
- **Prozess-Graph**: 
  - Ablaufdiagramm der Bearbeitungsschritte
  - Zwei Ansichten:
    - Baugruppen-Ebene (spezifische Baugruppen)
    - Baugruppentyp-Ebene (Kategorien)
  - Tab-Umschaltung zwischen Ansichten

#### 4. Rechte Seitenleiste

Detaillierte Baugruppen-Informationen:

- **Baugruppen-Tabelle**:
  - Kopfzeile mit Auftragsnummer
  - Für jede Baugruppe:
    - Name und Artikelnummer
    - Zustand in % mit Fortschrittsbalken
    - Farbcodierung wie im Graph
    - Re-Assembly-Typ:
      - 🔴 PFLICHT (bei Zustand < Schwelle)
      - 🔵 UPGRADE (Kundenwunsch)
      - Grau: Keine Bearbeitung
    - Austausch-Baugruppe (falls vorhanden)

#### 5. Phasen-Timeline (Unten)

150px hoher Bereich mit Echtzeit-Visualisierung:

- **Überschrift**: "Auftragsphasen-Timeline" mit Status-Indikator
- **Phasen-Boxen**: 
  - 6 Boxen für jede Phase
  - Name der Phase innerhalb der Box
  - Anzahl der Aufträge oberhalb
  - Verbindungslinien zwischen Phasen
- **Animationen**:
  - Kleine dunkelblaue Kreise (Tokens) wandern zwischen Phasen
  - Bewegung alle 2 Simulationsstunden
  - Zeigt Auftragsfluss in Echtzeit

### Factory-Konfigurator

Separater Bereich (`/factory-configurator/[id]`) zur Einrichtung:

#### Navigation
- **Breadcrumb**: Home > Factory-Konfigurator > [Factory-Name]
- **Tabs**: Produkt | Baugruppen | Prozesse

#### Produkt-Tab
- **Produkt erstellen**: 
  - Name und Seriennummer
  - Baugruppentypen auswählen
- **Varianten definieren**:
  - Basic-Variante
  - Premium-Variante
  - 3D-Modell Upload
- **Struktur-Editor**:
  - JointJS Graph-Editor
  - Drag & Drop für Baugruppen
  - Verbindungen zeichnen

#### Baugruppen-Tab
- **Baugruppentypen verwalten**:
  - Neue Typen anlegen
  - Bestehende bearbeiten
- **Baugruppen definieren**:
  - Name und Artikelnummer
  - Variantenzuordnung
  - Montage-/Demontagezeiten
  - Verfügbarkeit (Lagerbestand)

#### Prozesse-Tab
- **Prozess-Graph erstellen**:
  - Sequenzielle Abläufe
  - Parallele Prozesse
  - Zeitschätzungen

## Hauptfunktionen

### 1. Auftragsverwaltung

#### Auftragserstellung

**Manuelle Erstellung**:
- Einzelne Aufträge über "Aufträge erstellen" Button
- Anzahl mit +/- Buttons einstellen
- Batch-Erstellung mehrerer Aufträge gleichzeitig

**Automatische Generierung**:
- Aktivierung über "Auto-Aufträge" Checkbox
- Konfigurierbare Parameter:
  - Minimum-Schwelle: Unter dieser Anzahl werden neue erstellt
  - Batch-Größe: Wie viele auf einmal generiert werden
- Prüfung alle 2 Simulationsstunden

#### Auftragseigenschaften

Bei der Erstellung erhält jeder Auftrag:
- **Zufälliger Kunde** aus vordefiniertem Pool
- **Zufällige Produktvariante** (Basic oder Premium)
- **Baugruppen mit Zustandsbewertung**:
  - Durchschnitt entspricht Zielwert (z.B. 65%)
  - Einzelwerte zwischen 0-100%
- **Automatische Upgrade-Entscheidungen**:
  - PFLICHT wenn Zustand < Schwelle (z.B. 30%)
  - 0-2 zufällige UPGRADE-Baugruppen
  - Mindestens 1 Bearbeitung pro Auftrag

### 2. Simulationssteuerung

#### Zeitsteuerung
- **Start/Pause**: Simulation läuft in Echtzeit (beschleunigt)
- **Geschwindigkeit**: 0.5x bis 2x einstellbar
- **Reset**: Zurücksetzen auf Anfangszustand
  - Löscht alle Aufträge
  - Setzt Zeit zurück
  - Warnt vor Datenverlust

#### Phasenübergänge

Automatische Bewegung basierend auf:
- **Kapazitätsgrenzen**: Max. Anzahl in Re-Assembly
- **Zeitvorgaben**: 
  - Inspektion: 2-4 Stunden
  - Re-Assembly: Basierend auf Baugruppen
  - Qualitätsprüfung: 1-2 Stunden
- **Algorithmus-Auswahl**: Bestimmt Reihenfolge

### 3. Visualisierung

#### Graph-Darstellungen

**Produktstruktur-Graph**:
- Hierarchische Anordnung
- Baugruppen als Rechtecke
- Verbindungslinien zeigen Abhängigkeiten
- Farbcodierung nach Zustand
- Zoom und Pan möglich

**Prozess-Graph**:
- Zeitlicher Ablauf
- Start- und Endknoten
- Prozess-Schritte als Rechtecke
- Parallele und sequenzielle Pfade

#### Echtzeit-Updates

- Phasen-Timeline aktualisiert sich kontinuierlich
- Auftragsanzahlen werden live angepasst
- Animationen zeigen Bewegungen
- Status-Indikatoren für Systemzustand

### 4. Konfiguration

#### Factory-Einstellungen

**Kapazität und Ressourcen**:
- Maximale gleichzeitige Aufträge
- Anzahl Montagestationen
- Schichtmodell (1-3 Schichten)

**Qualitätsparameter**:
- Ziel-Durchschnittszustand (%)
- Pflicht-Upgrade Schwelle (%)
- Beide mit Slidern einstellbar
- Gemeinsames Speichern

#### Algorithmus-Konfiguration

**Drei Kategorien mit je 8 Varianten**:
1. Auftragsabwicklung
2. Terminierung  
3. Beschaffung

Auswahl beeinflusst:
- Reihenfolge der Bearbeitung
- Priorisierung
- Ressourcenverteilung

## Simulationssystem

### Simulationslogik

#### Phasenübergänge im Detail

1. **AUFTRAGSANNAHME → INSPEKTION**
   - Bedingung: Kapazität verfügbar
   - Dauer: Sofort bei freier Kapazität
   - Aktion: Kunde wird informiert

2. **INSPEKTION → REASSEMBLY_START**
   - Bedingung: Inspektion abgeschlossen
   - Dauer: 2-4 Stunden Inspektionszeit
   - Aktion: Zustandsbewertung, Upgrade-Entscheidung

3. **REASSEMBLY_START → REASSEMBLY_ENDE**
   - Bedingung: Alle Baugruppen bearbeitet
   - Dauer: Summe der Montage-/Demontagezeiten
   - Aktion: Austausch/Reparatur der Baugruppen

4. **REASSEMBLY_ENDE → QUALITAETSPRUEFUNG**
   - Bedingung: Zusammenbau abgeschlossen
   - Dauer: Sofort nach Fertigstellung
   - Aktion: Funktionsprüfung

5. **QUALITAETSPRUEFUNG → AUFTRAGSABSCHLUSS**
   - Bedingung: Prüfung bestanden
   - Dauer: 1-2 Stunden Prüfzeit
   - Aktion: Freigabe zur Auslieferung

#### Zeitberechnung

**Faktoren**:
- Grundzeiten aus Datenbank
- Schichtmodell (8/16/24h)
- Parallelisierung möglich
- Rüstzeiten zwischen Aufträgen
- Pufferzeiten für Unvorhergesehenes

**Optimierungen**:
- Batch-Bearbeitung ähnlicher Produkte
- Parallele Bearbeitung unabhängiger Baugruppen
- Priorisierung kritischer Pfade

### Performance-Messung

#### Kennzahlen (KPIs)

**Durchlaufzeit**:
- Gesamt: Auftragsannahme bis Abschluss
- Ab Inspektion: Kernprozesszeit
- Pro Phase: Detailanalyse

**Auslastung**:
- Kapazitätsauslastung (%)
- Stationsauslastung (%)
- Mitarbeiterauslastung (%)

**Qualität**:
- Durchschnittlicher Endzustand
- Anzahl Nacharbeiten
- Kundenzufriedenheit

**Kosten**:
- Materialkosten
- Arbeitskosten
- Opportunitätskosten

## Beziehungen und Relationen

### Hierarchie der Baugruppen-Struktur

Die Plattform verwendet eine dreistufige Hierarchie für die Verwaltung von Baugruppen:

```
Baugruppentyp (Kategorie)
    ↓
Baugruppe (Definition)
    ↓
BaugruppeInstance (Konkrete Verwendung)
```

#### 1. Baugruppentyp → Baugruppe
- **1:n Beziehung**: Ein Baugruppentyp kann mehrere Baugruppen enthalten
- **Beispiel**: 
  - Baugruppentyp "Motor" enthält:
    - Baugruppe "Motor V6 Basic" (für Basic-Variante)
    - Baugruppe "Motor V8 Premium" (für Premium-Variante)
    - Baugruppe "Motor Hybrid" (für beide Varianten)

#### 2. Baugruppe → BaugruppeInstance
- **1:n Beziehung**: Eine Baugruppe kann in mehreren Aufträgen verwendet werden
- **Zweck**: Jeder Auftrag erhält eigene Instanzen mit individuellem Zustand
- **Beispiel**:
  - Baugruppe "Motor V6" (Definition mit Montagezeit 45min)
  - BaugruppeInstance 1: Auftrag A, Zustand 65%
  - BaugruppeInstance 2: Auftrag B, Zustand 23% (→ Pflicht-Upgrade)

#### 3. Auftrag → BaugruppeInstance
- **1:n Beziehung**: Ein Auftrag hat mehrere BaugruppeInstances
- **Besonderheit**: Jede Instance kann eine Austausch-Baugruppe haben
- **Ablauf**:
  1. Auftrag wird erstellt
  2. System wählt passende Baugruppen basierend auf Produktvariante
  3. Für jede Baugruppe wird eine Instance mit zufälligem Zustand erstellt
  4. Bei schlechtem Zustand wird Austausch-Baugruppe zugewiesen

### Produkt-Struktur und Beziehungen

#### Produkt → Produktvariante → Auftrag
```
Produkt (z.B. "VW Polo")
    ↓
Produktvariante (z.B. "Polo GTI 2017 Premium")
    ↓
Auftrag (konkreter Kundenauftrag)
```

- **Produkt** definiert die Grundstruktur und Baugruppentypen
- **Produktvariante** spezifiziert Basic/Premium und hat eigene Verbindungen
- **Auftrag** referenziert eine Variante und erhält passende Baugruppen

### Graph-Transformationen

#### 1. Produktstruktur-Graph (graphData)
Der ursprüngliche Graph wird im Produkt gespeichert und zeigt:
- Alle möglichen Baugruppen
- Hierarchische Struktur
- Verbindungen zwischen Komponenten

#### 2. Auftrags-Graph Transformation
Bei Auftragserstellung wird der Produkt-Graph transformiert:

```typescript
// Transformation-Prozess
1. Produkt-Graph laden
2. Varianten-Filter anwenden (Basic/Premium)
3. Für jede Baugruppe:
   - Zufälligen Zustand generieren (0-100%)
   - Farbcodierung basierend auf Zustand
   - Re-Assembly-Typ bestimmen
4. Neuen Graph mit auftragsspezifischen Daten speichern
```

#### 3. Prozess-Graph Generierung
Aus dem Produkt-Graph werden zwei Prozess-Graphen erstellt:

**Baugruppen-Ebene (processGraphDataBg)**:
- Zeigt konkrete Baugruppen des Auftrags
- Färbung nach Zustand
- Markierung von Austausch-Baugruppen

**Baugruppentyp-Ebene (processGraphDataBgt)**:
- Zeigt Kategorien statt einzelne Baugruppen
- Aggregierte Darstellung
- Bessere Übersicht bei vielen Baugruppen

### Prozess-Sequenzen Berechnung

#### Algorithmus zur Sequenz-Generierung

Die Plattform berechnet alle möglichen Bearbeitungsreihenfolgen:

```javascript
// Vereinfachtes Beispiel
processSequences = {
  baugruppen: [
    {
      sequence: ["Motor ausbauen", "Motor prüfen", "Motor einbauen"],
      duration: 120, // Minuten
      parallel: false
    },
    {
      sequence: ["Karosserie reinigen", "Lackieren"],
      duration: 180,
      parallel: true // Kann parallel zu Motor laufen
    }
  ],
  baugruppentypen: [
    // Aggregierte Sequenzen auf Typ-Ebene
  ]
}
```

#### Speicherung der Sequenzen

Die berechneten Sequenzen werden als JSON im Auftrag gespeichert:

| Feld | Inhalt |
|------|--------|
| `processSequences.baugruppen` | Detaillierte Sequenzen pro Baugruppe |
| `processSequences.baugruppentypen` | Aggregierte Sequenzen pro Typ |
| `processSequences.optimal` | Kürzeste mögliche Gesamtdauer |
| `processSequences.critical` | Kritischer Pfad ohne Puffer |

#### Verwendung der Sequenzen

Die Simulation nutzt diese Sequenzen für:
- **Zeitberechnung**: Wie lange dauert die Bearbeitung?
- **Parallelisierung**: Welche Schritte können gleichzeitig laufen?
- **Optimierung**: Welche Reihenfolge ist am effizientesten?
- **Visualisierung**: Anzeige im Prozess-Graph

## Eigene Algorithmen implementieren

### Algorithmus-System Übersicht

Die Plattform bietet ein flexibles System zur Implementierung eigener Algorithmen. Jede der drei Kategorien (Auftragsabwicklung, Terminierung, Beschaffung) hat 8 Platzhalter für Algorithmen:

- **Algorithmus 1**: Demo-Algorithmus (Beispiel-Implementierung)
- **Algorithmus 2-8**: Platzhalter für eigene Implementierungen

### Struktur eines Algorithmus

#### Dateispeicherort
```
components/simulation/
├── auftragsabwicklung/
│   ├── auftragsabwicklung-1.tsx  # Demo-Algorithmus
│   ├── auftragsabwicklung-2.tsx  # Ihr Algorithmus
│   └── ...
├── terminierung/
│   ├── terminierung-1.tsx
│   └── ...
└── beschaffung/
    ├── beschaffung-1.tsx
    └── ...
```

#### Algorithmus-Template

```typescript
// Beispiel: auftragsabwicklung-2.tsx
export const auftragsabwicklungAlgorithmus2 = {
  name: "Mein FIFO-Algorithmus", // Änderbarer Name
  description: "First-In-First-Out mit Prioritäten",
  
  execute: async (orders: Order[], factory: Factory) => {
    // Ihre Implementierung hier
    // 1. Aufträge analysieren
    // 2. Sortierung/Priorisierung
    // 3. Phasenübergänge berechnen
    // 4. Rückgabe der aktualisierten Aufträge
    
    return updatedOrders;
  },
  
  // Optionale Konfiguration
  config: {
    requiresCapacityCheck: true,
    supportsBatching: false,
    estimatedRuntime: "O(n log n)"
  }
}
```

### Algorithmus registrieren

Nach der Implementierung muss der Algorithmus in der Registry registriert werden:

```typescript
// components/simulation/registry.ts
export const auftragsabwicklungAlgorithmen = [
  auftragsabwicklungAlgorithmus1, // Demo
  auftragsabwicklungAlgorithmus2, // Ihr neuer Algorithmus
  // ... weitere
]
```

### Zweck der verschiedenen Algorithmus-Typen

#### Auftragsabwicklung
**Zweck**: Bestimmt die Reihenfolge der Auftragsbearbeitung
- Welcher Auftrag kommt als nächstes in die Inspektion?
- Welche Aufträge werden parallel bearbeitet?
- Wie werden Prioritäten vergeben?

**Beispiel-Implementierungen**:
- FIFO (First-In-First-Out)
- LIFO (Last-In-First-Out)
- Prioritätsbasiert (VIP-Kunden zuerst)
- Shortest-Job-First
- Round-Robin

#### Terminierung
**Zweck**: Plant zeitliche Abläufe und Liefertermine
- Wann wird welcher Auftrag fertig?
- Wie werden Verzögerungen behandelt?
- Optimierung der Durchlaufzeiten

**Beispiel-Implementierungen**:
- Früheste Fertigstellung (EDD)
- Just-in-Time
- Kritischer Pfad Methode
- Rückwärtsterminierung

#### Beschaffung
**Zweck**: Steuert Materialbeschaffung und Lagerhaltung
- Wann werden Ersatzteile bestellt?
- Wie viel Sicherheitsbestand?
- Lieferantenauswahl

**Beispiel-Implementierungen**:
- Economic Order Quantity (EOQ)
- Just-in-Time Beschaffung
- ABC-Analyse
- Kanban-System

### Best Practices für eigene Algorithmen

1. **Namensgebung**: Verwenden Sie aussagekräftige Namen
   ```typescript
   name: "FIFO mit Kapazitätsbegrenzung v2.1"
   ```

2. **Dokumentation**: Kommentieren Sie Ihre Logik
   ```typescript
   // Sortiere Aufträge nach Eingangsdatum
   // Berücksichtige dabei VIP-Status
   ```

3. **Performance**: Beachten Sie die Laufzeit
   - Simulation läuft alle 2 Stunden
   - Algorithmus sollte < 100ms benötigen

4. **Fehlerbehandlung**: Robuste Implementierung
   ```typescript
   try {
     // Algorithmus-Logik
   } catch (error) {
     console.error('Algorithmus-Fehler:', error)
     return orders; // Fallback: unveränderte Liste
   }
   ```

5. **Testing**: Testen Sie mit verschiedenen Szenarien
   - Wenige Aufträge (< 10)
   - Viele Aufträge (> 100)
   - Verschiedene Phasenverteilungen

### Demo-Algorithmus als Vorlage

Der Algorithmus 1 in jeder Kategorie ist vollständig implementiert und dient als:
- **Referenz-Implementierung**: Zeigt die erwartete Struktur
- **Fallback**: Funktioniert immer als Basis
- **Vorlage**: Kann kopiert und angepasst werden

```typescript
// Kopieren Sie auftragsabwicklung-1.tsx
// Benennen Sie um zu auftragsabwicklung-2.tsx
// Passen Sie name und execute-Funktion an
```

### Debugging und Monitoring

Für die Entwicklung eigener Algorithmen stehen Tools zur Verfügung:

```typescript
// In Ihrem Algorithmus
console.log('Algorithmus Start:', orders.length, 'Aufträge')
console.time('Algorithmus-Laufzeit')

// Ihre Logik hier

console.timeEnd('Algorithmus-Laufzeit')
console.log('Algorithmus Ende:', updatedOrders.length, 'aktualisiert')
```

Die Konsolen-Ausgaben erscheinen in den Browser-Entwicklertools (F12).

## Entwicklung

### UI-Komponenten mit shadcn/ui

Die Plattform nutzt shadcn/ui für konsistentes Design:

```bash
# Neue Komponente hinzufügen
npx shadcn@latest add [component-name]

# Beispiele
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Verfügbare Komponenten**:
- Buttons, Cards, Dialogs
- Tables, Tabs, Forms
- Accordions, Alerts
- Und viele mehr...

**Komponenten-Struktur**:
- `components/ui/`: shadcn/ui Komponenten
- `components/`: Eigene Komponenten
- `components/forms/`: Formulare
- `components/dialogs/`: Dialog-Fenster

### Styling mit Tailwind CSS

Utility-First CSS Framework für schnelles Styling:

```jsx
// Beispiel
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  <Button className="bg-blue-500 hover:bg-blue-600">
    Klick mich
  </Button>
</div>
```

**Vorteile**:
- Keine CSS-Dateien nötig
- Konsistente Abstände und Größen
- Responsive mit `sm:`, `md:`, `lg:` Präfixen
- Dark Mode mit `dark:` Präfix

### Backend mit Prisma

#### Datenbank-Befehle

```bash
# Schema zu Datenbank pushen
npx prisma db push

# Prisma Studio öffnen (Datenbank-GUI)
npx prisma studio

# Prisma Client generieren
npx prisma generate

# Datenbank mit Seed-Daten füllen
npm run db:seed
```

#### Seed-Daten

Das Projekt enthält vordefinierte Beispieldaten (`prisma/seed.ts`):

**Fabrik**: Stuttgart Porsche Reassembly Center
- Kapazität: 50 Aufträge
- 10 Montagestationen
- Zweischicht-Betrieb

**Produkt**: Porsche 911
- 2 Varianten (Basic, Premium)
- 9 Baugruppentypen
- Vollständige Struktur

**Baugruppen**: 
- Chassis, Karosserie
- Motor, Getriebe
- Fahrwerk, Bremssystem
- Interieur, Elektronik
- Exterieur

**Prozesse**:
- Demontage
- Reinigung
- Oberflächenbehandlung
- Montage
- Qualitätskontrolle

### Code-Struktur

#### Server Actions (`app/actions/`)
```typescript
// Beispiel: auftrag.actions.ts
export async function generateOrders(factoryId: string, count: number) {
  // Validierung
  // Datenbank-Operation
  // Revalidierung
  return { success: true, data: orders }
}
```

#### Komponenten (`components/`)
```typescript
// Beispiel: OrderDetailsCard.tsx
interface OrderDetailsCardProps {
  order: Order | null
}

export function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  // Render-Logik
  return <Card>...</Card>
}
```

#### Kontexte (`contexts/`)
```typescript
// Beispiel: order-context.tsx
const OrderContext = createContext<OrderContextType>({})

export function OrderProvider({ children }) {
  // State-Management
  return <OrderContext.Provider>...</OrderContext.Provider>
}

export const useOrder = () => useContext(OrderContext)
```

### Best Practices

1. **TypeScript**: Immer Typen definieren
2. **Server Components**: Für statische Inhalte
3. **Client Components**: Nur bei Interaktivität
4. **Error Handling**: Try-Catch in Actions
5. **Optimistic Updates**: Sofortiges UI-Feedback
6. **Accessibility**: ARIA-Labels verwenden

### Testing & Debugging

#### Browser-Tools
- React DevTools für Komponenten-Inspektion
- Network-Tab für API-Calls
- Console für Fehler-Logs

#### Prisma Studio
```bash
npx prisma studio
```
Öffnet Datenbank-GUI zum:
- Daten anschauen
- Einträge bearbeiten
- Relationen prüfen

### Deployment

#### Produktion Build
```bash
# Build erstellen
npm run build

# Build lokal testen  
npm run start
```

#### Umgebungsvariablen
`.env` Datei erstellen:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

### Fehlerbehebung

**"Module not found"**:
```bash
npm install
```

**Datenbank-Fehler**:
```bash
npm run db:seed
```

**Port belegt**:
```bash
# Anderen Port verwenden
PORT=3001 npm run dev
```

## Ressourcen und Hilfe

### Dokumentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Video-Tutorials
- [shadcn/ui Setup](https://www.youtube.com/watch?v=ABbww4CFQSo&t=642s)
- [Prisma Tutorial](https://www.youtube.com/watch?v=QXxy8Uv1LnQ&t=934s)

### Support
Bei Fragen oder Problemen:
- Issue im Repository erstellen
- Entwicklungsteam kontaktieren
- Dokumentation konsultieren

---

**Version**: 1.0.0  
**Letztes Update**: August 2025  