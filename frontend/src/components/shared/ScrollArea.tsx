import React from "react";

const ScrollArea = (props: {direction: 'vertical' | 'horizontal',children: React.ReactNode}) => {
    return (
        <div className={`${props.direction === 'vertical' ? 'scroll-vertical' : 'scroll-horizontal'}`}>
            {props.children}
        </div>
    )
}

export default ScrollArea