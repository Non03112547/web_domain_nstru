export async function POST(req) {
    try {
        const { ipAddress } = await req.json();

        // ตรวจสอบค่า
        if (ipAddress === undefined) {
            return new Response(
                JSON.stringify({ error: "IP Address ต้องไม่เป็น undefined" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // ทำการบันทึกลง DB หรือ console.log
        console.log("บันทึก IP Address:", ipAddress);

        return new Response(
            JSON.stringify({ message: "บันทึก IP Address สำเร็จ" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "เกิดข้อผิดพลาดในการบันทึก IP Address" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
