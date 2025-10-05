export default async function handler(req, res) {
// สมมติเป็นระบบตรวจเสียง (ตอนนี้จะส่งคะแนนแบบสุ่ม)
const score = Math.floor(Math.random() * 40) + 60;
res.status(200).json({ score });
}
