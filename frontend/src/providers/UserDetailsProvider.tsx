import React, { useState } from "react";
import { User } from "../models/User";

export const UserContext = React.createContext({
    user: {},
    setCurrentUser: (user: User) => {}
})


interface UserDetailsProviderProps {
    children?: React.ReactNode
}

const defaultUser: User = {
    name: '',
    email: '',
}

export const UserDetailsProvider = (props: UserDetailsProviderProps) => {
    const setCurrentUser = (user: User) => {
        setState({...state, user: user})
    }

    const initialState = {
        user: defaultUser,
        setCurrentUser: setCurrentUser
    }

    const [state, setState] = useState(initialState)

    return (
        <UserContext.Provider value={state}>
            {props.children}
        </UserContext.Provider>
    )
}