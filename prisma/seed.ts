import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ==========================================
// GEMEINSAME BAUGRUPPENTYPEN
// ==========================================
const baugruppentypen: Prisma.BaugruppentypCreateInput[] = [
  { bezeichnung: "Chassis", beschreibung: "Fahrzeugrahmen und Bodengruppe" },
  { bezeichnung: "Karosserie", beschreibung: "Außenhülle und Struktur des Fahrzeugs" },
  { bezeichnung: "Fahrwerk", beschreibung: "Räder, Achsen, Federung und Lenkung" },
  { bezeichnung: "Antrieb", beschreibung: "Motor, Getriebe und Kraftübertragung" },
  { bezeichnung: "Interieur", beschreibung: "Innenausstattung und Sitze" },
  { bezeichnung: "Elektronik", beschreibung: "Elektronische Systeme und Steuergeräte" }
]


// ==========================================
// STUTTGART PORSCHE REASSEMBLY CENTER
// ==========================================

// Porsche Factory
const porscheFactory: Prisma.ReassemblyFactoryCreateInput = {
  name: "Stuttgart Porsche Reassembly Center",
  kapazität: 50
}

// Porsche Prozesse
const porscheProzesse: Prisma.ProzessCreateInput[] = [
  { name: "Demontage" },
  { name: "Reinigung & Entfettung" },
  { name: "Oberflächenbehandlung" },
  { name: "Montage" },
  { name: "Qualitätskontrolle" }
]

// Porsche Baugruppen (mit Baugruppentyp-Zuordnung)
interface BaugruppeWithType {
  bezeichnung: string
  artikelnummer: string
  variantenTyp: 'basic' | 'premium' | 'basicAndPremium'
  prozesszeit?: number | null
  volumen?: number | null
  baugruppentyp: string
}

const porscheBaugruppen: BaugruppeWithType[] = [
  {
    bezeichnung: "Chassis",
    artikelnummer: "CHS-BP-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 180,
    volumen: 2.5,
    baugruppentyp: "Chassis"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "KAR-B1-001",
    variantenTyp: "basic",
    prozesszeit: 120,
    volumen: 3.0,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "KAR-B2-001",
    variantenTyp: "basic",
    prozesszeit: 90,
    volumen: 2.0,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "KAR-P1-001",
    variantenTyp: "premium",
    prozesszeit: 150,
    volumen: 3.5,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "KAR-P2-001",
    variantenTyp: "premium",
    prozesszeit: 100,
    volumen: 2.5,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Fahrwerk",
    artikelnummer: "FAH-BP-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 240,
    volumen: 1.8,
    baugruppentyp: "Fahrwerk"
  },
  {
    bezeichnung: "Antrieb",
    artikelnummer: "ANT-BP-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 360,
    volumen: 1.5,
    baugruppentyp: "Antrieb"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "INT-B0-001",
    variantenTyp: "basic",
    prozesszeit: 180,
    volumen: 2.0,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "INT-P1-001",
    variantenTyp: "premium",
    prozesszeit: 300,
    volumen: 2.2,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Elektronik",
    artikelnummer: "ELE-BP-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 120,
    volumen: 0.5,
    baugruppentyp: "Elektronik"
  }
]

// Porsche Produkt
const porscheProdukt: Prisma.ProduktCreateInput = {
  bezeichnung: "Porsche 911",
  seriennummer: "P911-2024-001"
}

// ==========================================
// INGOLSTADT AUDI REASSEMBLY CENTER
// ==========================================

// Audi Factory
const audiFactory: Prisma.ReassemblyFactoryCreateInput = {
  name: "Ingolstadt Audi Reassembly Center",
  kapazität: 60
}

// Audi Prozesse
const audiProzesse: Prisma.ProzessCreateInput[] = [
  { name: "Zerlegung" },
  { name: "Ultraschallreinigung" },
  { name: "Pulverbeschichtung" },
  { name: "Systemintegration" },
  { name: "Endkontrolle" }
]

