const { PrismaClient } = require('@prisma/client')
const { beachData } = require('../app/types/beaches')

const prisma = new PrismaClient()

async function main() {
  for (const beach of beachData) {
    await prisma.beach.create({
      data: {
        name: beach.name,
        region: beach.region,
        location: beach.location,
        distanceFromCT: beach.distanceFromCT,
        optimalWindDirections: beach.optimalWindDirections,
        optimalSwellMin: beach.optimalSwellDirections.min,
        optimalSwellMax: beach.optimalSwellDirections.max,
        optimalSwellCardinal: beach.optimalSwellDirections.cardinal,
        bestSeasons: beach.bestSeasons,
        optimalTide: beach.optimalTide,
        description: beach.description,
        difficulty: beach.difficulty,
        waveType: beach.waveType,
        swellSizeMin: beach.swellSize.min,
        swellSizeMax: beach.swellSize.max,
        swellPeriodMin: beach.idealSwellPeriod.min,
        swellPeriodMax: beach.idealSwellPeriod.max,
        waterTempSummer: beach.waterTemp.summer,
        waterTempWinter: beach.waterTemp.winter,
        hazards: beach.hazards,
        crimeLevel: beach.crimeLevel,
        hasSharkAttack: beach.sharkAttack.hasAttack,
        sharkIncidents: beach.sharkAttack.incidents || undefined,
        image: beach.image || null,
        coordinates: beach.coordinates,
        videos: beach.videos || undefined,
        profileImage: beach.profileImage || null,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 