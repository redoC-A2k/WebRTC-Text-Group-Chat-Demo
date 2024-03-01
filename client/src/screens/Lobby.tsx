import { useEffect, useRef, useState } from "react"
import { useSocket } from "../context/socketProvider"
import { useNavigate } from 'react-router-dom'
import constants from "../utils/constants"
import { useUserProfileContext } from "../context/userProfileProvider"

export default function LobbyScreen() {
    let formData = {
        name: "",
        room: ""
    }

    const { setUserProfile } = useUserProfileContext()

    function setFormData(data: any) {
        formData = data
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    const navigate = useNavigate()

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(formData)
        setUserProfile(formData)
        navigate(`/room/${formData.room}`)
    }

    return (
        <section className="mt-5 mx-5" id="lobby">
            <div className="container">
                <div className="row">
                    <div className="col">
                        <h1>Welcome to Group Chat</h1>
                        <form className="myform" onSubmit={handleSubmit}>
                            <div className="form-group mt-1">
                                <label htmlFor="name">Name :</label>
                                <input className="form-control mt-2" type="name" id="name" name="name" defaultValue={""} onChange={handleChange} required />
                            </div>
                            <div className="form-group mt-4">
                                <label htmlFor="room">Room :</label>
                                <input className="form-control mt-2" type="number" id="room" name="room" defaultValue={""} onChange={handleChange} required />
                            </div>
                            <div className="mt-5">
                                <button>Join</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </section>
    )
}