export const setupSocket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("User connected:", socket.id);

    socket.on("join", ({ role, id }: { role: string; id: string }) => {
      if (role === "doctor") {
        socket.join(`doctor_${id}`);
        console.log(`Doctor ${id} joined room`);
      } else if (role === "patient") {
        socket.join(`patient_${id}`);
        console.log(`Patient ${id} joined room`);
      } else if (role === "receptionist") {
        socket.join(`receptionist_${id}`);
        socket.join("receptionists");
        console.log(`Receptionist ${id} joined receptionists room`);
      } else if (role === "labAssistant") {
        socket.join("labAssistants");
        console.log(`Lab Assistant ${id} joined labAssistants room`);
      } else if (role === "pharmacist") {
        socket.join("pharmacists");
        console.log(`Pharmacist ${id} joined pharmacists room`);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