// Audi Baugruppen
const audiBaugruppen: BaugruppeWithType[] = [
  {
    bezeichnung: "Chassis",
    artikelnummer: "PLT-BP-002",
    variantenTyp: "basicAndPremium",
    prozesszeit: 200,
    volumen: 2.8,
    baugruppentyp: "Chassis"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "STR-B1-002",
    variantenTyp: "basic",
    prozesszeit: 110,
    volumen: 2.8,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "STR-B2-002",
    variantenTyp: "basic",
    prozesszeit: 95,
    volumen: 2.2,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "STR-P1-002",
    variantenTyp: "premium",
    prozesszeit: 160,
    volumen: 3.2,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "STR-P2-002",
    variantenTyp: "premium",
    prozesszeit: 110,
    volumen: 2.6,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Fahrwerk",
    artikelnummer: "FGS-BP-002",
    variantenTyp: "basicAndPremium",
    prozesszeit: 220,
    volumen: 1.9,
    baugruppentyp: "Fahrwerk"
  },
  {
    bezeichnung: "Antrieb",
    artikelnummer: "MOT-BP-002",
    variantenTyp: "basicAndPremium",
    prozesszeit: 380,
    volumen: 1.6,
    baugruppentyp: "Antrieb"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "INR-B0-002",
    variantenTyp: "basic",
    prozesszeit: 170,
    volumen: 2.1,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "INR-P1-002",
    variantenTyp: "premium",
    prozesszeit: 320,
    volumen: 2.3,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Elektronik",
    artikelnummer: "ELE-BP-002",
    variantenTyp: "basicAndPremium",
    prozesszeit: 130,
    volumen: 0.5,
    baugruppentyp: "Elektronik"
  }
]

// Audi Produkte
const audiProdukte: Prisma.ProduktCreateInput[] = [
  {
    bezeichnung: "Audi A8",
    seriennummer: "A8-2024-001"
  },
  {
    bezeichnung: "Audi RS6 Avant",
    seriennummer: "RS6-2024-001"
  }
]

