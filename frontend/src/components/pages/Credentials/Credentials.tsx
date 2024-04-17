import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useExtensions from "../../../rcapi/useExtensions";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import FileSelect from "../../shared/FileSelect";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import { credentialsSchema } from "../../../helpers/schemas";
import FeedbackArea from "../../shared/FeedbackArea";
import { ExtensionCredentials } from "./models/ExtensionCredentials";
import useReadCredentials from "./hooks/useReadCredentials";
import useSetCredentials from "./hooks/useSetCredentials";
import { Button } from "@mantine/core";
import ProgressBar from "../../shared/ProgressBar";
import useSecretQuestions from "./hooks/useSecretQuestions";
import useLogin from "../../../hooks/useLogin";
import * as Excel from 'exceljs'
import { SecretQuestion } from "./models/SecretQuestion";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SupportSheet } from "../../shared/SupportSheet";

const Credentials = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [secretQuestions, setSecretQuestions] = useState<SecretQuestion[]>([])
    const [credentials, setCredentials] = useState<ExtensionCredentials[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const defaultSheet = 'Credentials'

    useLogin('credentials', isSyncing)
    const { fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName } = useGetAccessToken()
    const { postMessage, postError, messages, errors } = useMessageQueue()
    const { postTimedMessage, timedMessages } = usePostTimedMessage()
    const { fetchExtensions, extensionsList, isExtensionListPending } = useExtensions(postMessage)
    const { fetchSecretQuestions } = useSecretQuestions(postMessage, postTimedMessage, postError)
    const { readFile, isExcelDataPending, excelData } = useReadExcel()
    const { validate, validatedData, isDataValidationPending } = useValidateExcelData(credentialsSchema, postMessage, postError)
    const { readCredentials } = useReadCredentials(postMessage, postTimedMessage, postError)
    const { setCredentials: setExtCredentials } = useSetCredentials(postMessage, postTimedMessage, postError)
    const { writePrettyExcel } = useWritePrettyExcel()
    const { reportToAuditTrail } = useAuditTrail()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    const setup = async () => {
        const questions = await fetchSecretQuestions()
        setSecretQuestions(questions)
        setIsReady(true)
    }

    useEffect(() => {
        if (isExtensionListPending) return
        setup()
    }, [isExtensionListPending])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        console.log('validated data')
        console.log(validatedData)
        const creds = readCredentials(validatedData, secretQuestions, extensionsList)
        setCredentials(creds)
    }, [isDataValidationPending])

    const handleSyncClick = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        setProgressMax(credentials.length)

        for (const cred of credentials) {
            await setExtCredentials(cred)
            setProgressValue((prev) => prev + 1)
        }

        reportToAuditTrail({
            action: `Updated credentials for ${credentials.length} extensions`,
            tool: 'Credentials',
            type: 'Tool',
            uid: targetUID
        })

        setIsDone(true)
        setIsSyncing(false)
    }

    const handleTemplateExportClick = async () => {
        writePrettyExcel([], [], 'Credentials', `Credentials.xlsx`, '/credentials-template.xlsx', setupSheet)
    }

    const setupSheet = (workbook: Excel.Workbook) => {
        const worksheet = workbook.getWorksheet('Dynamic Data')
        if (worksheet) {
            const column = worksheet.getColumn('A')
            column.values = secretQuestions.map((q) => q.questionText)
        }
    }

    return (
        <>
            <SupportSheet
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />

            <Header title="Credentials" body="" onHelpButtonClick={() => setIsSupportModalOpen(true)} />

            <ToolCard>
                <h3>Things to know</h3>
                <ul>
                    <li>Supports users, limited extensions, call queues, message only extensions, and announcement only extensions</li>
                    <li>If the extension is not activated, you must provide a password, PIN, security question, and answer</li>
                    <li>The extension will be activated if not already</li>
                </ul>
            </ToolCard>

            <ToolCard>
                <UIDInputField
                    className="healthy-margin-top"
                    setTargetUID={setTargetUID}
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    loading={isTokenPending}
                    error={tokenError}
                />
                <div style={{ display: isReady ? 'inline-block' : 'none' }}>
                    <FileSelect
                        enabled={!isSyncing}
                        setSelectedFile={setSelectedFile}
                        isPending={false}
                        handleSubmit={handleFileSelect}
                        setSelectedSheet={setSelectedSheet}
                        defaultSheet={defaultSheet}
                        accept='.xlsx'
                    />
                    <Button
                        className="healthy-margin-right"
                        disabled={!hasCustomerToken}
                        onClick={handleTemplateExportClick}
                    >Template</Button>
                    <Button
                        disabled={isSyncing || credentials.length === 0}
                        onClick={handleSyncClick}
                    >Sync</Button>
                </div>
                <ProgressBar
                    className="healthy-margin-top"
                    label=""
                    value={progressValue}
                    max={progressMax}
                />
                <FeedbackArea
                    gridData={credentials}
                    messages={messages}
                    errors={errors}
                    timedMessages={timedMessages}
                    isDone={isDone}
                />
            </ToolCard>
        </>
    )
}

export default Credentials