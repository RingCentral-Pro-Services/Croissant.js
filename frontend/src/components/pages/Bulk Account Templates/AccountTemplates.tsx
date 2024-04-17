import { Button } from "@mantine/core";
import React, { useState } from "react";
import { ExcelReader } from "../../../helpers/ExcelReader";
import { accountIDSchema, callQueueSchema, createSiteSchema, extensionSchema, ivrSchema } from "../../../helpers/schemas";
import { ZodValidator } from "../../../helpers/ZodValidator";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useJWKS from "../../../rcapi/useJWKS";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import ProgressBar from "../../shared/ProgressBar";
import ToolCard from "../../shared/ToolCard";
import useExcelToExtensions from "../Extension Upload/hooks/useExcelToExtensions";
import useExcelToSites from "../Sites/hooks/useExcelToSites";
import useReadCallQueues from "./hooks/useReadCallQueues";
import useReadIVRs from "./hooks/useReadIVRs";
import useRegionalFormats from "./hooks/useRegionalFormats";
import { TemplateData, TemplateEngine } from "./TemplateEngine";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";

const AccountTemplates = () => {
    const [isSyncing, setIsSyncing] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const [templateData, setTemplateData] = useState<TemplateData>({
        sites: [],
        users: [],
        callQueues: [],
        ivrs: []
    })
    const [accountIDs, setAccountIDs] = useState<string[]>([])
    const defaultSheet = ''

    useLogin('accounttemplates', isSyncing)
    const {fetchToken} = useJWKS()
    const {fireEvent} = useAnalytics()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchRegionalFormats} = useRegionalFormats(postMessage, postTimedMessage, postError)
    const {convert} = useExcelToSites([])
    const {convertExcelToExtensions} = useExcelToExtensions(false, postMessage, postError, false)
    const {convert: readQueues} = useReadCallQueues(postMessage, postError)
    const {converToMenus} = useReadIVRs(postMessage, postError)
    const { reportToAuditTrail } = useAuditTrail()

    const handleFileSelect = async () => {
        if (!selectedFile) return

        const reader = new ExcelReader(selectedFile)
        const validator = new ZodValidator()

        // Sites
        const siteData = await reader.readVerticalExcel('Site Information')
        const validatedData = validator.validate(siteData, createSiteSchema)
        const sites = await convert(validatedData)

        // Users
        const userData = await reader.read('Users')
        const validatedUserData = validator.validate(userData, extensionSchema)
        const users = await convertExcelToExtensions(validatedUserData, [], [], [])

        // Call Queues
        const callQueueData = await reader.read('Call Queues')
        const validatedCallQueueData = validator.validate(callQueueData, callQueueSchema)
        const queues = readQueues(validatedCallQueueData, [])

        // IVRs
        const ivrData = await reader.read('IVRs')
        const validatedIVRData = validator.validate(ivrData, ivrSchema)
        const ivrs = converToMenus(validatedIVRData, [], [])

        // Account IDs
        const accountData = await reader.read('Account UIDs')
        const validatedAccountData = validator.validate(accountData, accountIDSchema)
        const uids = validatedAccountData.map((account) => account.UID)

        setTemplateData({
            sites: sites,
            users: users,
            callQueues: queues,
            ivrs: ivrs
        })

        setAccountIDs(uids)

        console.log('Account IDs')
        console.log(accountData)
        console.log('Validated account IDs')
        console.log(validatedAccountData)
        console.log('UIDs')
        console.log(uids)

        console.log('Sites')
        console.log(sites)
        
        console.log('Users')
        console.log(users)

        console.log('Queues')
        console.log(queues)

        console.log('IVR data')
        console.log(ivrData)
        console.log('Validated ivr data')
        console.log(validatedIVRData)
        console.log('IVRs')
        console.log(ivrs)
    }
    
    const handleSyncButtonClick = async () => {
        setIsSyncing(true)
        fireEvent('bulk-account-templates')

        reportToAuditTrail({
            action: `Applied template to ${accountIDs.length} accounts`,
            tool: 'Bulk Account Templates',
            type: 'Tool',
            uid: 'N/A'
        })

        for (const accountID of accountIDs) {
            const res = await fetchToken(accountID)
            const regionalFormats = await fetchRegionalFormats()
            const templateEngine = new TemplateEngine(templateData, regionalFormats, postMessage, postTimedMessage, postError)
            await templateEngine.applyTemplate()
            setProgressValue((prev) => prev + 1)
        }
        setIsSyncing(false)
    }

    return (
        <>
            <SystemNotifications toolName="Account Templates" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title="Bulk Account Templates" body="Bootstrap many accounts using a template" onHelpButtonClick={() => setIsSupportModalOpen(true)} />
            <ToolCard>
                <h2>Account Templates</h2>
                <FileSelect enabled={true} accept=".xlsx" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
                <Button disabled={accountIDs.length === 0 || isSyncing} onClick={handleSyncButtonClick}>Sync</Button>
                <ProgressBar label="" value={progressValue} max={accountIDs.length} />
                <FeedbackArea gridData={[]} messages={messages} timedMessages={timedMessages} errors={errors} />
            </ToolCard>
        </>
    )
}

export default AccountTemplates