import cron from 'node-cron'
import prisma from '../lib/db.js'

cron.schedule('0 0 * * *', async () => {
    const now = new Date()

    try {
        // 1) อัปเดตโดเมนที่หมดอายุ (ACTIVE -> EXPIRED)
        const expiredDomains = await prisma.domain.findMany({
            where: {
                status: 'ACTIVE',
                domainRequest: {
                    expiresAt: { lte: now }
                }
            },
            include: { domainRequest: true }
        })

        for (const domain of expiredDomains) {
            await prisma.domain.update({
                where: { id: domain.id },
                data: { status: 'EXPIRED' }
            })
        }

        console.log(`✅ Expired domains updated: ${expiredDomains.length}`)


        // 2) ลบโดเมนที่อยู่ในสถานะ TRASHED
        const trashedDomains = await prisma.domain.findMany({
            where: { status: 'TRASHED', trashExpiresAt: { lte: now } },
            include: { domainRequest: true }
        })

        for (const domain of trashedDomains) {
            // เก็บ log ก่อนลบ
            await prisma.deletedDomainLog.create({
                data: {
                    domainName: domain.domainRequest.domain,
                    reason: 'Expired trash'
                }
            })

            // ลบ domain จริง ๆ
            await prisma.domain.delete({ where: { id: domain.id } })
        }

        console.log(`🗑️ Deleted domains: ${trashedDomains.length}`)
    } catch (err) {
        console.error('❌ Error running cron job:', err)
    }
})
