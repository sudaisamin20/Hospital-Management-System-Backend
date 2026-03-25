import puppeteer from "puppeteer";
import path from "path";
import ejs from "ejs";
import fs from "fs";

interface TestResult {
  parameter: string;
  result: string | number;
  referenceRange: string;
  unit?: string;
  status?: "Normal" | "High" | "Low" | "Abnormal";
}

interface Medicines {
  medicineId?: string;
  medicineName?: string;
  dosage?: number;
  frequency?: number;
  duration?: number;
  quantity: number;
  timing?: string;
  instructions?: string;
}

interface IPDFData {
  appointment: string;
  patientName: string;
  patientId?: string;
  age?: number;
  gender?: string;
  doctorName: string;
  testName: string;
  date: string;
  testResults: TestResult[];
  remarks: string;
  technicianName?: string;
  pathologistName?: string;
  prescriptionId: string;
  doctorSpecialization: string;
  licenseNo: string;
  patientAge: number;
  patientGender: string;
  patientContact: string;
  doctorLicense: string;
  medicines: Medicines[];
}

export const generatePDF = async (
  templateName: string,
  data: IPDFData,
  fileName: string,
): Promise<string> => {
  try {
    // Ensure PDF directory exists
    const pdfDir = path.join(process.cwd(), "src/public/images/pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    console.log(data.medicines);
    const templatePath = path.join(
      process.cwd(),
      "src/templates",
      `${templateName}.ejs`,
    );
    console.log(process.cwd());
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at ${templatePath}`);
    }

    // Render EJS template with data
    const html = await ejs.renderFile(templatePath, data);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = path.join(pdfDir, `${fileName}.pdf`);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
    });

    await browser.close();

    console.log(`PDF generated successfully at ${pdfPath}`);
    return `${fileName}.pdf`;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
