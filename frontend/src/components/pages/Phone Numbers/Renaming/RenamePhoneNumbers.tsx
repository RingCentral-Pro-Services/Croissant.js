import React, {useEffect, useState} from "react";
import useLogin from "../../../../hooks/useLogin";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../../hooks/useReadExcel";
import { useAuditTrail } from "../../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../../shared/SystemNotifications";
import Header from "../../../shared/Header";
import { Button } from "@mantine/core";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import FileSelect from "../../../shared/FileSelect";
import usePhoneNumberList from "../../Migration/Users/hooks/usePhoneNumberList";
import { RenameNumberSchema } from "./schemas/schema";
import useValidateExcelData from "../../../../hooks/useValidateExcelData";
import { PhoneNumberNamePair } from "./types/PhoneNumberNamePair";
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator";
import { Message } from "../../../../models/Message";
import { SyncError } from "../../../../models/SyncError";
import FeedbackArea from "../../../shared/FeedbackArea";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { wait } from "../../../../helpers/rcapi";
import ProgressBar from "../../../shared/ProgressBar";
import useWriteExcelFile from "../../../../hooks/useWriteExcelFile";
import { SupportSheet } from "../../../shared/SupportSheet";

const baseUrl = 'https://platform.ringcentral.com/restapi/v1.0/account/~/phone-number/phoneNumberId'
const baseWaitingPeriod = 250

export const RenamePhoneNumbers = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [numberPairs, setNumberPairs] = useState<PhoneNumberNamePair[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const defaultSheet = 'Phone Numbers'

    useLogin('rename-numbers', isSyncing)
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(RenameNumberSchema, postMessage, postError)
    const {getPhoneNumberMap, phoneNumbers, isPhoneNumberMapPending} = usePhoneNumberList()
    const { writeExcel } = useWriteExcelFile()
    const { reportToAuditTrail } = useAuditTrail()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        getPhoneNumberMap()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExcelDataPending) return
        console.log('Phone Numbers')
        console.log(phoneNumbers)
        console.log('Raw Data')
        console.log(excelData)
        validate(excelData)
    }, [isExcelDataPending])
    
    useEffect(() => {
        if (isDataValidationPending) return
        console.log('Validated data')
        console.log(validatedData)
        const pairs = readNumberPairs(validatedData)
        setNumberPairs(pairs)
    }, [isDataValidationPending])

    const readNumberPairs = (data: any[]) => {
        const pairs: PhoneNumberNamePair[] = []
        const isolator = new ExtensionIsolator()

        for (const item of data) {
            const phoneNumber = item['Phone Number']
            const name = item['Name']
            const isolatedNumber = isolator.isolatePhoneNumber(`${phoneNumber}`.trim())
            console.log(`Isolated number: ${isolatedNumber}`)

            const number = phoneNumbers.find((number) => number.phoneNumber === isolatedNumber || number.phoneNumber === `+1${isolatedNumber}` || number.phoneNumber === `+${isolatedNumber}`)
            if (!number) {
                postMessage(new Message(`Could not find number '${phoneNumber}' in account`, 'error'))
                postError(new SyncError(phoneNumber, '', ['Could not find number', phoneNumber]))
                continue
            }

            const pair = new PhoneNumberNamePair(number, name)
            pairs.push(pair)
        }

        return pairs
    }

    const renameNumber = async (pair: PhoneNumberNamePair, token: string) => {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }

            const body = {
                label: pair.name
            }
            
            const response = await RestCentral.put(baseUrl.replace('phoneNumberId', `${pair.number.id}`), headers, body)
            
            if (response.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${response.rateLimitInterval / 1000} seconds`, 'info'), response.rateLimitInterval)
            }
            
            response.rateLimitInterval > 0 ? await wait(response.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
        catch (e: any) {
            if (e.rateLimitInterval > 0) {
                postTimedMessage(new Message(`Rate limit reached. Waiting ${e.rateLimitInterval / 1000} seconds`, 'info'), e.rateLimitInterval)
            }
            console.log(`Failed to rename number ${pair.number.phoneNumber}`)
            console.log(e)
            postMessage(new Message(`Could not set name for number ${pair.number.phoneNumber}. ${e.error}`, 'error'))
            postError(new SyncError(pair.number.phoneNumber, '', ['Failed to set name', pair.number.phoneNumber], e.error ?? '', pair))
            e.rateLimitInterval > 0 ? await wait(e.rateLimitInterval) : await wait(baseWaitingPeriod)
        }
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncClick = async () => {
        setIsSyncing(true)
        for (const pair of numberPairs) {
            const token = localStorage.getItem('cs_access_token')
            if (!token) continue
            await renameNumber(pair, token)
            setProgressValue((prev) => prev + 1)
        }
        postMessage(new Message('Done', 'success'))
    }

    const handleDownloadTemplateClick = () => {
        const headers = ['Phone Number', 'Name']
        writeExcel(headers, [], 'Phone Numbers', 'rename-numbers-template.xlsx')
    }



    return (
        <>
            <SystemNotifications toolName="Rename Phone Numbers" />

            <SupportSheet
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />

            <Header title="Rename Phone Numbers" body="Rename phone numbers in bulk" onHelpButtonClick={() => setIsSupportModalOpen(true)}>
                    <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>

            <ToolCard>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} error={tokenError} loading={isTokenPending} />
                {hasCustomerToken && isPhoneNumberMapPending ? <p style={{ display: 'inline-block' }}>Loading...</p> : null}
                <div style={{ display: isPhoneNumberMapPending ? 'none' : 'inline-block' }}>
                    <FileSelect enabled setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                    <Button className="healthy-margin-right" variant='filled' disabled={isSyncing || numberPairs.length === 0} onClick={handleSyncClick}>Sync</Button>
                </div>
                <Button onClick={handleDownloadTemplateClick}>Template</Button>
                {isSyncing ? <ProgressBar value={progressValue} max={numberPairs.length} label="Renaming numbers" /> : null}
                <FeedbackArea gridData={numberPairs} messages={messages} timedMessages={timedMessages} errors={errors} />
            </ToolCard>
        </>
    )
}