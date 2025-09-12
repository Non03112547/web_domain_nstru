import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import prisma from "@/lib/db";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkbox(val) {
    return val ? "☑" : "☐";
}

function mapToTemplateData(request) {
    return {
        requesterName: request.requesterName || "",
        responsibleName: request.responsibleName || "",
        position: request.position || "",
        department: request.department || "",
        contactP: request.contactP || "",
        contactE: request.contactE || "",
        institution: request.institution || "",
        ipAddress: request.ipAddress || "",
        machineRoom: request.machineRoom || "",
        machinePlace: request.machinePlace || "",
        domain: request.domain || "",
        MATr: checkbox(request.machineAdminType === "requester"),
        MATma: checkbox(request.machineAdminType === "MachineAdmin"),
        machineAdminName: request.machineAdminType === "MachineAdmin" ? request.machineAdminName : "  …………………",
        machineAdminPosition: request.machineAdminType === "MachineAdmin" ? request.machineAdminPosition : " …………………",
        machineAdminContactP: request.machineAdminType === "MachineAdmin" ? request.machineAdminContactP : " …………………",
        machineAdminContactE: request.machineAdminType === "MachineAdmin" ? request.machineAdminContactE : " …………………",

        pc: checkbox(request.machineType === "PC/Mac"),
        un: checkbox(request.machineType === "Unix Workstation"),
        ot: checkbox(
            request.machineType !== "PC/Mac" && request.machineType !== "Unix Workstation"
        ),
        otherMachineType: request.machineType !== "PC/Mac" && request.machineType !== "Unix Workstation" ? request.machineType : "………",
        L: checkbox(request.OS === "Linux"),
        U: checkbox(request.OS === "Unix"),
        W: checkbox(request.OS === "MS Windows"),
        O: checkbox(
            request.OS !== "Linux" && request.OS !== "Unix" && request.OS !== "MS Windows"
        ),
        otherOS: request.OS !== "Linux" && request.OS !== "Unix" && request.OS !== "MS Windows" ? request.OS : "………",
        in: checkbox(request.property === "InNSTRU"),
        io: checkbox(request.property === "InOutNSTRU"),
        no: checkbox(request.useType === "NoSever"),
        S: checkbox(request.useType === "Sever"),
        purpose: request.useType === "Sever" ? request.purpose : "…………………",
        requestedAt: request.requestedAt
            ? request.requestedAt.toLocaleDateString()
            : "",

        approvalCooldownAt: request.domain_record?.decideTime
            ? request.domain_record?.decideTime.toLocaleDateString()
            : "",
        A: checkbox(request.status === "A"),
        R: checkbox(request.status === "R"),
    };
}

export async function GET(req, context) {
    try {
        const params = await context.params;
        const rawId = params.id;
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "download";

        // หา Domain / DomainRequest
        let domain = await prisma.domain.findUnique({
            where: { id: rawId },
            include: { domainRequest: { include: { user: true } } },
        });

        let request = domain?.domainRequest || null;

        if (!domain) {
            request = await prisma.domainRequest.findUnique({
                where: { id: rawId },
                include: { user: true, domain_record: true },
            });

            if (!request) {
                return new Response("ไม่พบ Domain หรือ DomainRequest", { status: 404 });
            }

            domain = request.domain_record
                ? await prisma.domain.findUnique({ where: { id: request.domain_record.id } })
                : await prisma.domain.findUnique({ where: { domainRequestId: request.id } });
        }

        const templatePath = path.join(__dirname, "(nstru-arit-05) web.docx");
        const templateContent = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        const dbData = mapToTemplateData(request);
        doc.render(dbData);
        const buffer = doc.getZip().generate({ type: "nodebuffer" });

        // ----- PREVIEW MODE -----
        if (mode === "preview") {
            // สร้างไฟล์ Word ชั่วคราว
            const tempDocx = path.join(__dirname, `temp_${request.id}.docx`);
            fs.writeFileSync(tempDocx, buffer);

            // แปลง Word → PDF ด้วย LibreOffice
            const tempPdf = path.join(__dirname, `temp_${request.id}.pdf`);
            await new Promise((resolve, reject) => {
                exec(
                    `soffice --headless --convert-to pdf "${tempDocx}" --outdir "${__dirname}"`,
                    (err, stdout, stderr) => {
                        if (err) reject(err);
                        else resolve(stdout);
                    }
                );
            });

            const pdfBuffer = fs.readFileSync(tempPdf);

            // ลบไฟล์ชั่วคราว
            fs.unlinkSync(tempDocx);
            fs.unlinkSync(tempPdf);

            return new Response(pdfBuffer, {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename=domainRequest_${request.id}.pdf`,
                },
            });
        }

        // ----- DOWNLOAD WORD -----
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

