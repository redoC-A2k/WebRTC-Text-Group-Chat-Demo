class RTCService {
    peer: RTCPeerConnection | null = null;
    dataChannel: RTCDataChannel | null = null;
    socket: WebSocket | null = null;

    constructor() {
        console.log("RTCPeerService constructor")
        if (this.peer == null) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [`stun:stun.${process.env.REACT_APP_ICE_HOST}:80`,
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478"]
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
            this.peer.onicecandidate = this.onIceCandidate
            this.dataChannel = this.peer.createDataChannel("chat", { negotiated: true, id: 0 });
        }
    }

    getState() {
        console.log("Connection state : ", this.peer?.connectionState);
        console.log("Signaling state : ", this.peer?.signalingState);
        console.log("Ice connection state : ", this.peer?.iceConnectionState);
    }

    onIceCandidate(event: RTCPeerConnectionIceEvent) {
        console.log("onIceCandidate")
        //TODO: send to server
    }

    handleOffer = async (offer: RTCSessionDescriptionInit) => {
        await this.peer?.setRemoteDescription(offer)
        await this.peer?.createAnswer()
        await this.peer?.setLocalDescription()
        return this.peer?.localDescription
    }

    setSocket(socket: WebSocket | null) {
        this.socket = socket;
    }
}

export default new RTCService();