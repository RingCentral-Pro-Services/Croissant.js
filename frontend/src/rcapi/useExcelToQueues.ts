import { useState } from "react"
import CallQueue from "../models/CallQueue"
import RCExtension from "../models/RCExtension"
import ExtensionContact from "../models/ExtensionContact"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"
import ExtensionIsolator from "../helpers/ExtensionIsolator"
import { CallHandlingRules } from "../models/CallHandlingRules"
import {CallQueueKeys} from '../helpers/Keys'
import { Greeting, Presets, HoldPresets } from "../models/Greetings"

const useExcelToQueues = (postMessage: (message: Message) => void, postError: (error: SyncError) => void) => {
    const [queues, setQueues] = useState<CallQueue[]>([])
    const [isQueueConvertPending, setIsQueueConvertPending] = useState(true)

    const convert = (data: any[], extensionsList: RCExtension[]) => {
        let records: CallQueue[] = []

        for (let index = 0; index < data.length; index++) {
            const currentItem = data[index]
            let contact: ExtensionContact = {
                firstName: currentItem['Queue Name'],
                lastName: "",
                email: currentItem['Email']
            }
            let extension = new RCExtension(idForQueue(currentItem['Extension'], extensionsList), currentItem['Extension'], currentItem['Queue Name'], contact, currentItem['Site'], 'Department', '', false, '')
            let memberString: string = currentItem['Members (Ext)']
            let membersExtensions = memberString.split(',')
            membersExtensions = isolateExtensions(membersExtensions)
            let members: string[] = []
            let removedExtensions: string[] = []

            membersExtensions.map((extension) => {
                if (!isValidQueueMember(extension.trim(), extensionsList)) {
                    removedExtensions.push(extension)
                }
            })

            membersExtensions = membersExtensions.filter((extension) => {
                return isValidQueueMember(extension.trim(), extensionsList)
            })


            for (let memberIndex = 0; memberIndex < membersExtensions.length; memberIndex++) {
                members.push(`${idForExtension(membersExtensions[memberIndex].trim(), extensionsList)}`)
            }

            let validMembers = members.filter((id) => {
                return id !== '0'
            })

            if (removedExtensions.length > 0) {
                postMessage(new Message(`The following members were removed from ${contact.firstName} - Ext ${extension.extensionNumber} because they either don't exist or they are not valid queue members: ${removedExtensions.join(', ')}`, 'warning'))
                postError(new SyncError(contact.firstName, extension.extensionNumber, ['Invalid queue members', removedExtensions.join(', ')]))
            }

            let queue = new CallQueue(extension, idForSite(extension.site, extensionsList), validMembers, getCallHandling(data[index], extensionsList), getGreetings(data[index]), getTransferExtension(data[index], extensionsList), getTransferPhoneNumber(data[index], extensionsList), getMaxWaitDestination(data[index], extensionsList), getMaxCallersDestination(data[index], extensionsList))

            if (queue.siteID === 0) {
                postMessage(new Message(`${contact.firstName} - Ext ${extension.extensionNumber} cannot be built because the site it's assigned to (${extension.site}) does not exist`, 'error'))
                postError(new SyncError(contact.firstName, extension.extensionNumber, ['Invalid site', extension.site]))
            }
            else {
                records.push(queue)
            }
        }
        setQueues(records)
        setIsQueueConvertPending(false)
    }

    const getCallHandling = (data: any, extensionList: RCExtension[]) => {
        let settings: CallHandlingRules = {
            transferMode: "Rotating",
            noAnswerAction: "WaitPrimaryMembers",
            holdAudioInterruptionMode: "Never",
            holdTimeExpirationAction: "Voicemail",
            maxCallersAction: "Voicemail",
            holdTime: 180,
            agentTimeout: 20,
            wrapUpTime: 15
        }

        if (CallQueueKeys.ringType in data) {
            settings.transferMode = translatedRingType(data[CallQueueKeys.ringType])
        }
        if (settings.transferMode != 'Simultaneous' && CallQueueKeys.userRingTime in data) {
            const timeString = data[CallQueueKeys.userRingTime].toString().replace(/\D/g, '')
            let time = parseInt(timeString)

            if (time < 10) time = time * 60
            settings.agentTimeout = time
        }
        if (CallQueueKeys.totalRingTime in data) {
            if (data[CallQueueKeys.totalRingTime] === '10 min' || data[CallQueueKeys.totalRingTime] === '15 min') {
                const timeString = data[CallQueueKeys.totalRingTime].toString().replace(/\D/g, '')
                let time = parseInt(timeString) * 60
                settings.holdTime = time
            }
            else if (data[CallQueueKeys.totalRingTime] === "Don't Wait" || data[CallQueueKeys.totalRingTime] === '1 secs') {
                settings.holdTime = 1
            }
            else {
                const timeString = data[CallQueueKeys.totalRingTime].toString().replace(/\D/g, '')
                let time = parseInt(timeString)
    
                if (time < 10) time = time * 60
                settings.holdTime = time
            }
        }
        if (CallQueueKeys.wrapUpTime in data) {
            const timeString = data[CallQueueKeys.wrapUpTime].toString().replace(/\D/g, '')
            let time = parseInt(timeString)

            if (time < 10) time = time * 60
            settings.wrapUpTime = time
        }
        if (CallQueueKeys.interruptAudio in data) {
            const value = data[CallQueueKeys.interruptAudio].toString()
            if (value.toLowerCase() === 'never') {
                settings.holdAudioInterruptionMode = 'Never'
            }
            else if (value.toLowerCase() === 'only when music ends') {
                settings.holdAudioInterruptionMode = 'WhenMusicEnds'
            }
            else {
                settings.holdAudioInterruptionMode = 'Periodically'
                const timeString = data[CallQueueKeys.interruptAudio].toString().replace(/\D/g, '')
                let time = parseInt(timeString)
                
                if (time < 10) time = time * 60
                settings.holdAudioInterruptionPeriod = time
            }
        }
        if (CallQueueKeys.maxWaitTimeAction in data) {
            const action = data[CallQueueKeys.maxWaitTimeAction]

            if (action === 'Transfer to Extension') {
                settings.holdTimeExpirationAction = 'TransferToExtension'
            }
            else if (action === 'Forward to External') {
                settings.holdTimeExpirationAction = 'UnconditionalForwarding'
            }
        }
        if (CallQueueKeys.maxCallersAction in data) {
            const action = data[CallQueueKeys.maxCallersAction]

            if (action === 'Transfer to Extension') {
                settings.maxCallersAction = 'TransferToExtension'
            }
            else if (action === 'Forward to External') {
                settings.maxCallersAction = 'UnconditionalForwarding'
            }
            else if (action === 'Play Greeting and Disconnect') {
                settings.maxCallersAction = 'Announcement'
            }
        }

        return settings
    }

    const getMaxWaitDestination = (data: any, extensionList: RCExtension[]) => {
        if (CallQueueKeys.maxWaitTimeAction in data) {
            const action = data[CallQueueKeys.maxWaitTimeAction] as string
            
            if (CallQueueKeys.maxWaitTimeDestination in data && action === 'Transfer to Extension') {
                const isolator = new ExtensionIsolator()
                const rawDestination = data[CallQueueKeys.maxWaitTimeDestination] as string
                const extension = isolator.isolateExtension(rawDestination)
                if (extension) {
                    return `${idForExtension(extension, extensionList)}`    
                }
            }
            else if (CallQueueKeys.maxWaitTimeDestination in data && action === 'Forward to External') {
                const isolator = new ExtensionIsolator()
                const rawDestination = data[CallQueueKeys.maxWaitTimeDestination] as string
                const phoneNumber = isolator.isolatePhoneNumber(rawDestination)
                return phoneNumber
            }
        }
    }

    const getMaxCallersDestination = (data: any, extensionList: RCExtension[]) => {
        if (CallQueueKeys.maxCallersAction in data) {
            const action = data[CallQueueKeys.maxCallersAction] as string
            
            if (CallQueueKeys.maxCallersDestination in data && action === 'Transfer to Extension') {
                const isolator = new ExtensionIsolator()
                const rawDestination = data[CallQueueKeys.maxCallersDestination] as string
                const extension = isolator.isolateExtension(rawDestination)
                if (extension) {
                    return `${idForExtension(extension, extensionList)}`
                }
            }
            else if (CallQueueKeys.maxCallersDestination in data && action === 'Forward to External') {
                const isolator = new ExtensionIsolator()
                const rawDestination = data[CallQueueKeys.maxCallersDestination] as string
                const phoneNumber = isolator.isolatePhoneNumber(rawDestination)
                return phoneNumber
            }
        }
    }

    const getTransferExtension = (data: any, extensionList: RCExtension[]) => {
        if (CallQueueKeys.maxWaitTimeAction in data) {
            const action = data[CallQueueKeys.maxWaitTimeAction] as string

            if (CallQueueKeys.maxWaitTimeDestination in data && action !== 'This Queue') {
                const rawDestination = data[CallQueueKeys.maxWaitTimeDestination] as string
                const isolator = new ExtensionIsolator()

                if (action === 'Transfer to Extension') {
                    const extension = isolator.isolateExtension(rawDestination)

                    if (extension) {
                        return `${idForExtension(extension, extensionList)}`
                    }
                }
            }
        }
    }

    const getTransferPhoneNumber = (data: any, extensionList: RCExtension[]) => {
        if (CallQueueKeys.maxWaitTimeAction in data) {
            const action = data[CallQueueKeys.maxWaitTimeAction] as string

            if (CallQueueKeys.maxWaitTimeDestination in data && action !== 'This Queue') {
                const rawDestination = data[CallQueueKeys.maxWaitTimeDestination] as string
                const isolator = new ExtensionIsolator()

                if (action === 'Transfer to External') {
                    const phoneNumber = isolator.isolatePhoneNumber(rawDestination)
                    return phoneNumber
                }
            }
        }
    }

    const getGreetings = (data: any) => {
        let greetings: Greeting[] = []
        let voicemailGreeting: Greeting = {
            type: "Voicemail",
            preset: Presets.defaultVoicemail
        }
        let audioWhileConnecting: Greeting = {
            type: 'ConnectingAudio',
            preset: Presets.acousticMusic
        }
        let holdMusic: Greeting = {
            type: 'HoldMusic',
            preset: HoldPresets.acousticMusic
        }
        let greeting: Greeting = {
            type: 'Introductory',
            preset: Presets.greetingEnabled
        }
        let interruptAudio: Greeting = {
            type: 'InterruptPrompt',
            preset: Presets.stayOnTheLine
        }

        if (CallQueueKeys.greeting in data) {
            if (data[CallQueueKeys.greeting] === 'Off') {
                greeting.preset = Presets.greetingDisabled
            }
            greetings.push(greeting)
        }
        if (CallQueueKeys.audioWhileConnecting in data) {
            audioWhileConnecting.preset = Presets.presetForSelection(data[CallQueueKeys.audioWhileConnecting].toString())
            if (audioWhileConnecting.preset.name != 'Custom') greetings.push(audioWhileConnecting)
        }
        if (CallQueueKeys.holdMusic in data) {
            holdMusic.preset = HoldPresets.presetForSelection(data[CallQueueKeys.holdMusic].toString())
            if (holdMusic.preset.name != 'Custom') greetings.push(holdMusic)
        }
        if (CallQueueKeys.voicemailGreeting in data) {
            if (!data[CallQueueKeys.voicemailGreeting].toString().includes('Custom')) {
                greetings.push(voicemailGreeting)
            }
        }

        greetings.push(interruptAudio)
        return greetings
    }

    const translatedRingType = (text: string) => {
        if (text === 'Sequential') return 'FixedOrder'
        return text
    }

    const idForQueue = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == extension && extensionsList[index].type === 'Department') {
                return extensionsList[index].id
            }
        }
        return 0
    }

    const idForExtension = (extension: string, extensionsList: RCExtension[]) => {
        for (let index = 0; index < extensionsList.length; index++) {
            if (`${extensionsList[index].extensionNumber}` == extension) {
                return extensionsList[index].id
            }
        }
        return 0
    }

    const idForSite = (siteName: string, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (extensionList[index].name.trim() === siteName.trim()) {
                return extensionList[index].id
            }
        }
        return 0
    }

    const isValidQueueMember = (extensionNumber: string, extensionList: RCExtension[]) => {
        for (let index = 0; index < extensionList.length; index++) {
            if (`${extensionList[index].extensionNumber}`=== extensionNumber) {
                return extensionList[index].type === 'User' || extensionList[index].type === 'VirtualUser'
            }
        }
        return false
    }

    const isolateExtensions = (rawMembers: string[]) => {
        const isolator = new ExtensionIsolator()
        const result: string[] = []
        for (let index = 0; index < rawMembers.length; index++) {
            let member = isolator.isolateExtension(rawMembers[index])
            if (member) {
                result.push(member)
            }
        }
        return result
    }

    return {convert, queues, isQueueConvertPending}
}

export default useExcelToQueues