import { Button, Card, Text } from "@mantine/core";
import React from "react";

export const UsageCard = (props: {title: string, body: string}) => {
    return (
        <div className="card inline healthy-margin-right healthy-margin-left">
           <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mt="md">{props.title}</Text>
                <Text mt="xs" c="dimmed" size="sm">{props.body}</Text>
           </Card>
        </div>
    )
}