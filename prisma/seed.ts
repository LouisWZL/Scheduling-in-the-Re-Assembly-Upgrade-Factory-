import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ==========================================
// BAUGRUPPENTYPEN DEFINITION (Factory-specific)
// ==========================================
const baugruppentypenDefinitions = [
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
    artikelnummer: "INT-B-001",
    variantenTyp: "basic",
    prozesszeit: 150,
    volumen: 2.0,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "INT-P-001",
    variantenTyp: "premium",
    prozesszeit: 180,
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
const porscheProdukt: Omit<Prisma.ProduktCreateInput, 'factory'> = {
  bezeichnung: "Porsche 911",
  seriennummer: "P911-2024-001"
}

// ==========================================
// INGOLSTADT AUDI REASSEMBLY FACTORY
// ==========================================

// Audi Factory
const audiFactory: Prisma.ReassemblyFactoryCreateInput = {
  name: "Ingolstadt Audi Reassembly Factory",
  kapazität: 75
}

// Audi Prozesse
const audiProzesse: Prisma.ProzessCreateInput[] = [
  { name: "Vorreinigung" },
  { name: "Teildemontage" },
  { name: "Hauptreinigung" },
  { name: "Reparatur & Aufbereitung" },
  { name: "Neumontage" },
  { name: "Endkontrolle" }
]

// Audi Baugruppen
const audiBaugruppen: BaugruppeWithType[] = [
  {
    bezeichnung: "Chassis",
    artikelnummer: "AUDI-CHS-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 160,
    volumen: 2.3,
    baugruppentyp: "Chassis"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "AUDI-KAR-B-001",
    variantenTyp: "basic",
    prozesszeit: 110,
    volumen: 2.8,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "AUDI-KAR-P-001",
    variantenTyp: "premium",
    prozesszeit: 140,
    volumen: 3.2,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Fahrwerk",
    artikelnummer: "AUDI-FAH-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 220,
    volumen: 1.7,
    baugruppentyp: "Fahrwerk"
  },
  {
    bezeichnung: "Antrieb",
    artikelnummer: "AUDI-ANT-B-001",
    variantenTyp: "basic",
    prozesszeit: 320,
    volumen: 1.4,
    baugruppentyp: "Antrieb"
  },
  {
    bezeichnung: "Antrieb",
    artikelnummer: "AUDI-ANT-P-001",
    variantenTyp: "premium",
    prozesszeit: 380,
    volumen: 1.6,
    baugruppentyp: "Antrieb"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "AUDI-INT-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 160,
    volumen: 2.1,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Elektronik",
    artikelnummer: "AUDI-ELE-B-001",
    variantenTyp: "basic",
    prozesszeit: 100,
    volumen: 0.4,
    baugruppentyp: "Elektronik"
  },
  {
    bezeichnung: "Elektronik",
    artikelnummer: "AUDI-ELE-P-001",
    variantenTyp: "premium",
    prozesszeit: 140,
    volumen: 0.6,
    baugruppentyp: "Elektronik"
  }
]

// Audi Produkte
const audiProdukte: Omit<Prisma.ProduktCreateInput, 'factory'>[] = [
  {
    bezeichnung: "Audi A6",
    seriennummer: "A6-2024-001"
  },
  {
    bezeichnung: "Audi Q7",
    seriennummer: "Q7-2024-001"
  }
]

// ==========================================
// WOLFSBURG VOLKSWAGEN RE-MANUFACTURING PLANT
// ==========================================

// VW Factory
const vwFactory: Prisma.ReassemblyFactoryCreateInput = {
  name: "Wolfsburg Volkswagen Re-Manufacturing Plant",
  kapazität: 100
}

// VW Prozesse
const vwProzesse: Prisma.ProzessCreateInput[] = [
  { name: "Eingangsprüfung" },
  { name: "Komplettdemontage" },
  { name: "Teilereinigung" },
  { name: "Aufarbeitung" },
  { name: "Neumontage" },
  { name: "Funktionsprüfung" },
  { name: "Qualitätssicherung" }
]

// VW Baugruppen
const vwBaugruppen: BaugruppeWithType[] = [
  {
    bezeichnung: "Chassis",
    artikelnummer: "VW-CHS-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 140,
    volumen: 2.2,
    baugruppentyp: "Chassis"
  },
  {
    bezeichnung: "Karosserie",
    artikelnummer: "VW-KAR-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 100,
    volumen: 2.7,
    baugruppentyp: "Karosserie"
  },
  {
    bezeichnung: "Fahrwerk",
    artikelnummer: "VW-FAH-B-001",
    variantenTyp: "basic",
    prozesszeit: 200,
    volumen: 1.6,
    baugruppentyp: "Fahrwerk"
  },
  {
    bezeichnung: "Fahrwerk",
    artikelnummer: "VW-FAH-P-001",
    variantenTyp: "premium",
    prozesszeit: 250,
    volumen: 1.8,
    baugruppentyp: "Fahrwerk"
  },
  {
    bezeichnung: "Antrieb",
    artikelnummer: "VW-ANT-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 300,
    volumen: 1.3,
    baugruppentyp: "Antrieb"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "VW-INT-B-001",
    variantenTyp: "basic",
    prozesszeit: 140,
    volumen: 1.9,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Interieur",
    artikelnummer: "VW-INT-P-001",
    variantenTyp: "premium",
    prozesszeit: 170,
    volumen: 2.0,
    baugruppentyp: "Interieur"
  },
  {
    bezeichnung: "Elektronik",
    artikelnummer: "VW-ELE-001",
    variantenTyp: "basicAndPremium",
    prozesszeit: 110,
    volumen: 0.45,
    baugruppentyp: "Elektronik"
  }
]

// VW Produkte
const vwProdukte: Omit<Prisma.ProduktCreateInput, 'factory'>[] = [
  {
    bezeichnung: "Volkswagen Polo",
    seriennummer: "POLO-2024-001"
  },
  {
    bezeichnung: "Volkswagen Tiguan",
    seriennummer: "TIG-2024-001"
  },
  {
    bezeichnung: "Volkswagen ID.4",
    seriennummer: "ID4-2024-001"
  }
]

// ==========================================
// SEEDING FUNCTION
// ==========================================

async function main() {
  console.log('🌱 Start seeding ...')

  // Clean database in correct order (dependent records first)
  await prisma.liefertermin.deleteMany()
  await prisma.auftrag.deleteMany()
  await prisma.produktvariante.deleteMany()
  await prisma.produkt.deleteMany()
  await prisma.baugruppe.deleteMany()
  await prisma.baugruppentyp.deleteMany()
  await prisma.reassemblyFactory.deleteMany()
  await prisma.prozess.deleteMany()
  await prisma.kunde.deleteMany()

  // ==========================================
  // ERSTELLE PORSCHE FACTORY
  // ==========================================
  
  const createdPorscheFactory = await prisma.reassemblyFactory.create({
    data: porscheFactory
  })

  // Erstelle Porsche Baugruppentypen
  const createdPorscheBaugruppentypen = await Promise.all(
    baugruppentypenDefinitions.map(typ => 
      prisma.baugruppentyp.create({
        data: {
          ...typ,
          factory: { connect: { id: createdPorscheFactory.id } }
        }
      })
    )
  )

  // Erstelle Porsche Prozesse
  const createdPorscheProzesse = await Promise.all(
    porscheProzesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle Porsche Baugruppen mit Prozess-Verknüpfungen und Baugruppentyp
  const createdPorscheBaugruppen = await Promise.all(
    porscheBaugruppen.map(async (baugruppe) => {
      const { baugruppentyp, ...baugruppeData } = baugruppe
      const baugruppenTypObject = createdPorscheBaugruppentypen.find(t => t.bezeichnung === baugruppentyp)
      
      return prisma.baugruppe.create({
        data: {
          ...baugruppeData,
          factory: { connect: { id: createdPorscheFactory.id } },
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
        connect: createdPorscheBaugruppentypen.map(typ => ({ id: typ.id }))
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

  // Erstelle Audi Baugruppentypen
  const createdAudiBaugruppentypen = await Promise.all(
    baugruppentypenDefinitions.map(typ => 
      prisma.baugruppentyp.create({
        data: {
          ...typ,
          factory: { connect: { id: createdAudiFactory.id } }
        }
      })
    )
  )

  // Erstelle Audi Prozesse
  const createdAudiProzesse = await Promise.all(
    audiProzesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle Audi Baugruppen mit Prozess-Verknüpfungen und Baugruppentyp
  const createdAudiBaugruppen = await Promise.all(
    audiBaugruppen.map(async (baugruppe) => {
      const { baugruppentyp, ...baugruppeData } = baugruppe
      const baugruppenTypObject = createdAudiBaugruppentypen.find(t => t.bezeichnung === baugruppentyp)
      
      return prisma.baugruppe.create({
        data: {
          ...baugruppeData,
          factory: { connect: { id: createdAudiFactory.id } },
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
            connect: createdAudiBaugruppentypen.map(typ => ({ id: typ.id }))
          }
        }
      })
    )
  )

  // Erstelle Audi Produktvarianten
  for (const produkt of createdAudiProdukte) {
    await prisma.produktvariante.create({
      data: {
        bezeichnung: `${produkt.bezeichnung} Basic`,
        typ: "basic",
        produkt: { connect: { id: produkt.id } },
        baugruppen: {
          connect: createdAudiBaugruppen
            .filter(bg => bg.variantenTyp === "basic" || bg.variantenTyp === "basicAndPremium")
            .map(bg => ({ id: bg.id }))
        },
        links: {},
        zustand: "GUT"
      }
    })

    await prisma.produktvariante.create({
      data: {
        bezeichnung: `${produkt.bezeichnung} Premium`,
        typ: "premium",
        produkt: { connect: { id: produkt.id } },
        baugruppen: {
          connect: createdAudiBaugruppen
            .filter(bg => bg.variantenTyp === "premium" || bg.variantenTyp === "basicAndPremium")
            .map(bg => ({ id: bg.id }))
        },
        links: {},
        zustand: "SEHR_GUT"
      }
    })
  }

  // ==========================================
  // ERSTELLE VW FACTORY
  // ==========================================
  
  const createdVWFactory = await prisma.reassemblyFactory.create({
    data: vwFactory
  })

  // Erstelle VW Baugruppentypen
  const createdVWBaugruppentypen = await Promise.all(
    baugruppentypenDefinitions.map(typ => 
      prisma.baugruppentyp.create({
        data: {
          ...typ,
          factory: { connect: { id: createdVWFactory.id } }
        }
      })
    )
  )

  // Erstelle VW Prozesse
  const createdVWProzesse = await Promise.all(
    vwProzesse.map(prozess => prisma.prozess.create({ data: prozess }))
  )

  // Erstelle VW Baugruppen mit Prozess-Verknüpfungen und Baugruppentyp
  const createdVWBaugruppen = await Promise.all(
    vwBaugruppen.map(async (baugruppe) => {
      const { baugruppentyp, ...baugruppeData } = baugruppe
      const baugruppenTypObject = createdVWBaugruppentypen.find(t => t.bezeichnung === baugruppentyp)
      
      return prisma.baugruppe.create({
        data: {
          ...baugruppeData,
          factory: { connect: { id: createdVWFactory.id } },
          baugruppentyp: baugruppenTypObject ? {
            connect: { id: baugruppenTypObject.id }
          } : undefined,
          prozesse: {
            connect: createdVWProzesse.map(p => ({ id: p.id }))
          }
        }
      })
    })
  )

  // Erstelle VW Produkte mit Baugruppentypen
  const createdVWProdukte = await Promise.all(
    vwProdukte.map(produkt =>
      prisma.produkt.create({
        data: {
          ...produkt,
          factory: {
            connect: { id: createdVWFactory.id }
          },
          baugruppentypen: {
            connect: createdVWBaugruppentypen.map(typ => ({ id: typ.id }))
          }
        }
      })
    )
  )

  // Erstelle VW Produktvarianten
  for (const produkt of createdVWProdukte) {
    if (produkt.bezeichnung.includes("Polo") || produkt.bezeichnung.includes("ID.4")) {
      // Nur Basic Variante für Polo und ID.4
      await prisma.produktvariante.create({
        data: {
          bezeichnung: `${produkt.bezeichnung} Basic`,
          typ: "basic",
          produkt: { connect: { id: produkt.id } },
          baugruppen: {
            connect: createdVWBaugruppen
              .filter(bg => bg.variantenTyp === "basic" || bg.variantenTyp === "basicAndPremium")
              .map(bg => ({ id: bg.id }))
          },
          links: {},
          zustand: "GUT"
        }
      })
    } else {
      // Basic und Premium für andere Produkte
      await prisma.produktvariante.create({
        data: {
          bezeichnung: `${produkt.bezeichnung} Basic`,
          typ: "basic",
          produkt: { connect: { id: produkt.id } },
          baugruppen: {
            connect: createdVWBaugruppen
              .filter(bg => bg.variantenTyp === "basic" || bg.variantenTyp === "basicAndPremium")
              .map(bg => ({ id: bg.id }))
          },
          links: {},
          zustand: "GUT"
        }
      })

      await prisma.produktvariante.create({
        data: {
          bezeichnung: `${produkt.bezeichnung} Premium`,
          typ: "premium",
          produkt: { connect: { id: produkt.id } },
          baugruppen: {
            connect: createdVWBaugruppen
              .filter(bg => bg.variantenTyp === "premium" || bg.variantenTyp === "basicAndPremium")
              .map(bg => ({ id: bg.id }))
          },
          links: {},
          zustand: "SEHR_GUT"
        }
      })
    }
  }

  // ==========================================
  // ERSTELLE KUNDEN
  // ==========================================
  
  const createdKunden = await Promise.all([
    prisma.kunde.create({
      data: {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max.mustermann@example.com",
        telefon: "+49 123 456789",
        adresse: "Musterstraße 1, 12345 Musterstadt"
      }
    }),
    prisma.kunde.create({
      data: {
        vorname: "Erika",
        nachname: "Schmidt",
        email: "erika.schmidt@example.com",
        telefon: "+49 987 654321",
        adresse: "Beispielweg 42, 54321 Beispielstadt"
      }
    }),
    prisma.kunde.create({
      data: {
        vorname: "Thomas",
        nachname: "Müller",
        email: "thomas.mueller@example.com",
        telefon: "+49 555 123456",
        adresse: "Hauptstraße 10, 67890 Neustadt"
      }
    })
  ])

  // ==========================================
  // ERSTELLE AUFTRÄGE
  // ==========================================
  
  // Porsche Aufträge
  await prisma.auftrag.create({
    data: {
      kunde: { connect: { id: createdKunden[0].id } },
      produktvariante: { connect: { id: porscheVarianteBasic.id } },
      phase: "ERSTKONTAKT",
      upgradeTyp: "WUNSCH",
      factory: { connect: { id: createdPorscheFactory.id } },
      liefertermine: {
        create: {
          typ: "GROB_ZEITSCHIENE",
          datum: new Date("2024-06-15"),
          istAktuell: true,
          bemerkung: "Erste Schätzung nach Kundengespräch"
        }
      }
    }
  })

  await prisma.auftrag.create({
    data: {
      kunde: { connect: { id: createdKunden[1].id } },
      produktvariante: { connect: { id: porscheVariantePremium.id } },
      phase: "FEINTERMINIERUNG",
      upgradeTyp: "KOMBINIERT",
      factory: { connect: { id: createdPorscheFactory.id } },
      liefertermine: {
        create: [
          {
            typ: "GROB_ZEITSCHIENE",
            datum: new Date("2024-05-01"),
            istAktuell: false,
            bemerkung: "Erste Schätzung"
          },
          {
            typ: "GROBTERMIN",
            datum: new Date("2024-05-15"),
            istAktuell: false,
            bemerkung: "Nach Grobterminierung"
          },
          {
            typ: "FEINTERMIN",
            datum: new Date("2024-05-20"),
            istAktuell: true,
            bemerkung: "Nach Inspektion angepasst"
          }
        ]
      }
    }
  })

  // Audi Aufträge
  const audiVarianten = await prisma.produktvariante.findMany({
    where: { produkt: { factoryId: createdAudiFactory.id } }
  })

  if (audiVarianten.length > 0) {
    await prisma.auftrag.create({
      data: {
        kunde: { connect: { id: createdKunden[2].id } },
        produktvariante: { connect: { id: audiVarianten[0].id } },
        phase: "REMONTAGE",
        upgradeTyp: "PFLICHT",
        factory: { connect: { id: createdAudiFactory.id } },
        liefertermine: {
          create: {
            typ: "FEINTERMIN",
            datum: new Date("2024-04-25"),
            istAktuell: true,
            bemerkung: "In Bearbeitung"
          }
        }
      }
    })
  }

  // VW Aufträge
  const vwVarianten = await prisma.produktvariante.findMany({
    where: { produkt: { factoryId: createdVWFactory.id } },
    take: 2
  })

  for (const variante of vwVarianten) {
    await prisma.auftrag.create({
      data: {
        kunde: { connect: { id: createdKunden[Math.floor(Math.random() * createdKunden.length)].id } },
        produktvariante: { connect: { id: variante.id } },
        phase: "GROBTERMINIERUNG",
        upgradeTyp: "WUNSCH",
        factory: { connect: { id: createdVWFactory.id } },
        liefertermine: {
          create: {
            typ: "GROB_ZEITSCHIENE",
            datum: new Date("2024-07-01"),
            istAktuell: true
          }
        }
      }
    })
  }

  console.log('✅ Seeding completed successfully!')
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