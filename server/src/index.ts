import express from 'express'
import { WebSocket } from 'ws'
import dotenv from 'dotenv'
import { handleMessages } from './socketController.js'
import fs from 'fs'
import https from 'https'

dotenv.config()

const app = express()

let server = app.listen(process.env.PORT, () => {
    console.log("Server is running on PORT " + process.env.PORT)
})

const wsServer = new WebSocket.Server({ noServer: true })

server.on('upgrade', (request, socket, head) => {
    console.log("upgrade request received")
    wsServer.handleUpgrade(request, socket, head, (webSocket) => {
        webSocket.send(JSON.stringify("Hello Client , Happy upgradding to WebSockets!"))
        wsServer.emit('connection', webSocket, request)
    })
})

wsServer.on('connection', (socket: WebSocket, request) => {
    socket.on('message', (message: String, isBinary: boolean) => {
        handleMessages(message, isBinary, socket)
    })
    socket.on('close', () => {
        console.log("Socket is closed")
    })
    socket.on('error', (err) => {
        console.log("Error while opening the socket", err)
    })
})
