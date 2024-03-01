import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketProvider';
import { useUserProfileContext } from '../context/userProfileProvider';
import { useNavigate } from 'react-router-dom';
import constants from '../utils/constants';
import RTCPeer from '../utils/RTCService';


const Room = () => {
    const socket = useSocket()
    const { userProfile, setUserProfile } = useUserProfileContext()
    const navigate = useNavigate()

    interface Message {
        from: string,
        message: string
    }

    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        if (socket !== null)
            socket.onmessage = async (event) => {
                // console.log(event.data)
                let obj = JSON.parse(event.data)
                if (obj.type)
                    switch (obj.type) {
                        case constants.ROOM_JOIN:
                            console.log("Room Join request received", obj.payload)
                            navigate(`/room/${obj.payload.room}`)
                            break;
                        case constants.OFFER:
                            let answer = await RTCPeer.handleOffer(obj.payload)
                            socket.send(JSON.stringify({
                                type: constants.ANSWER,
                                payload: {
                                    answer,
                                    room: userProfile.room,
                                    name: userProfile.name
                                }
                            }))
                            break;
                        case constants.CONNECTED:
                            console.log("Connected client and server")
                            break;
                        case "error":
                            console.log("Error message :", obj.payload)
                            break;
                        default:
                            console.log("Default message :", obj)
                            break;
                    }
                else console.log(obj)
            }
    }, [socket])

    useEffect(() => {
        if (!userProfile.room || !userProfile.name) {
            navigate('/')
        } else {
            if (socket !== null) {
                socket?.send(JSON.stringify({
                    type: constants.ROOM_JOIN,
                    payload: {
                        name: userProfile.name,
                        room: userProfile.room
                    }
                }))
            }
        }
    }, [userProfile])

    let handleMessage = useCallback((event: any) => {
        console.log("Message received : ", messages, event.data)
        setMessages([...messages, JSON.parse(event.data)])
    }, [messages])

    useEffect(() => {
        if (RTCPeer.dataChannel)
            RTCPeer.dataChannel.onmessage = handleMessage
        RTCPeer.setSocket(socket);
    }, [RTCPeer, handleMessage])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        let msg = (event.target as HTMLFormElement).msginput.value
        console.log("Send :", msg, RTCPeer.dataChannel?.readyState, RTCPeer.peer?.signalingState)
        if (RTCPeer && RTCPeer.dataChannel?.readyState === 'open')
            RTCPeer.dataChannel.send(msg)
        else console.log("Data channel not open", RTCPeer.peer?.signalingState, RTCPeer.dataChannel?.readyState)
    }

    return (
        <section className="mt-5 mx-5" id="room">
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Room : {userProfile.room} </h1>
                        <div className='msgs mt-3'>
                            {/* <h3>Messages in this room : </h3> */}
                            <div className='msgbox'>
                                {messages.length > 0
                                    ?
                                    (<ul className='list-group'>
                                        {messages.map((msg: Message, ind) =>
                                            <li className='list-group-item' key={ind}><span className='badge bg-light text-dark'>{msg.from}</span> : <span>{msg.message}</span></li>
                                        )}
                                    </ul>)
                                    :
                                    (<h4>No messages after your joining</h4>)}
                            </div>
                        </div>
                        <div className="input mt-5">
                            <form className='myform' onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="msginput">Enter message : </label>
                                    <input className='form-control w-75 mt-2' placeholder='Enter something' name='msginput' id="msginput" type="text" />
                                    <button className='mt-4'>Send</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Room;