async function main() {
  // Lösche bestehende Daten
  await prisma.auftrag.deleteMany()
  await prisma.liefertermin.deleteMany()
  await prisma.produktvariante.deleteMany()
  await prisma.baugruppe.deleteMany()
  await prisma.prozess.deleteMany()
  await prisma.produkt.deleteMany()
  await prisma.kunde.deleteMany()
  await prisma.reassemblyFactory.deleteMany()
  await prisma.baugruppentyp.deleteMany()

  // ==========================================
  // ERSTELLE BAUGRUPPENTYPEN
  // ==========================================
  const createdBaugruppentypen = await Promise.all(
    baugruppentypen.map(typ => prisma.baugruppentyp.create({ data: typ }))
  )

  // ==========================================
  // ERSTELLE PORSCHE FACTORY
  // ==========================================
  
  const createdPorscheFactory = await prisma.reassemblyFactory.create({
    data: porscheFactory
  })

  // Erstelle Porsche Prozesse
  const createdPorscheProzesse = await Promise.all(
    porscheProzesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle Porsche Baugruppen mit Prozess-Verknüpfungen und Baugruppentyp
  const createdPorscheBaugruppen = await Promise.all(
    porscheBaugruppen.map(async (baugruppe) => {
      const { baugruppentyp, ...baugruppeData } = baugruppe
      const baugruppenTypObject = createdBaugruppentypen.find(t => t.bezeichnung === baugruppentyp)
      
      return prisma.baugruppe.create({
        data: {
          ...baugruppeData,
          baugruppentyp: baugruppenTypObject ? {
            connect: { id: baugruppenTypObject.id }
          } : undefined,
          prozesse: {
            connect: createdPorscheProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    })
  )

  // Erstelle Porsche Produkt mit Baugruppentypen
  const createdPorscheProdukt = await prisma.produkt.create({
    data: {
      ...porscheProdukt,
      factory: {
        connect: { id: createdPorscheFactory.id }
      },
      baugruppentypen: {
        connect: createdBaugruppentypen
          .filter(typ => ["Chassis", "Karosserie", "Fahrwerk", "Interieur", "Antrieb", "Elektronik"].includes(typ.bezeichnung))
          .map(typ => ({ id: typ.id }))
      }
    }
  })

  // Erstelle Porsche Produktvarianten
  const porscheVarianteBasic = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Carrera Basic",
      typ: "basic",
      produkt: { connect: { id: createdPorscheProdukt.id } },
      baugruppen: {
        connect: createdPorscheBaugruppen
          .filter(bg => bg.variantenTyp === "basic" || bg.variantenTyp === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  const porscheVariantePremium = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Turbo S Premium",
      typ: "premium",
      produkt: { connect: { id: createdPorscheProdukt.id } },
      baugruppen: {
        connect: createdPorscheBaugruppen
          .filter(bg => bg.variantenTyp === "premium" || bg.variantenTyp === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  // ==========================================
  // ERSTELLE AUDI FACTORY
  // ==========================================
  
  const createdAudiFactory = await prisma.reassemblyFactory.create({
    data: audiFactory
  })

  // Erstelle Audi Prozesse
  const createdAudiProzesse = await Promise.all(
    audiProzesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle Audi Baugruppen mit Prozess-Verknüpfungen und Baugruppentyp
  const createdAudiBaugruppen = await Promise.all(
    audiBaugruppen.map(async (baugruppe) => {
      const { baugruppentyp, ...baugruppeData } = baugruppe
      const baugruppenTypObject = createdBaugruppentypen.find(t => t.bezeichnung === baugruppentyp)
      
      return prisma.baugruppe.create({
        data: {
          ...baugruppeData,
          baugruppentyp: baugruppenTypObject ? {
            connect: { id: baugruppenTypObject.id }
          } : undefined,
          prozesse: {
            connect: createdAudiProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    })
  )

  // Erstelle Audi Produkte mit Baugruppentypen
  const createdAudiProdukte = await Promise.all(
    audiProdukte.map(produkt =>
      prisma.produkt.create({
        data: {
          ...produkt,
          factory: {
            connect: { id: createdAudiFactory.id }
          },
          baugruppentypen: {
            connect: createdBaugruppentypen
              .filter(typ => ["Chassis", "Karosserie", "Fahrwerk", "Interieur", "Antrieb", "Elektronik"].includes(typ.bezeichnung))
              .map(typ => ({ id: typ.id }))
          }
        }
      })
    )
  )

  // Erstelle Audi A8 Produktvariante
  const audiA8Variante = await prisma.produktvariante.create({
    data: {
      bezeichnung: "A8 L quattro",
      typ: "premium",
      produkt: { connect: { id: createdAudiProdukte[0].id } },
      baugruppen: {
        connect: createdAudiBaugruppen
          .filter(bg => bg.variantenTyp === "premium" || bg.variantenTyp === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  // Erstelle Audi RS6 Produktvariante
  const audiRS6Variante = await prisma.produktvariante.create({
    data: {
      bezeichnung: "RS6 Avant Performance",
      typ: "premium",
      produkt: { connect: { id: createdAudiProdukte[1].id } },
      baugruppen: {
        connect: createdAudiBaugruppen
          .filter(bg => bg.variantenTyp === "premium" || bg.variantenTyp === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  console.log("✅ Seed-Daten erfolgreich erstellt!")
  console.log("\n🔧 Baugruppentypen:")
  console.log(`  - Erstellt: ${createdBaugruppentypen.map(t => t.bezeichnung).join(", ")}`)
  
  console.log("\n🏭 Stuttgart Porsche Reassembly Center:")
  console.log(`  - Produkt: ${createdPorscheProdukt.bezeichnung}`)
  console.log(`  - Baugruppen: ${createdPorscheBaugruppen.length}`)
  console.log(`  - Prozesse: ${createdPorscheProzesse.length}`)
  console.log(`  - Produktvarianten: 2 (Basic & Premium)`)
  
  console.log("\n🏭 Ingolstadt Audi Reassembly Center:")
  console.log(`  - Produkte: ${createdAudiProdukte.map(p => p.bezeichnung).join(", ")}`)
  console.log(`  - Baugruppen: ${createdAudiBaugruppen.length}`)
  console.log(`  - Prozesse: ${createdAudiProzesse.length}`)
  console.log(`  - Produktvarianten: 2 (A8 L quattro & RS6 Avant Performance)`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })