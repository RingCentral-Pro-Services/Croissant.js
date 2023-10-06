import { Loader } from "@mantine/core";
import React from "react";

const LoadingIndicator = (props: {label: string}) => {
    return (
        <div className="healthy-margin-left inline">
            <Loader className="vertical-middle healthy-margin-right" color="blue" />
            <p className="inline">{props.label}</p>
        </div>
    )
}

export default LoadingIndicator