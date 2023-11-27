import React, { useEffect } from "react";

export const AccessDenied = () => {
    
    const loginUrl = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=create-ivr`

    useEffect(() => {
        const content = document.querySelector('.navigation-bar')
        content?.classList.add('hidden')
    }, [])

    return (
        <div className="access-denied">
            <h1>Access Denied</h1>
            <p>
                You do not have permission to access this page. Please contact your
                administrator if you believe this is in error.
            </p>
            <a href={loginUrl}>Login again?</a>
        </div>
    );
};