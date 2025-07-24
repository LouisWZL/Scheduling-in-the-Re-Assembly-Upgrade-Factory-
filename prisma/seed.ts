import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Reassembly Factory
const factory: Prisma.ReassemblyFactoryCreateInput = {
  name: "Stuttgart Porsche Reassembly Center",
  kapazität: 50
}

// Prozesse
const prozesse: Prisma.ProzessCreateInput[] = [
  { name: "Demontage" },
  { name: "Reinigung & Entfettung" },
  { name: "Oberflächenbehandlung" },
  { name: "Montage" },
  { name: "Qualitätskontrolle" }
]

// Baugruppen
const baugruppen: Prisma.BaugruppeCreateInput[] = [
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

// Produkt
const produkt: Prisma.ProduktCreateInput = {
  bezeichnung: "Porsche 911",
  seriennummer: "P911-2024-001"
}

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

  // Erstelle Factory
  const createdFactory = await prisma.reassemblyFactory.create({
    data: factory
  })

  // Erstelle Prozesse
  const createdProzesse = await Promise.all(
    prozesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle Baugruppen mit Prozess-Verknüpfungen
  const createdBaugruppen = await Promise.all(
    baugruppen.map(baugruppe => 
      prisma.baugruppe.create({
        data: {
          ...baugruppe,
          prozesse: {
            connect: createdProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    )
  )

  // Erstelle Produkt mit Factory-Verknüpfung
  const createdProdukt = await prisma.produkt.create({
    data: {
      ...produkt,
      factory: {
        connect: { id: createdFactory.id }
      }
    }
  })

  // Erstelle Produktvarianten
  const varianteBasic = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Carrera Basic",
      produkt: { connect: { id: createdProdukt.id } },
      baugruppen: {
        connect: createdBaugruppen
          .filter(bg => bg.baugruppenart === "basic" || bg.baugruppenart === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  const variantePremium = await prisma.produktvariante.create({
    data: {
      bezeichnung: "911 Turbo S Premium",
      produkt: { connect: { id: createdProdukt.id } },
      baugruppen: {
        connect: createdBaugruppen
          .filter(bg => bg.baugruppenart === "premium" || bg.baugruppenart === "basicAndPremium")
          .map(bg => ({ id: bg.id }))
      },
      links: {},
      zustand: "SEHR_GUT"
    }
  })

  console.log("✅ Seed-Daten erfolgreich erstellt!")
  console.log(`  - Factory: ${createdFactory.name}`)
  console.log(`  - Produkt: ${createdProdukt.bezeichnung}`)
  console.log(`  - Baugruppen: ${createdBaugruppen.length}`)
  console.log(`  - Prozesse: ${createdProzesse.length}`)
  console.log(`  - Produktvarianten: 2`)
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