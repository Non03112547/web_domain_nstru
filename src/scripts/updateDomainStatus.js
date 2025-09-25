import cron from 'node-cron'
import prisma from '../lib/db.js'

cron.schedule('30 7 * * *', async () => {
    const now = new Date()
    try {
        // 1) ACTIVE -> EXPIRED
        const expiredDomains = await prisma.domain.findMany({
            where: {
                status: 'ACTIVE',
                domainRequest: { expiresAt: { lte: now } }
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

        // 2) EXPIRED -> TRASHED (รอครบ 30 วัน)
        const thresholdDate = new Date()
        thresholdDate.setDate(now.getDate() - 30) // ครบ 30 วันหลังหมดอายุ

        const domainsToTrash = await prisma.domain.findMany({
            where: {
                status: 'EXPIRED',
                domainRequest: { expiresAt: { lte: thresholdDate } }
            },
            include: { domainRequest: true }
        })

        for (const domain of domainsToTrash) {
            // ตั้ง trashExpiresAt = วันนี้ + 30 วัน
            const trashDate = new Date()
            trashDate.setDate(now.getDate() + 30)

            await prisma.domain.update({
                where: { id: domain.id },
                data: {
                    deletedAt: now,
                    status: 'TRASHED',
                    trashExpiresAt: trashDate
                }
            })
        }

        console.log(`🗑️ Moved to trash: ${domainsToTrash.length}`)

        // 3) ลบโดเมนที่ TRASHED
        const trashedDomains = await prisma.domain.findMany({
            where: { status: 'TRASHED', trashExpiresAt: { lte: now } },
            include: { domainRequest: true }
        })

        for (const domain of trashedDomains) {
            // เก็บ log ก่อนลบ
            await prisma.deletedDomainLog.create({
                data: {
                    domainName: domain.domainRequest.domain,
                    reason: 'Trashed expired 30 days'
                }
            })

            // ลบ domain จริง
            await prisma.domain.delete({ where: { id: domain.id } })
        }

        console.log(`🚮 Permanently deleted: ${trashedDomains.length}`)
    } catch (err) {
        console.error('❌ Error running cron job:', err)
    }
})
