
import cron from 'node-cron'
import prisma from '../lib/db.js'

cron.schedule('0 0 * * *', async () => {
    const now = new Date()

    const expiredDomains = await prisma.domain.updateMany({
        where: {
            status: 'ACTIVE',
            domainRequest: { expiresAt: { lte: now } }
        },
        data: { status: 'EXPIRED' }
    })

    const deleted = await prisma.domain.deleteMany({
        where: { status: 'TRASHED', trashExpiresAt: { lte: now } }
    })

    console.log(`Expired domains updated: ${expiredDomains.count}`)
    console.log(`Deleted domains: ${deleted.count}`)
})
