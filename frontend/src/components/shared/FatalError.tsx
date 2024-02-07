import React, { useEffect, useState } from "react";

const headlines = [
    "Uh-oh",
    "Oh no",
    "Oh dear",
    "Aw, snap",
    "That's not good",
]

const FatalError = () => {
    const [headline, setHeadline] = useState<string>("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * headlines.length)
        setHeadline(headlines[randomIndex])
    }, [])

    return (
        <>
            <div className="error-container">
                <h2>{headline}</h2>
                <p>We're sorry, but an unexpected error ocurred. Please check your file and try again.</p>
                <p>Need help? Reach out in the {process.env.REACT_APP_APP_NAME} group.</p>
            </div>
        </>
    )
}

export default FatalError;