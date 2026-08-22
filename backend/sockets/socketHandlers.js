export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinOrganization", (organizationId) => {
      if (!organizationId) return;
      socket.join(organizationId.toString());
      console.log(`Socket ${socket.id} joined org room ${organizationId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
