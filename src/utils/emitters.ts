import { io } from "../../src/index.ts";

export const emitNewAppointment = (appointment) => {
  io.to("receptionists").emit("newAppointment", { appointment });
};

export const emitAppointmentConfirmed = (appointment) => {
  io.to(`doctor_${appointment.doctorId}`).emit("appointmentConfirmed", {
    appointment,
  });
  io.to(`patient_${appointment.patientId}`).emit("appointmentConfirmed", {
    appointment,
  });
};

export const emitNotification = ({ doctorId }) => {
  io.to(`receptionists`).emit("notification");
  io.to(`pharmacists`).emit("notification");
  io.to(`labAssistants`).emit("notification");
  if (doctorId) {
    io.to(`doctor_${doctorId}`).emit("notification");
  }
};
