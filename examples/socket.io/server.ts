import { Server } from "npm:socket.io"
import { compileAPI, type Requester } from "https://deno.land/x/quickapi/mod.ts";
import API from "./api.ts"

const api = compileAPI(API);
const io = new Server(3000);

io.on("connection", (socket) => {
    socket.on("api", async (endpoint, response, args) => {
        try {
            const requester: Requester = { uid: crypto.randomUUID() };
            const result = await api.call(endpoint, requester, ...args);
            socket.emit(`${response}@success`, result);
        } catch (e) {
            socket.emit(`${response}@error`, e);
        }
    })
})