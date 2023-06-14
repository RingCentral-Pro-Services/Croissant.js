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
import { Button } from '@mantine/core'
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

const DirectCreateMenus = () => {
    useLogin('create-ivr')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let [isPending, setIsPending] = useState(false)
    const [menus, setMenus] = useState<IVRMenu[]>([])
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

    const handleFileSelect = () => {
        if (!selectedFile) return

        setIsPending(true)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setProgressValue(0)
        setReadyToSync(true)
        setMaxProgressValue(filterMenus.length * 2)
        createMenus(filterMenus, extensionsList)
        fireEvent('create-menu')
        // createMenus(menus, extensionsList)
    }

    useEffect(() => {
        if (isAudioPromptListPending) return
        if (!selectedFile) return

        console.log('audio prompts ->', audioPromptList)
        if (selectedFile.name.includes('.csv')) {
            readLucidchart(selectedFile, extensionsList, audioPromptList)
        }
        else if (selectedFile.name.includes('.xlsx')) {
            readFile(selectedFile, selectedSheet)
        }
        
    }, [isAudioPromptListPending, extensionsList, selectedFile])

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

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
