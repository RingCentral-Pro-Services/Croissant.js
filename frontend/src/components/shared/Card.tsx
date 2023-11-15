import { Button, Card, Text } from "@mantine/core";
import React from "react";

const CustomCard = (props: {title: string, body: string, buttonText: string, id?: string, onClick?: (id: string) => void}) => {

    const handleClick = () => {
        if (!props.id || !props.onClick) return
        props.onClick(props.id)
    }

    return (
        <div className="card inline healthy-margin-right healthy-margin-left">
           <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mt="md">{props.title}</Text>
                <Text mt="xs" c="dimmed" size="sm">{props.body}</Text>
                <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={handleClick}>{props.buttonText}</Button>
           </Card>
        </div>
    )
}

export default CustomCard