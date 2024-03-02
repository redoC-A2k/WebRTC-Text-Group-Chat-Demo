import constants from "./constants";
import { userProfileType } from "./types";

class RTCService {
    peer: RTCPeerConnection | null = null;
    dataChannel;
    socket: WebSocket | null = null;
    userProfile: userProfileType | null = null;

    // constructor(socket,userProfile) {
    constructor(socket: WebSocket | null, userProfile: userProfileType) {
        console.log("RTCPeerService constructor")
        if (this.peer == null) {
            if (process.env.NODE_ENV !== "development")
                this.peer = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [`stun:stun.${process.env.REACT_APP_ICE_HOST}:80`,
                                "stun:stun.l.google.com:19302"]
                        },
                        // {
                        //     urls: `turn:global.${process.env.REACT_APP_ICE_HOST}:80`,
                        //     username: process.env.REACT_APP_ICE_USERNAME,
                        //     credential: process.env.REACT_APP_ICE_CREDENTIAL,
                        // },
                        // {
                        //     urls: `turn:global.${process.env.REACT_APP_ICE_HOST}:80?transport=tcp`,
                        //     username: process.env.REACT_APP_ICE_USERNAME,
                        //     credential: process.env.REACT_APP_ICE_CREDENTIAL,
                        // },
                        // {
                        //     urls: `turn:global.${process.env.REACT_APP_ICE_HOST}:443`,
                        //     username: process.env.REACT_APP_ICE_USERNAME,
                        //     credential: process.env.REACT_APP_ICE_CREDENTIAL
                        // },
                        // {
                        //     urls: `turns:global.${process.env.REACT_APP_ICE_HOST}:443?transport=tcp`,
                        //     username: process.env.REACT_APP_ICE_USERNAME,
                        //     credential: process.env.REACT_APP_ICE_CREDENTIAL
                        // },
                    ]
                })
            else
                this.peer = new RTCPeerConnection({
                    iceServers: [{
                        urls: ["stun:stun.l.google.com:19302"]
                    }]
                })
            console.log("Signalling state : ", this.peer.signalingState)
            this.peer.onicecandidate = this.onIceCandidate
            this.dataChannel = this.peer.createDataChannel("chat", { negotiated: true, id: 0 });
            this.socket = socket
            this.userProfile = userProfile
            // if(!this.userProfile.name && !this.userProfile.room)
        }
    }

    getState = () => {
        console.log("Connection state : ", this.peer?.connectionState);
        console.log("Signaling state : ", this.peer?.signalingState);
        console.log("Ice connection state : ", this.peer?.iceConnectionState);
    }

    onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
        this.socket?.send(JSON.stringify({
            type: constants.ICE_EVENT,
            payload: {
                candidate: event.candidate,
                room: this.userProfile?.room,
                name: this.userProfile?.name
            }
        }))
    }

    handleOffer = async (offer: RTCSessionDescriptionInit) => {
        await this.peer?.setRemoteDescription(offer)
        await this.peer?.createAnswer()
        await this.peer?.setLocalDescription()
        return this.peer?.localDescription
    }
}

export default RTCService;