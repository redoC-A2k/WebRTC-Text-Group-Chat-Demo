"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessages = void 0;
const constants_1 = __importDefault(require("./constants"));
const RTCPeer_1 = require("./RTCPeer");
;
const roomSocketMap = {};
const handleMessages = async (message, isBinary, socket) => {
    message = message.toString();
    let obj = JSON.parse(message);
    switch (obj.type) {
        case constants_1.default.ROOM_JOIN: {
            let joinReq = obj.payload;
            if (roomSocketMap.hasOwnProperty(joinReq.room)) {
                roomSocketMap[joinReq.room][joinReq.name] = socket;
            }
            else {
                roomSocketMap[joinReq.room] = { [joinReq.name]: socket };
            }
            new RTCPeer_1.RTCPeer(joinReq.room, joinReq.name, socket);
            console.log("Room Join request received");
            break;
        }
        case constants_1.default.ANSWER: {
            // let rtcPeer = roomPeerMap[obj.payload.room][obj.payload.name]
            let rtcPeer = RTCPeer_1.RTCPeer.getRTCPeer(obj.payload.room, obj.payload.name);
            // console.log("RTC Peer",rtcPeer)
            await rtcPeer.peer?.setRemoteDescription(obj.payload.answer);
            socket.send(JSON.stringify({ type: constants_1.default.CONNECTED }));
            if (rtcPeer.dataChannel.readyState !== 'open')
                console.log("Data channel not open", rtcPeer.peer.signalingState, rtcPeer.dataChannel.readyState);
            break;
        }
        default:
            console.log("Default message :");
    }
};
exports.handleMessages = handleMessages;
//# sourceMappingURL=socketController.js.map