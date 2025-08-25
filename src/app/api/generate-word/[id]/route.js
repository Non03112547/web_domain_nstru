import { Document, Packer, Paragraph } from "docx";
import prisma from "@/lib/db";

export async function GET(req, context) {
    try {
        // ⚠️ Next.js App Router: ต้อง await context.params
        const params = await context.params;
        const rawId = params.id;

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "download";

        // 1) ลองหา Domain ก่อน
        let domain = await prisma.domain.findUnique({
            where: { id: rawId },
            include: {
                domainRequest: { include: { user: true } },
            },
        });

        let request = domain?.domainRequest || null;

        // 2) ถ้าไม่เจอ domain → อาจเป็น DomainRequest.id
        if (!domain) {
            request = await prisma.domainRequest.findUnique({
                where: { id: rawId },
                include: {
                    user: true,
                    domain_record: true,
                },
            });

            if (!request) {
                return new Response("ไม่พบ Domain หรือ DomainRequest", { status: 404 });
            }

            // หา Domain จากความสัมพันธ์
            domain = request.domain_record
                ? await prisma.domain.findUnique({
                    where: { id: request.domain_record.id },
                })
                : await prisma.domain.findUnique({
                    where: { domainRequestId: request.id },
                });
        }

        // ----- PREVIEW -----
        if (mode === "preview") {
            const preview = {
                title: "Domain Request Preview",
                domainId: domain?.id || null,
                domainName: request?.domain || "-",
                requester: request?.requesterName || "-",
                responsible: request?.responsibleName || "-",
                department: request?.department || "-",
                institution: request?.institution || "-",
                contact: request?.contact || "-",
                contactType: request?.contactType || "-",
                ipAddress: request?.ipAddress || "-",
                machineType: request?.machineType || "-",
                OS: request?.OS || "-",
                purpose: request?.purpose || "-",
                status: request?.status || "-",
                requestedAt: request?.requestedAt
                    ? new Date(request.requestedAt).toLocaleString()
                    : "-",
            };

            return new Response(JSON.stringify(preview, null, 2), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ----- DOWNLOAD WORD -----
        if (!request) {
            return new Response("ไม่พบ DomainRequest สำหรับสร้าง Word", { status: 404 });
        }

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({ text: "Domain Request Report", bold: true }),
                        new Paragraph(`Requester: ${request.requesterName || "-"}`),
                        new Paragraph(`Responsible: ${request.responsibleName || "-"}`),
                        new Paragraph(`Department: ${request.department || "-"}`),
                        new Paragraph(`Institution: ${request.institution || "-"}`),
                        new Paragraph(`Contact: ${request.contact || "-"}`),
                        new Paragraph(`Domain: ${request.domain || "-"}`),
                        new Paragraph(`IP Address: ${request.ipAddress || "-"}`),
                        new Paragraph(`Machine Type: ${request.machineType || "-"}`),
                        new Paragraph(`OS: ${request.OS || "-"}`),
                        new Paragraph(`Purpose: ${request.purpose || "-"}`),
                        new Paragraph(`Status: ${request.status || "-"}`),
                        new Paragraph(
                            `Requested At: ${request.requestedAt
                                ? new Date(request.requestedAt).toLocaleString()
                                : "-"
                            }`
                        ),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=domainRequest_${request.id}.docx`,
            },
        });
    } catch (err) {
        console.error("Error generating Word/Preview:", err);
        return new Response("ไม่สามารถสร้าง Word/Preview ได้", { status: 500 });
    }
}
