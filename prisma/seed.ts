import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ==========================================
// BAUGRUPPENTYPEN DEFINITION (Factory-specific)
// ==========================================
const porscheBaugruppentypenDefinitions = [
  { bezeichnung: "Porsche-Chassis" },
  { bezeichnung: "Porsche-Karosserie" },
  { bezeichnung: "Porsche-Fahrwerk" },
  { bezeichnung: "Porsche-Antrieb" },
  { bezeichnung: "Porsche-Interieur" },
  { bezeichnung: "Porsche-Elektronik" }
]

const audiBaugruppentypenDefinitions = [
  { bezeichnung: "Audi-Chassis" },
  { bezeichnung: "Audi-Karosserie" },
  { bezeichnung: "Audi-Fahrwerk" },
  { bezeichnung: "Audi-Antrieb" },
  { bezeichnung: "Audi-Interieur" },
  { bezeichnung: "Audi-Elektronik" }
]

const vwBaugruppentypenDefinitions = [
  { bezeichnung: "VW-Chassis" },
  { bezeichnung: "VW-Karosserie" },
  { bezeichnung: "VW-Fahrwerk" },
  { bezeichnung: "VW-Antrieb" },
  { bezeichnung: "VW-Interieur" },
  { bezeichnung: "VW-Elektronik" }
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
  demontagezeit?: number | null
  montagezeit?: number | null
  baugruppentyp: string
}

