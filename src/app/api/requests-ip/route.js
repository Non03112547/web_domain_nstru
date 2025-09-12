import prisma from "@/lib/db";

export async function POST(req) {
    try {
        const { ipAddress, domainRequestId } = await req.json();

        // ตรวจสอบค่า
        if (ipAddress === undefined) {
            return new Response(
                JSON.stringify({ error: "IP Address ต้องไม่เป็น undefined" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!domainRequestId) {
            return new Response(
                JSON.stringify({ error: "ต้องระบุ domainRequestId" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // ตรวจสอบว่ามี domainRequest จริง
        const existing = await prisma.domainRequest.findUnique({
            where: { id: domainRequestId },
        });

        if (!existing) {
            return new Response(
                JSON.stringify({ error: "ไม่พบ domainRequest ที่ระบุ" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // อัปเดต IP Address
        const saved = await prisma.domainRequest.update({
            where: { id: domainRequestId },
            data: { ipAddress },
        });

        console.log("บันทึก IP Address:", saved);

        return new Response(
            JSON.stringify({ message: "บันทึก IP Address สำเร็จ", data: saved }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("API error:", error);
        return new Response(
            JSON.stringify({ error: "เกิดข้อผิดพลาดในการบันทึก IP Address" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
