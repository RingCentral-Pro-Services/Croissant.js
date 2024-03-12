import { useAtomValue } from "jotai";
import React from "react";
import { userAtom } from "../../App";

export const Admin = (props: {children: React.ReactNode}) => {
    const user = useAtomValue(userAtom)

    return (
        <>
            {user.isAdmin ? props.children : null}
        </>
    )
}