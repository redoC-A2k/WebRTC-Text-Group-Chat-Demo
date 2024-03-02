import constants from "./constants";
const RTCPeerConnection = require('wrtc').RTCPeerConnection
import { WebSocket } from "ws"

export type RoomPeerMapType = { [room: string]: { [name: string]: RTCPeer } };

export class RTCPeer {
    peer: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    makingOffer: boolean = false;
    socket: WebSocket;
    static roomPeerMap: RoomPeerMapType = {}
    // static roomSocketMap: RoomSocketMapType = {}
    name: string = ""
    room: string = ""

    constructor(room: string, name: string, socket: WebSocket) {
        console.log("RTCPeer constructor")
        this.room = room;
        this.name = name;
        this.socket = socket;
        if (RTCPeer.roomPeerMap.hasOwnProperty(room))
            RTCPeer.roomPeerMap[room][name] = this;
        else RTCPeer.roomPeerMap[room] = {};
        RTCPeer.roomPeerMap[room][name] = this;
        if (process.env.NODE_ENV != 'dev')
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [`stun:stun.${process.env.ICE_HOST}:80`,
                            "stun:stun.l.google.com:19302",]
                    },
                    {
                        urls: `turn:global.${process.env.ICE_HOST}:80`,
                        username: process.env.ICE_USERNAME,
                        credential: process.env.ICE_CREDENTIAL,
                    },
                    {
                        urls: `turn:global.${process.env.ICE_HOST}:80?transport=tcp`,
                        username: process.env.ICE_USERNAME,
                        credential: process.env.ICE_CREDENTIAL,
                    },
                    {
                        urls: `turn:global.${process.env.ICE_HOST}:443`,
                        username: process.env.ICE_USERNAME,
                        credential: process.env.ICE_CREDENTIAL
                    },
                    {
                        urls: `turns:global.${process.env.ICE_HOST}:443?transport=tcp`,
                        username: process.env.ICE_USERNAME,
                        credential: process.env.ICE_CREDENTIAL
                    },
                ]
            })
        else this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: ["stun:stun.l.google.com:19302"]
            }]
        })
        this.peer.onnegotiationneeded = this.negotiationneeded
        this.peer.onicecandidate = this.onIceCandidate
        this.dataChannel = this.peer.createDataChannel("chat", { negotiated: true, id: 0 });
        this.dataChannel.onmessage = this.handleMessage;
        // this.negotiationneeded()
    }

    negotiationneeded = async () => {
        try {
            this.makingOffer = true;
            console.log("Negotiation needed and signalling state : ", this.peer.signalingState)
            if (this.peer.signalingState === "stable" || this.peer.signalingState === 'have-remote-pranswer') {
                let offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(offer);
                this.socket?.send(JSON.stringify({ type: constants.OFFER, payload: this.peer?.localDescription }));
            } else if (this.peer.signalingState === "have-remote-offer") {
                let answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);
                this.socket?.send(JSON.stringify({ type: constants.ANSWER, payload: this.peer?.localDescription }));
            } else {
                throw new Error("Invalid signaling state for creating offer")
            }
        } catch (err) {
            console.error(err);
        } finally {
            this.makingOffer = false;
        }
    };

    onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
        this.socket?.send(JSON.stringify({ type: constants.ICE_EVENT, payload: event.candidate }));
    }

    handleMessage = (event: MessageEvent) => {
        // TODO: Forward to all other webrtc clients in room
        for (const name in RTCPeer.roomPeerMap[this.room]) {
            if (name !== this.name) {
                RTCPeer.roomPeerMap[this.room][name].dataChannel
                    .send(JSON.stringify({
                        from: this.name,
                        message: event.data
                    }))
            } else {
                this.dataChannel
                    .send(JSON.stringify({
                        from: "You",
                        message: event.data
                    }))
            }
        }
    }

    static getRTCPeer = (room: string, name: string) => {
        return this.roomPeerMap[room][name]
    }
}