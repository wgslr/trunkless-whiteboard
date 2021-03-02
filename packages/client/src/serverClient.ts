import type * as WebSocket from 'ws';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Message, MessageCode, decodeMessage } from '../src/types';

declare interface ServerConnectionEvents {
    disconnect: () => void;
    message: (decoded: Message) => void;
}

export class ServerConnection extends TypedEmitter<ServerConnectionEvents> {
    socket: WebSocket;
    constructor(socket: WebSocket) {
        super();
        this.socket = socket;
        this.setupSocketListener();
        this.on('message', msg => this.dispatch(msg));
    }

    private setupSocketListener() {
        this.socket.on('message', message => {
            console.log(`Server connection receieved a message: '${message}'`);
            const decoded = decodeMessage(message as string);
            this.emit;
        });
        this.socket.on('close', () => {
            console.log('Server connection closed');
            this.emit('disconnect');
        });
    }

    private dispatch(message: Message) {
        if (message.code === MessageCode.CREATE_WHITEBOARD) {
            // addWhiteboard(this);
            return;
        }
    }
}


