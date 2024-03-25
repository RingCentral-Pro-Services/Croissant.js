import React, {useEffect, useState} from "react";
import useMessageQueue from "../../../hooks/useMessageQueue";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useReadExcel from "../../../hooks/useReadExcel";
import useExcelToIVRs from "../../../rcapi/useExcelToIVRs";
import FileSelect from "../../shared/FileSelect";
import useLogin from "../../../hooks/useLogin";
import useCreateIVRs from "../../../rcapi/useCreateIVRs";
import useReadLucidchart from "../../../hooks/useReadLucidchart";
import { IVRMenu } from "../../../models/IVRMenu";
import useFilterServices from "../../../hooks/useFilterServices";
import { Button, Modal } from '@mantine/core'
import FeedbackArea from "../../shared/FeedbackArea";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useGetAudioPrompts from "../../../rcapi/useGetAudioPrompts";
import useAnalytics from "../../../hooks/useAnalytics";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import { ivrSchema } from "../../../helpers/schemas";
import UIDInputField from "../../shared/UIDInputField";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import LaunchIcon from '@mui/icons-material/Launch';
import { IconExternalLink } from "@tabler/icons-react";
import { IVRIntakePipeline } from "./models/IVRIntakePipeline";
import { ExcelDataProvider } from "../../../helpers/ExcelDataProvider";
import { ZodValidator } from "../../../helpers/ZodValidator";
import { IVRTransformer } from "./models/IVRTransformer";
import { MessageQueue } from "../../../models/Transformer";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import { sanitize } from "../../../helpers/Sanatize";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";

