import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../../App";

export const NotAdmin = (props: {children: React.ReactNode}) => {
    const user = useAtomValue(userAtom)

    return (
        <>
            {user.isAdmin ? null : props.children}
        </>
    )
}