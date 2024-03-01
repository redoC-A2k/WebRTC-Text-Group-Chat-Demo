import { createContext, useContext, useState } from "react";

const UserProfileContext = createContext({userProfile: {name: '', room: ''}, setUserProfile: (data: any) => {}});

export const useUserProfileContext = () => { return useContext(UserProfileContext) }

export const UserProfileProvider = (props: any) => {
    const [userProfile, setUserProfile] = useState({ name: '', room: '' });
    return (
        <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
            {props.children}
        </UserProfileContext.Provider>
    );
}