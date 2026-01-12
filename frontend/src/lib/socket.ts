import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token?: string): Socket => {
    // If token changed or no socket exists, create new socket
    if (!socket || (token && token !== currentToken)) {
        // Disconnect old socket if exists
        if (socket) {
            socket.disconnect();
        }

        currentToken = token || null;

        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                token: currentToken,
            },
        });
    }
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentToken = null;
    }
};

export default getSocket;
