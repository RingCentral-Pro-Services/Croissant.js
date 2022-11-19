import { useEffect, useState } from "react";
import { AudioPrompt } from "../models/AudioPrompt";
import { IVRMenu } from "../models/IVRMenu";
import RCExtension from "../models/RCExtension";

const useBeautifyIVRs = (isIVRsListPending: boolean, ivrsList: IVRMenu[], extensionList: RCExtension[], audioPromptList: AudioPrompt[]) => {
    const [prettyIVRs, setPrettyIVRs] = useState<IVRMenu[]>([])
    const [isIVRBeautificationPending, setIsIVRBeautificationPending] = useState(true)

    useEffect(() => {
        if (isIVRsListPending) return

        let ivrs: IVRMenu[] = []
        for (const ivr of ivrsList) {
            for (let action of ivr.data.actions) {
                if (action.extension?.id) {
                    action.extension.id = `${extensionNumberForID(action.extension.id)}`
                }
            }

            if (ivr.data.prompt.mode === 'Audio') {
                ivr.audioPromptFilename = promptNameForID(ivr.data.prompt.audio?.id ?? '')
            }

            ivrs.push(ivr)
        }

        setPrettyIVRs(ivrs)
        setIsIVRBeautificationPending(false)
    }, [isIVRsListPending, extensionList, ivrsList])

    const extensionNumberForID = (id: string) => {
        for (const extension of extensionList) {
            if (extension.id == parseInt(id)) {
                return extension.extensionNumber
            }
        }
        return 0
    }

    const promptNameForID = (id: string) => {
        for (const prompt of audioPromptList) {
            if (prompt.id === id) {
                return prompt.filename
            }
        }
        return ''
    }

    return {prettyIVRs, isIVRBeautificationPending}
}

export default useBeautifyIVRs