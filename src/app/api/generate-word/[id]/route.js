import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import prisma from "@/lib/db";
import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkbox(val) {
    return val ? "☑" : "☐";
}

function mapToTemplateData(request) {
    return {
        requesterName: request.requesterName || "",
        user: request.user?.username || "",
        department: request.department || "",
        contact: request.contact || "",
        institution: request.institution || "",
        ipAddress: request.ipAddress || "",
        machineRoom: request.machineRoom || "",
        machinePlace: request.machinePlace || "",
        domain: request.domain || "",
        MATr: checkbox(request.machineAdminType === "requester"),
        MATma: checkbox(request.machineAdminType === "MachineAdmin"),
        machineAdminName: request.machineAdminName || "",
        machineAdminPosition: request.machineAdminPosition || "",
        machineAdminContact: request.machineAdminContact || "",
        pc: checkbox(request.machineType === "PC/Mac"),
        un: checkbox(request.machineType === "Unix Workstation"),
        ot: checkbox(
            request.machineType !== "PC/Mac" && request.machineType !== "Unix Workstation"
        ),
        otherMachineType: request.otherMachineType || "",
        L: checkbox(request.OS === "Linux"),
        U: checkbox(request.OS === "Unix"),
        W: checkbox(request.OS === "MS Windows"),
        O: checkbox(
            request.OS !== "Linux" && request.OS !== "Unix" && request.OS !== "MS Windows"
        ),
        otherOS: request.otherOS || "",
        in: checkbox(request.property === "InNSTRU"),
        io: checkbox(request.property === "InOutNSTRU"),
        no: checkbox(request.useType === "NoSever"),
        S: checkbox(request.useType === "Sever"),
        purpose: request.purpose || "",
        requestedAt: request.requestedAt
            ? request.requestedAt.toLocaleDateString()
            : "",
        approvalCooldownAt: request.approvalCooldownAt
            ? request.approvalCooldownAt.toLocaleDateString()
            : "",
        A: checkbox(request.status === "APPROVED"),
        R: checkbox(request.status === "REJECTED"),
    };
}

export async function GET(req, context) {
    try {
        const params = await context.params;
        const rawId = params.id;

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "download";

        // 1) หา Domain ก่อน
        let domain = await prisma.domain.findUnique({
            where: { id: rawId },
            include: { domainRequest: { include: { user: true } } },
        });

        let request = domain?.domainRequest || null;

        // 2) ถ้าไม่เจอ domain → ลองหา DomainRequest.id
        if (!domain) {
            request = await prisma.domainRequest.findUnique({
                where: { id: rawId },
                include: { user: true, domain_record: true },
            });

            if (!request) {
                return new Response("ไม่พบ Domain หรือ DomainRequest", { status: 404 });
            }

            domain = request.domain_record
                ? await prisma.domain.findUnique({
                    where: { id: request.domain_record.id },
                })
                : await prisma.domain.findUnique({
                    where: { domainRequestId: request.id },
                });
        }

        // ----- PREVIEW MODE -----
        if (mode === "preview") {
            const templatePath = path.join(__dirname, "(nstru-arit-05) web.docx");
            const templateContent = fs.readFileSync(templatePath, "binary");

            const zip = new PizZip(templateContent);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const dbData = mapToTemplateData(request);
            doc.render(dbData);
            /** 
                     * // เอา text ทั้งหมดเป็น array
                                const text = doc.getFullText();
                                return new Response(JSON.stringify({ preview: text }, null, 2), {
                                    status: 200,
                                    headers: { "Content-Type": "application/json" },
                                }); 
                                */

            // สร้าง buffer จาก doc ที่ render แล้ว
            const buffer = doc.getZip().generate({ type: "nodebuffer" });

            // แปลง Word → HTML ด้วย mammoth
            const { value: html } = await mammoth.convertToHtml({ buffer });

            return new Response(JSON.stringify({ html }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ----- DOWNLOAD WORD -----
        if (!request) {
            return new Response("ไม่พบ DomainRequest สำหรับสร้าง Word", { status: 404 });
        }

        const templatePath = path.join(__dirname, "(nstru-arit-05) web.docx");
        const templateContent = fs.readFileSync(templatePath, "binary");

        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dbData = mapToTemplateData(request);
        doc.render(dbData);

        const buffer = doc.getZip().generate({ type: "nodebuffer" });

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


/**
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
**/