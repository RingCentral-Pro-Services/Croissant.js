import { useState } from "react"
import CallQueue from "../models/CallQueue"
import RCExtension from "../models/RCExtension"
import ExtensionContact from "../models/ExtensionContact"
import { Message } from "../models/Message"
import { SyncError } from "../models/SyncError"
import ExtensionIsolator from "../helpers/ExtensionIsolator"
import { CallHandlingRules } from "../models/CallHandlingRules"
import {CallQueueKeys} from '../helpers/Keys'
import { Greeting, Presets } from "../models/Greetings"

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

            let queue = new CallQueue(extension, idForSite(extension.site, extensionsList), validMembers, getCallHandling(data[index]), getGreetings(data[index]))
            records.push(queue)
        }
        setQueues(records)
        setIsQueueConvertPending(false)
    }

    const getCallHandling = (data: any) => {
        let settings: CallHandlingRules = {
            transferMode: "Rotating",
            noAnswerAction: "WaitPrimaryMembers",
            holdAudioInterruptionMode: "Never",
            holdTimeExpirationAction: "Voicemail",
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
            const timeString = data[CallQueueKeys.totalRingTime].toString().replace(/\D/g, '')
            let time = parseInt(timeString)

            if (time < 10) time = time * 60
            settings.holdTime = time
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
            else if (value.toLowerCase() === 'Only when music ends') {
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

        return settings
    }

    const getGreetings = (data: any) => {
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
            preset: Presets.acousticMusic
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
        }
        if (CallQueueKeys.audioWhileConnecting in data) {
            audioWhileConnecting.preset = Presets.presetForSelection(data[CallQueueKeys.audioWhileConnecting].toString())
        }
        if (CallQueueKeys.holdMusic in data) {
            holdMusic.preset = Presets.presetForSelection(data[CallQueueKeys.holdMusic].toString())
        }

        return [voicemailGreeting, audioWhileConnecting, holdMusic, greeting, interruptAudio]

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
            if (extensionList[index].name === siteName) {
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