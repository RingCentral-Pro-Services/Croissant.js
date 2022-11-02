import React, { useEffect, useState } from "react";
import AmazonPollyPrompt from "../models/AmazonPollyPrompt";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import {
    fromCognitoIdentityPool,
} from "@aws-sdk/credential-provider-cognito-identity";
import { Polly } from "@aws-sdk/client-polly";
import { getSynthesizeSpeechUrl } from "@aws-sdk/polly-request-presigner";

const useGenerateAudioPrompts = (rawPrompts: AmazonPollyPrompt[], isAudioPromptReadPending: boolean) => {
    const [prompts, setPrompts] = useState<AmazonPollyPrompt[]>([])
    const [isPromptGenerationPending, setIsPending] = useState(true)

    // Create the Polly service client, assigning your credentials
    const client = new Polly({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: fromCognitoIdentityPool({
            client: new CognitoIdentityClient({ region: process.env.REACT_APP_AWS_REGION}),
            identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID! // IDENTITY_POOL_ID
        }),
    });

    useEffect(() => {
        if (isAudioPromptReadPending) return

        const doStuff = async () => {
            let newPrompts: AmazonPollyPrompt[] = []
            for (let index = 0; index < rawPrompts.length; index++) {
                let audio = await generatePrompt(rawPrompts[index].text)
                if (audio) {
                    let prompt = rawPrompts[index]
                    prompt.data = audio
                    newPrompts.push(prompt)
                }
            }
            setPrompts(newPrompts)
            setIsPending(false)
        }
        doStuff()

    }, [isAudioPromptReadPending, rawPrompts])

    const generatePrompt = async (text: string) => {
        const speechParams = {
            OutputFormat: "mp3", // For example, 'mp3'
            SampleRate: "16000", // For example, '16000
            Text: text, // The 'speakText' function supplies this value
            TextType: "text", // For example, "text"
            VoiceId: "Matthew" // For example, Matthew. Kendra aounds AMAZING, Joey is okay
        }

        try{
            let url = await getSynthesizeSpeechUrl({
                client, params: speechParams
            });
            
            let response = await fetch(`${url}`)
            let data = await response.blob()
            return data
        } catch (err) {
            console.log("Error", err);
        }
    }

    return {prompts, isPromptGenerationPending}
}

export default useGenerateAudioPrompts