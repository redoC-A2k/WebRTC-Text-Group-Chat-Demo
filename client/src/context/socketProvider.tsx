import React, { createContext, useContext, useMemo, useState } from 'react'

const SocketContext = createContext<WebSocket | null>(null);


export const useSocket = () => { return useContext(SocketContext) }


export const SocketProvider = (props: any) => {
    // console.log("Rendering ...")
    let url = process.env.REACT_APP_BACKEND?.replace('http', 'ws')
    let [socket, setSocket] = useState<WebSocket>(useMemo(() => new WebSocket(url as string), []))
    function getSocket() {
        console.log("Creating new socket")
        return new WebSocket(url as string)
    }

    function checkStatus() {
        if (socket.readyState === WebSocket.CONNECTING) {
            console.log("Still connecting ...")
            setTimeout(() => checkStatus(), 2000)
        } else if (socket.readyState === WebSocket.CLOSED) {
            setTimeout(() => reConnect(), 2000)
        }
    }

    function reConnect() {
        console.log("Reconnecting ...")
        if (socket.readyState === WebSocket.CLOSED)
            setSocket(getSocket())
    }

    socket.onopen = () => {
        console.log("Socket is opened")
    }

    socket.onclose = () => {
        console.log("Socket is closed")
        checkStatus()
    }

    socket.onerror = (err) => {
        console.log("Error while opening the socket", err)
    }

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}