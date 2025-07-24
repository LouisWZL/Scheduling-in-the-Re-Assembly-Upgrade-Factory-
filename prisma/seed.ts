import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

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

// Porsche Baugruppen
const porscheBaugruppen: Prisma.BaugruppeCreateInput[] = [
  {
    bezeichnung: "Chassis-BP",
    artikelnummer: "CHS-BP-001",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 180,
    volumen: 2.5,
  },
  {
    bezeichnung: "Karosserie-B1",
    artikelnummer: "KAR-B1-001",
    baugruppenart: "basic",
    durchlaufzeit: 120,
    volumen: 3.0,
  },
  {
    bezeichnung: "Karosserie-B2",
    artikelnummer: "KAR-B2-001",
    baugruppenart: "basic",
    durchlaufzeit: 90,
    volumen: 2.0,
  },
  {
    bezeichnung: "Karosserie-P1",
    artikelnummer: "KAR-P1-001",
    baugruppenart: "premium",
    durchlaufzeit: 150,
    volumen: 3.5,
  },
  {
    bezeichnung: "Karosserie-P2",
    artikelnummer: "KAR-P2-001",
    baugruppenart: "premium",
    durchlaufzeit: 100,
    volumen: 2.5,
  },
  {
    bezeichnung: "Fahrwerk-BP",
    artikelnummer: "FAH-BP-001",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 240,
    volumen: 1.8,
  },
  {
    bezeichnung: "Antrieb-BP",
    artikelnummer: "ANT-BP-001",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 360,
    volumen: 1.5,
  },
  {
    bezeichnung: "Interior-B0",
    artikelnummer: "INT-B0-001",
    baugruppenart: "basic",
    durchlaufzeit: 180,
    volumen: 2.0,
  },
  {
    bezeichnung: "Interior-P1",
    artikelnummer: "INT-P1-001",
    baugruppenart: "premium",
    durchlaufzeit: 300,
    volumen: 2.2,
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
const audiBaugruppen: Prisma.BaugruppeCreateInput[] = [
  {
    bezeichnung: "Plattform-BP",
    artikelnummer: "PLT-BP-002",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 200,
    volumen: 2.8,
  },
  {
    bezeichnung: "Struktur-B1",
    artikelnummer: "STR-B1-002",
    baugruppenart: "basic",
    durchlaufzeit: 110,
    volumen: 2.8,
  },
  {
    bezeichnung: "Struktur-B2",
    artikelnummer: "STR-B2-002",
    baugruppenart: "basic",
    durchlaufzeit: 95,
    volumen: 2.2,
  },
  {
    bezeichnung: "Struktur-P1",
    artikelnummer: "STR-P1-002",
    baugruppenart: "premium",
    durchlaufzeit: 160,
    volumen: 3.2,
  },
  {
    bezeichnung: "Struktur-P2",
    artikelnummer: "STR-P2-002",
    baugruppenart: "premium",
    durchlaufzeit: 110,
    volumen: 2.6,
  },
  {
    bezeichnung: "Fahrgestell-BP",
    artikelnummer: "FGS-BP-002",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 220,
    volumen: 1.9,
  },
  {
    bezeichnung: "Motor-BP",
    artikelnummer: "MOT-BP-002",
    baugruppenart: "basicAndPremium",
    durchlaufzeit: 380,
    volumen: 1.6,
  },
  {
    bezeichnung: "Innenraum-B0",
    artikelnummer: "INR-B0-002",
    baugruppenart: "basic",
    durchlaufzeit: 170,
    volumen: 2.1,
  },
  {
    bezeichnung: "Innenraum-P1",
    artikelnummer: "INR-P1-002",
    baugruppenart: "premium",
    durchlaufzeit: 320,
    volumen: 2.3,
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

  // Erstelle Porsche Baugruppen mit Prozess-Verknüpfungen
  const createdPorscheBaugruppen = await Promise.all(
    porscheBaugruppen.map(baugruppe => 
      prisma.baugruppe.create({
        data: {
          ...baugruppe,
          prozesse: {
            connect: createdPorscheProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    )
  )

  // Erstelle Porsche Produkt
  const createdPorscheProdukt = await prisma.produkt.create({
    data: {
      ...porscheProdukt,
      factory: {
        connect: { id: createdPorscheFactory.id }
      }
    }
  })

  // Erstelle Porsche Produktvarianten
  const porscheVarianteBasic = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Carrera Basic",
      produkt: { connect: { id: createdPorscheProdukt.id } },
      baugruppen: {
        connect: createdPorscheBaugruppen
          .filter(bg => bg.baugruppenart === "basic" || bg.baugruppenart === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  const porscheVariantePremium = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Turbo S Premium",
      produkt: { connect: { id: createdPorscheProdukt.id } },
      baugruppen: {
        connect: createdPorscheBaugruppen
          .filter(bg => bg.baugruppenart === "premium" || bg.baugruppenart === "basicAndPremium")
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

  // Erstelle Audi Baugruppen mit Prozess-Verknüpfungen
  const createdAudiBaugruppen = await Promise.all(
    audiBaugruppen.map(baugruppe => 
      prisma.baugruppe.create({
        data: {
          ...baugruppe,
          prozesse: {
            connect: createdAudiProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    )
  )

  // Erstelle Audi Produkte
  const createdAudiProdukte = await Promise.all(
    audiProdukte.map(produkt =>
      prisma.produkt.create({
        data: {
          ...produkt,
          factory: {
            connect: { id: createdAudiFactory.id }
          }
        }
      })
    )
  )

  // Erstelle Audi A8 Produktvariante
  const audiA8Variante = await prisma.produktvariante.create({
    data: {
      bezeichnung: "A8 L quattro",
      produkt: { connect: { id: createdAudiProdukte[0].id } },
      baugruppen: {
        connect: createdAudiBaugruppen
          .filter(bg => bg.baugruppenart === "premium" || bg.baugruppenart === "basicAndPremium")
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
      produkt: { connect: { id: createdAudiProdukte[1].id } },
      baugruppen: {
        connect: createdAudiBaugruppen
          .filter(bg => bg.baugruppenart === "premium" || bg.baugruppenart === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  console.log("✅ Seed-Daten erfolgreich erstellt!")
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