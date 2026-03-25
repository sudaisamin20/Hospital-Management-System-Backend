import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectToMongoDB from "./config/databaseConfiguration.ts";
import patientRoute from "./routes/patientRoute.ts";
import doctorRoute from "./routes/doctorRoute.ts";
import receptionistRoute from "./routes/receptionistRoute.ts";
import superadminRoute from "./routes/superadminRoute.ts";
import appointmentRoute from "./routes/appointmentRoute.ts";
import prescriptionRoute from "./routes/prescriptionRoute.ts";
import consultationRoute from "./routes/consultationRoute.ts";
import pharmacistRoute from "./routes/pharmacistRoute.ts";
import labAssistantRoute from "./routes/labAssistantRoute.ts";
import inventoryRoute from "./routes/inventoryRoute.ts";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

ConnectToMongoDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/receptionist", receptionistRoute);
app.use("/api/superadmin", superadminRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/consultation", consultationRoute);
app.use("/api/prescription", prescriptionRoute);
app.use("/api/pharmacist", pharmacistRoute);
app.use("/api/lab", labAssistantRoute);
app.use("/api/inventory", inventoryRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
