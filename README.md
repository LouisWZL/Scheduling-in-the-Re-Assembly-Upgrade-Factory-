# Evaluation Model | Re-Assembly Upgrade Factory | Order Processing

## Goal of the evaluation model

The goal is to build a simulation background for evaluating order processing algorithms to be developed in the dissertation of Manuel Lauer.

**Phase I**: Product Definition | Process Definition | Factory Definition

**Phase II**: Innnovation Module Order Scheduling Approaches

**Phase III**: Innnovation Module Procurement Planning Approaches

**Phase IV**: Performance Measurement

The target functionality of the platform is to provide a comprehensive overview of the order processing within a Re-Assembly Upgrade Factory. This overview serves as a basis for comparing solution approaches for order scheduling and procurement planning with conventional methods.

Key questions addressed include:

- How many orders are currently in each phase of the order processing workflow?
- What is the lead time starting from the inspection phase?
- What are the costs associated with changes in the production system and in the procurement of components?




## Development 

### Erste Schritte
Dies ist ein [Next.js](https://nextjs.org) Projekt, das mit [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) erstellt wurde.

Starte zuerst den Entwicklungsserver (führt automatisch auch die Datenbank-Initialisierung aus):

```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
# oder
bun dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser, um das Ergebnis zu sehen.

Du kannst mit der Bearbeitung der Seite beginnen, indem du `app/page.tsx` änderst. Die Seite aktualisiert sich automatisch, während du die Datei bearbeitest.

Dieses Projekt verwendet [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts), um [Geist](https://vercel.com/font), eine neue Schriftfamilie für Vercel, automatisch zu optimieren und zu laden.

### UI-Komponenten mit shadcn/ui

Dieses Projekt nutzt [shadcn/ui](https://ui.shadcn.com/) für UI-Komponenten. shadcn/ui ist eine Sammlung von wiederverwendbaren Komponenten, die mit Radix UI und Tailwind CSS erstellt wurden.

Videoanleitung:

https://www.youtube.com/watch?v=ABbww4CFQSo&t=642s

#### Installation von shadcn/ui Komponenten

Um neue Komponenten zu installieren, verwende den folgenden Befehl:

```bash
npx shadcn@latest add [komponenten-name]
```

Beispiel:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

#### Komponenten-Struktur

- **`components/`**: Hier befinden sich alle projektspezifischen Komponenten, die du selbst erstellst
- **`components/ui/`**: Hier werden alle shadcn/ui Komponenten automatisch installiert

Die shadcn/ui Komponenten sind bereits sehr gut designt und müssen selten nachjustiert werden. Sie folgen einem konsistenten Design-System und sind vollständig anpassbar.

### Styling mit Tailwind CSS

Wir verwenden [Tailwind CSS](https://tailwindcss.com/) für das Styling. Tailwind ermöglicht es uns, schnell und konsistent zu designen mit Utility-Klassen wie:

```jsx
className="h-7 w-7 hover:bg-muted rounded-md transition-colors"
```

Die Vorteile:
- Schnelles Prototyping direkt im JSX
- Konsistente Abstände und Größen
- Eingebaute Hover- und Fokus-Zustände
- Responsive Design mit Präfixen wie `md:`, `lg:`, etc.

### Backend mit Prisma

Für das Backend verwenden wir [Prisma](https://www.prisma.io/) als ORM (Object-Relational Mapping) Tool. Prisma bietet:

- Type-safe Datenbankzugriff
- Automatische Migrationen
- Intuitive Datenmodellierung

Videoanleitung:

https://www.youtube.com/watch?v=QXxy8Uv1LnQ&t=934s

#### Prisma Befehle

```bash
# Datenbank-Schema pushen
npx prisma db push

# Prisma Studio öffnen (Datenbank-GUI)
npx prisma studio

# Prisma Client generieren
npx prisma generate

# Datenbank mit Seed-Daten befüllen
npm run db:seed
```

#### Seed-Daten (seed.ts)

Das Projekt enthält ein Seed-Skript (`prisma/seed.ts`), das automatisch Beispieldaten in die Datenbank einfügt:

- **Reassembly Factory**: Stuttgart Porsche Reassembly Center
- **Produkt**: Porsche 911 mit zwei Varianten (Basic und Premium)
- **Baugruppen**: 9 verschiedene Baugruppen (Chassis, Karosserie, Fahrwerk, etc.)
- **Prozesse**: 5 Montageprozesse (Demontage, Reinigung, Oberflächenbehandlung, etc.)

Das Seed-Skript wird automatisch beim Start des Entwicklungsservers ausgeführt (`npm run dev`).

### Icons und Assets

#### Icons
Wir verwenden [Lucide React](https://lucide.dev/) für Icons. Diese sind bereits im Projekt integriert und können so verwendet werden:

```jsx
import { Home, Settings, User } from 'lucide-react'

<Home className="h-5 w-5" />
```

#### SVG-Dateien und Bilder
- **SVG-Dateien**: Werden im `public/svg/` Verzeichnis gespeichert
- **Bilder**: Werden im `public/images/` Verzeichnis gespeichert
- **Icons als Komponenten**: Können auch in `components/icons/` als React-Komponenten gespeichert werden

### Ressourcen / Hilfe

Um mehr über Next.js zu erfahren, schau dir die folgenden Ressourcen an:

- [Next.js Dokumentation](https://nextjs.org/docs) - lerne über Next.js Funktionen und API.
- [Next.js lernen](https://nextjs.org/learn) - ein interaktives Next.js Tutorial.

Du kannst dir auch das [Next.js GitHub Repository](https://github.com/vercel/next.js) ansehen - dein Feedback und deine Beiträge sind willkommen!