const DirectCreateMenus = () => {
    useLogin('create-ivr')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let [isPending, setIsPending] = useState(false)
    const [isShowingWarningModal, setIsShowingWarningModal] = useState(false)
    const [menus, setMenus] = useState<IVRMenu[]>([])
    const [existingMenus, setExistingMenus] = useState<IVRMenu[]>([])
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus: excelMenus, isMenuConvertPending, converToMenus} = useExcelToIVRs(postMessage, postError)
    const {readLucidchart, isLucidchartPending, menus: lucidchartMenus, pages, setPages} = useReadLucidchart(postMessage)
    const defaultSheet = 'IVRs'
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {audioPromptList, isAudioPromptListPending, fetchAudioPrompts} = useGetAudioPrompts(postMessage, postTimedMessage)

    // Filter stuff
    const [isDisplayingFilterBox, setDisplayFilterBox] = useState(false)
    const [filteredPages, setFilteredPages] = useState(null)
    const {handleFilterClick, handleInput, selectAll} = useFilterServices(pages, setPages, filteredPages, setFilteredPages)
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [filterMenus, setFilteredMenus] = useState<IVRMenu[]>([])

    const {validatedData, validate, isDataValidationPending} = useValidateExcelData(ivrSchema, postMessage, postError)

    // Progress bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {createMenus, isSyncing} = useCreateIVRs(setProgressValue, postMessage, postTimedMessage, postError, isMultiSiteEnabled)

    const {writeExcel} = useWriteExcelFile()
    const { reportToAuditTrail } = useAuditTrail()

    const handleFileSelect = async () => {
        if (!selectedFile) return

        setIsPending(true)
        // fetchExtensions()


        const messageQueue: MessageQueue = {
            postMessage: postMessage,
            postError: postError,
            postTimedMessage: postTimedMessage
        }
        const dataProvider = new ExcelDataProvider(selectedFile, selectedSheet)
        const validator = new ZodValidator(ivrSchema)
        const transformer = new IVRTransformer(extensionsList, audioPromptList)
        const pipeline = new IVRIntakePipeline(dataProvider, transformer, validator, messageQueue)
        const processedMenus = await pipeline.run()
        console.log('Processed menus')
        console.log(processedMenus)

        const existingMenus = getExistingMenus(processedMenus)
        if (existingMenus.length !== 0) {
            setExistingMenus(existingMenus)
            setIsShowingWarningModal(true)
        }

        setFilteredMenus(processedMenus)
        setMenus(processedMenus)
        setReadyToSync(true)
        setIsPending(false)
    }

    const getExistingMenus = (menus: IVRMenu[]) => {
        const existingExtensionNumbers = extensionsList.filter((ext) => ext.extensionNumber && ext.prettyType[ext.type] === 'IVR Menu').map((ext) => `${ext.extensionNumber}`)
        const existingMenus: IVRMenu[] = []

        console.log('Existing extension numbers:')
        console.log(existingExtensionNumbers)

        const ivrExtensions = menus.filter((ext) => ext.data.extensionNumber).map((ext) => ext.data.extensionNumber)
        console.log('IVR Extensions')
        console.log(ivrExtensions)

        for (const menu of menus) {
            if (existingExtensionNumbers.includes(`${menu.data.extensionNumber}`)) {
                existingMenus.push(menu)
            }
        }

        return existingMenus
    }

    const handleSyncButtonClick = () => {
        setProgressValue(0)
        setReadyToSync(true)
        setMaxProgressValue(filterMenus.length * 2)
        createMenus(filterMenus, extensionsList)
        fireEvent('create-menu')
        reportToAuditTrail({
            action: `Created ${filterMenus.length} IVRs`,
            tool: 'Create IVRs',
            type: 'Tool',
            uid: targetUID
        })
        // createMenus(menus, extensionsList)
    }

    const handleExportExistingMenusClick = () => {
        let header = ['Menu Name', 'Menu Ext', 'Phone Number', 'Site', 'Prompt Mode', 'Prompt Name/Script', 'Key 1 Action', 'Key 1 Destination', 'Key 2 Action', 'Key 2 Destination', 'Key 3 Action', 'Key 3 Destination',
                     'Key 4 Action', 'Key 4 Destination', 'Key 5 Action', 'Key 5 Destination', 'Key 6 Action', 'Key 6 Destination', 'Key 7 Action', 'Key 7 Destination',
                     'Key 8 Action', 'Key 8 Destination', 'Key 9 Action', 'Key 9 Destination', 'Key 0 Action', 'Key 0 Destination', 'Key # Press', 'Key * Press']
        writeExcel(header, existingMenus, 'Overlapping IVRs', `overlapping-ivrs-${sanitize(companyName)}.xlsx`)
    }

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    // useEffect(() => {
    //     if (isAudioPromptListPending) return
    //     if (!selectedFile) return

    //     console.log('audio prompts ->', audioPromptList)
    //     if (selectedFile.name.includes('.csv')) {
    //         readLucidchart(selectedFile, extensionsList, audioPromptList)
    //     }
    //     else if (selectedFile.name.includes('.xlsx')) {
    //         readFile(selectedFile, selectedSheet)
    //     }
        
    // }, [isAudioPromptListPending, extensionsList, selectedFile])

    useEffect(() => {
        if (isExtensionListPending) return
        // if (!selectedFile) return

        fetchAudioPrompts()
    }, [isExtensionListPending, selectedFile])

    useEffect(() => {
        if (isDataValidationPending) return
        converToMenus(validatedData, extensionsList, audioPromptList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isExcelDataPending) return

        validate(excelData)
        // converToMenus(excelData, extensionsList, audioPromptList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isLucidchartPending) return
        console.log('Lucidchart done')
        console.log(lucidchartMenus)
        setMenus(lucidchartMenus)
        setIsPending(false)
        setReadyToSync(true)
        setDisplayFilterBox(true)
        setSelectedSites(pages.map((page) => page.label))
    }, [lucidchartMenus, isLucidchartPending])

    useEffect(() => {
        if (isMenuConvertPending) return

        console.log(excelMenus)
        setMenus(excelMenus)
        setReadyToSync(true)
        setIsPending(false)
        setFilteredMenus(excelMenus)
        // createMenus(excelMenus, extensionsList)
    }, [isReadyToSync, isMenuConvertPending, excelMenus])

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isSyncing) return
        console.log('Selected Sites:')
        console.log(selectedSites)
        const filtered = menus.filter((menu) => {
            if (!menu.page) return false
            return selectedSites.includes(menu.page)
        })
        console.log(filtered)
        setFilteredMenus(filtered)
    }, [pages, selectedSites])
    
    return (
        <div>
            <SystemNotifications toolName="Create IVRs" />
            <Modal opened={isShowingWarningModal} onClose={ () => setIsShowingWarningModal(false)} title="Overlapping IVRs " closeOnClickOutside={false}>
                <p>Warning! Due to overlapping extension numbers, uploading this file will overwrite {existingMenus.length} IVRs that already exist in the account. Please review your file carefully to prevent any unintended changes.</p>
                <p>Overlapping IVRs:</p>
                <div className="modal-content">
                    <ul>
                        {existingMenus.map((menu) => (
                            <li key={menu.data.extensionNumber}>{menu.data.name} Ext. {menu.data.extensionNumber}</li>
                        ))}
                    </ul>
                </div>
                <div className="modal-buttons">
                    <Button variant='outline' onClick={handleExportExistingMenusClick}>Export Overlapping IVRs</Button>
                    <Button className="healthy-margin-left" onClick={() => setIsShowingWarningModal(false)}>Okay</Button>
                </div>
            </Modal>

            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
            <FileSelect enabled={hasCustomerToken} accept=".xlsx, .csv" handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={isPending} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
            {isDisplayingFilterBox ? <AdaptiveFilter title='Pages' placeholder='Search...' setSelected={setSelectedSites} options={pages.map((page) => page.label)} defaultSelected={pages.map((page) => page.label)} /> : <></>}
            <Button disabled={!hasCustomerToken || menus.length === 0 || isSyncing} variant="filled" className="inline" onClick={handleSyncButtonClick}>Sync</Button>
            <Button className='healthy-margin-left' variant='outline' onClick={() => window.open('https://docs.google.com/spreadsheets/d/1jcXdr5mc-HpmbkjRq4V-2_G_pftrSOHqFYSyo5wLs2k/edit?usp=sharing', '_blank')} rightIcon={<IconExternalLink />} >Template</Button>
            {!(menus.length > 0) ? <></> : <progress id='sync_progress' value={progressValue} max={maxProgressValue} />}
            {timedMessages.map((timedMessage) => (
                <p>{timedMessage.body}</p>
            ))}
            {!(menus.length > 0 || messages.length > 0 || timedMessages.length > 0) ? <></> : <FeedbackArea gridData={filterMenus} messages={messages} timedMessages={timedMessages} errors={errors} /> }
        </ div>
    )
}

export default DirectCreateMenus
