"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCPeer = void 0;
const constants_1 = __importDefault(require("./constants"));
const RTCPeerConnection = require('wrtc').RTCPeerConnection;
;
class RTCPeer {
    constructor(room, name, socket) {
        this.makingOffer = false;
        // static roomSocketMap: RoomSocketMapType = {}
        this.name = "";
        this.room = "";
        this.negotiationneeded = async () => {
            try {
                this.makingOffer = true;
                console.log("Negotiation needed and signalling state : ", this.peer.signalingState);
                if (this.peer.signalingState === "stable" || this.peer.signalingState === 'have-remote-pranswer') {
                    let offer = await this.peer.createOffer();
                    await this.peer.setLocalDescription(offer);
                    if (this.peer.localDescription !== undefined)
                        console.log("Peer local description set successfully");
                    this.socket?.send(JSON.stringify({ type: constants_1.default.OFFER, payload: this.peer?.localDescription }));
                }
                else if (this.peer.signalingState === "have-remote-offer") {
                    let answer = await this.peer.createAnswer();
                    await this.peer.setLocalDescription(answer);
                    this.socket?.send(JSON.stringify({ type: constants_1.default.ANSWER, payload: this.peer?.localDescription }));
                }
                else {
                    throw new Error("Invalid signaling state for creating offer");
                }
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this.makingOffer = false;
            }
        };
        this.onIceCandidate = (event) => {
            // console.log(event.candidate)
            this.socket?.send(JSON.stringify({ type: constants_1.default.ICE_EVENT, payload: event.candidate }));
        };
        this.handleMessage = (event) => {
            // TODO: Forward to all other webrtc clients in room
            for (const name in _a.roomPeerMap[this.room]) {
                if (name !== this.name) {
                    _a.roomPeerMap[this.room][name].dataChannel
                        .send(JSON.stringify({
                        from: this.name,
                        message: event.data
                    }));
                }
                else {
                    this.dataChannel
                        .send(JSON.stringify({
                        from: "You",
                        message: event.data
                    }));
                }
            }
        };
        console.log("RTCPeer constructor");
        this.room = room;
        this.name = name;
        this.socket = socket;
        if (_a.roomPeerMap.hasOwnProperty(room))
            _a.roomPeerMap[room][name] = this;
        else
            _a.roomPeerMap[room] = {};
        _a.roomPeerMap[room][name] = this;
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [`stun:stun.${process.env.ICE_HOST}:80`,]
                    // "stun:stun.l.google.com:19302",
                    // "stun:global.stun.twilio.com:3478"]
                },
                // {
                //     urls: `turn:global.${process.env.ICE_HOST}:80`,
                //     username: process.env.ICE_USERNAME,
                //     credential: process.env.ICE_CREDENTIAL,
                // },
                // {
                //     urls: `turn:global.${process.env.ICE_HOST}:80?transport=tcp`,
                //     username: process.env.ICE_USERNAME,
                //     credential: process.env.ICE_CREDENTIAL,
                // },
                // {
                //     urls: `turn:global.${process.env.ICE_HOST}:443`,
                //     username: process.env.ICE_USERNAME,
                //     credential: process.env.ICE_CREDENTIAL
                // },
                // {
                //     urls: `turns:global.${process.env.ICE_HOST}:443?transport=tcp`,
                //     username: process.env.ICE_USERNAME,
                //     credential: process.env.ICE_CREDENTIAL
                // },
            ]
        });
        this.peer.onnegotiationneeded = this.negotiationneeded;
        this.peer.onicecandidate = this.onIceCandidate;
        this.dataChannel = this.peer.createDataChannel("chat", { negotiated: true, id: 0 });
        this.dataChannel.onmessage = this.handleMessage;
        // this.negotiationneeded()
    }
}
exports.RTCPeer = RTCPeer;
_a = RTCPeer;
RTCPeer.roomPeerMap = {};
RTCPeer.getRTCPeer = (room, name) => {
    return _a.roomPeerMap[room][name];
};
//# sourceMappingURL=RTCPeer.js.map