const porscheBaugruppen: BaugruppeWithType[] = [
  {
    bezeichnung: "Porsche-Chassis",
    artikelnummer: "CHS-BP-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 72,
    montagezeit: 108,
    baugruppentyp: "Porsche-Chassis"
  },
  {
    bezeichnung: "Porsche-Karosserie",
    artikelnummer: "KAR-B1-001",
    variantenTyp: "basic",
    demontagezeit: 48,
    montagezeit: 72,
    baugruppentyp: "Porsche-Karosserie"
  },
  {
    bezeichnung: "Porsche-Karosserie",
    artikelnummer: "KAR-B2-001",
    variantenTyp: "basic",
    demontagezeit: 36,
    montagezeit: 54,
    baugruppentyp: "Porsche-Karosserie"
  },
  {
    bezeichnung: "Porsche-Karosserie",
    artikelnummer: "KAR-P1-001",
    variantenTyp: "premium",
    demontagezeit: 60,
    montagezeit: 90,
    baugruppentyp: "Porsche-Karosserie"
  },
  {
    bezeichnung: "Porsche-Karosserie",
    artikelnummer: "KAR-P2-001",
    variantenTyp: "premium",
    demontagezeit: 40,
    montagezeit: 60,
    baugruppentyp: "Porsche-Karosserie"
  },
  {
    bezeichnung: "Porsche-Fahrwerk",
    artikelnummer: "FAH-BP-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 96,
    montagezeit: 144,
    baugruppentyp: "Porsche-Fahrwerk"
  },
  {
    bezeichnung: "Porsche-Antrieb",
    artikelnummer: "ANT-BP-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 144,
    montagezeit: 216,
    baugruppentyp: "Porsche-Antrieb"
  },
  {
    bezeichnung: "Porsche-Interieur",
    artikelnummer: "INT-B-001",
    variantenTyp: "basic",
    demontagezeit: 60,
    montagezeit: 90,
    baugruppentyp: "Porsche-Interieur"
  },
  {
    bezeichnung: "Porsche-Interieur",
    artikelnummer: "INT-P-001",
    variantenTyp: "premium",
    demontagezeit: 72,
    montagezeit: 108,
    baugruppentyp: "Porsche-Interieur"
  },
  {
    bezeichnung: "Porsche-Elektronik",
    artikelnummer: "ELE-BP-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 48,
    montagezeit: 72,
    baugruppentyp: "Porsche-Elektronik"
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
    bezeichnung: "Audi-Chassis",
    artikelnummer: "AUDI-CHS-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 64,
    montagezeit: 96,
    baugruppentyp: "Audi-Chassis"
  },
  {
    bezeichnung: "Audi-Karosserie",
    artikelnummer: "AUDI-KAR-B-001",
    variantenTyp: "basic",
    demontagezeit: 44,
    montagezeit: 66,
    baugruppentyp: "Audi-Karosserie"
  },
  {
    bezeichnung: "Audi-Karosserie",
    artikelnummer: "AUDI-KAR-P-001",
    variantenTyp: "premium",
    demontagezeit: 56,
    montagezeit: 84,
    baugruppentyp: "Audi-Karosserie"
  },
  {
    bezeichnung: "Audi-Fahrwerk",
    artikelnummer: "AUDI-FAH-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 88,
    montagezeit: 132,
    baugruppentyp: "Audi-Fahrwerk"
  },
  {
    bezeichnung: "Audi-Antrieb",
    artikelnummer: "AUDI-ANT-B-001",
    variantenTyp: "basic",
    demontagezeit: 128,
    montagezeit: 192,
    baugruppentyp: "Audi-Antrieb"
  },
  {
    bezeichnung: "Audi-Antrieb",
    artikelnummer: "AUDI-ANT-P-001",
    variantenTyp: "premium",
    demontagezeit: 152,
    montagezeit: 228,
    baugruppentyp: "Audi-Antrieb"
  },
  {
    bezeichnung: "Audi-Interieur",
    artikelnummer: "AUDI-INT-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 64,
    montagezeit: 96,
    baugruppentyp: "Audi-Interieur"
  },
  {
    bezeichnung: "Audi-Elektronik",
    artikelnummer: "AUDI-ELE-B-001",
    variantenTyp: "basic",
    demontagezeit: 40,
    montagezeit: 60,
    baugruppentyp: "Audi-Elektronik"
  },
  {
    bezeichnung: "Audi-Elektronik",
    artikelnummer: "AUDI-ELE-P-001",
    variantenTyp: "premium",
    demontagezeit: 56,
    montagezeit: 84,
    baugruppentyp: "Audi-Elektronik"
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
    bezeichnung: "VW-Chassis",
    artikelnummer: "VW-CHS-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 56,
    montagezeit: 84,
    baugruppentyp: "VW-Chassis"
  },
  {
    bezeichnung: "VW-Karosserie",
    artikelnummer: "VW-KAR-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 40,
    montagezeit: 60,
    baugruppentyp: "VW-Karosserie"
  },
  {
    bezeichnung: "VW-Fahrwerk",
    artikelnummer: "VW-FAH-B-001",
    variantenTyp: "basic",
    demontagezeit: 80,
    montagezeit: 120,
    baugruppentyp: "VW-Fahrwerk"
  },
  {
    bezeichnung: "VW-Fahrwerk",
    artikelnummer: "VW-FAH-P-001",
    variantenTyp: "premium",
    demontagezeit: 100,
    montagezeit: 150,
    baugruppentyp: "VW-Fahrwerk"
  },
  {
    bezeichnung: "VW-Antrieb",
    artikelnummer: "VW-ANT-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 120,
    montagezeit: 180,
    baugruppentyp: "VW-Antrieb"
  },
  {
    bezeichnung: "VW-Interieur",
    artikelnummer: "VW-INT-B-001",
    variantenTyp: "basic",
    demontagezeit: 56,
    montagezeit: 84,
    baugruppentyp: "VW-Interieur"
  },
  {
    bezeichnung: "VW-Interieur",
    artikelnummer: "VW-INT-P-001",
    variantenTyp: "premium",
    demontagezeit: 68,
    montagezeit: 102,
    baugruppentyp: "VW-Interieur"
  },
  {
    bezeichnung: "VW-Elektronik",
    artikelnummer: "VW-ELE-001",
    variantenTyp: "basicAndPremium",
    demontagezeit: 44,
    montagezeit: 66,
    baugruppentyp: "VW-Elektronik"
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
    porscheBaugruppentypenDefinitions.map(typ => 
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
    audiBaugruppentypenDefinitions.map(typ => 
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
    vwBaugruppentypenDefinitions.map(typ => 
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