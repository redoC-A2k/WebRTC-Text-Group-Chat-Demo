import { WebSocket } from "ws"


export type RoomJoinRequest = {
    name: string;
    room: string;
}

export type AnswerRequest = {
    name: string;
    room: string;
    answer: RTCSessionDescription;
}

export type ICERequest = {
    name: string;
    room: string;
    candidate: RTCIceCandidate;
}

export type RoomSocketMapType = {
    [room: string]: {
        [name: string]: WebSocket
    }
};

export type SocketMessage = {
    type: string;
    payload: RoomJoinRequest | AnswerRequest | ICERequest;
}