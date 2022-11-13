import React from "react";

const FeedbackTab = (props: {title: string, children: React.ReactNode, showBadge: boolean}) => {
    const {title, children} = props
    return (
        <>
            {children}
        </>
    )
}

FeedbackTab.defaultProps = {
    showBadge: false
}

export default FeedbackTab
