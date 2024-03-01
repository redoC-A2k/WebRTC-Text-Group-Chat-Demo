import constants from "./constants"
import { WebSocket } from "ws"
import { RoomJoinRequest } from './types'
import { RTCPeer, RoomPeerMapType } from "./RTCPeer"

export interface RoomSocketMapType { [room: string]: { [name: string]: WebSocket } };

const roomSocketMap: RoomSocketMapType = {}


export const handleMessages = async (message: String, isBinary: boolean, socket: WebSocket) => {
    message = message.toString()
    let obj = JSON.parse(message as string)
    switch (obj.type) {
        case constants.ROOM_JOIN: {
            let joinReq: RoomJoinRequest = obj.payload
            if (roomSocketMap.hasOwnProperty(joinReq.room)) {
                roomSocketMap[joinReq.room][joinReq.name] = socket
            }
            else {
                roomSocketMap[joinReq.room] = { [joinReq.name]: socket }
            }
            new RTCPeer(joinReq.room, joinReq.name, socket)
            console.log("Room Join request received")
            break;
        }
        case constants.ANSWER: {
            // let rtcPeer = roomPeerMap[obj.payload.room][obj.payload.name]
            let rtcPeer = RTCPeer.getRTCPeer(obj.payload.room, obj.payload.name)
            // console.log("RTC Peer",rtcPeer)
            await rtcPeer.peer?.setRemoteDescription(obj.payload.answer)
            socket.send(JSON.stringify({ type: constants.CONNECTED }))
            if (rtcPeer.dataChannel.readyState !== 'open')
                console.log("Data channel not open", rtcPeer.peer.signalingState, rtcPeer.dataChannel.readyState)
            break;
        }
        default:
            console.log("Default message :")
    }
}