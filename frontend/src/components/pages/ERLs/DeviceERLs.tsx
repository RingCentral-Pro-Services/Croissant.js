import React, { useEffect, useState } from "react"
import Header from "../../shared/Header"
import ToolCard from "../../shared/ToolCard"
import UIDInputField from "../../shared/UIDInputField"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useExtensions from "../../../rcapi/useExtensions"
import useAccountDevices from "../Migration/Users/hooks/useAccountDevices"
import useMessageQueue from "../../../hooks/useMessageQueue"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import { Device } from "../Migration/User Data Download/models/UserDataBundle"
import { DeviceUserMapping } from "./models/DeviceUserMapping"
import { Button } from "@mantine/core"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import useFetchERLs from "../Automatic Location Updates/hooks/useFetchERLs"
import { ERL } from "../Automatic Location Updates/models/ERL"
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel"
import * as Excel from 'exceljs'
import { SystemNotifications } from "../../shared/SystemNotifications"
import { SupportSheet } from "../../shared/SupportSheet"
import useReadExcel from "../../../hooks/useReadExcel"
import FileSelect from "../../shared/FileSelect"
import useValidateExcelData from "../../../hooks/useValidateExcelData"
import { deviceERLMappingSchema } from "./schemas/schemas"
import { readERLData } from "./utils/utils"
import { DeviceERLMapping } from "./models/DeviceERLMapping"
import FeedbackArea from "../../shared/FeedbackArea"

export const DeviceERLs = () => {
    const [targetUID, setTargetUID] = useState("")
    const [deviceUserMappings, setDeviceUserMappings] = useState<DeviceUserMapping[]>([])
    const [deviceERLMappings, setDeviceERLMappings] = useState<DeviceERLMapping[]>([])
    const [erls, setERLs] = useState<ERL[]>([])
    const [accountDevices, setAccountDevices] = useState<Device[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const defaultSheet = 'Devices'

    const setup = async () => {
        const extensions = await fetchExtensions()
        const devices = await fetchAccountDevices()
        const erls = await fetchERLs()

        console.log('Extensions')
        console.log(extensions)

        console.log('Devices')
        console.log(devices)

        const devicesWithUsers = devices.filter((device) => device.extension && device.phoneLines && device.phoneLines.length > 0)
        console.log('Devices with users')
        console.log(devicesWithUsers)

        const validDevices: Device[] = []
        const mappings: DeviceUserMapping[] = []
        for (const device of devicesWithUsers) {
            const extension = extensions.find((ext) => `${ext.data.id}` === `${device.extension?.id}`)
            if (!extension) {
                console.log('Could not find extension for device')
                continue
            }

            if (extension.data.status === 'Unassigned' || !['User', 'Limited'].includes(extension.data.type)) {
                continue
            }

            validDevices.push(device)
            mappings.push(new DeviceUserMapping(device, extension))
        }

        setDeviceUserMappings(mappings)
        setERLs(erls)
        setAccountDevices(devices)
        console.log('Valid devices')
        console.log(mappings)
    }

    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken(setup)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {extensionsList, isExtensionListPending, fetchExtensions} = useExtensions(postMessage)
    const { fetchAccountDevices } = useAccountDevices(postMessage, postTimedMessage, postError)
    const { fetchERLs } = useFetchERLs()
    const {writeExcel} = useWriteExcelFile()
    const {writePrettyExcel} = useWritePrettyExcel()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(deviceERLMappingSchema, postMessage, postError)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    const handleExportClick = () => {
        let header = ['Device Name', 'Extension Name', 'Site', 'Model', 'Phone number(s)', 'ERL',]
        writePrettyExcel(header, deviceUserMappings, 'Devices', 'device-erl-template.xlsx', '/device-erl-template.xlsx', setupSheet)
    }

    const setupSheet = (workbook: Excel.Workbook) => {
        const worksheet = workbook.getWorksheet('Dynamic Data')
        if (worksheet) {
            const column = worksheet.getColumn('A')
            column.values = erls.map((erl) => erl.name)
        }
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isDataValidationPending) return
        console.log('Valid data')
        console.log(validatedData)
        const mappings = readERLData(validatedData, accountDevices, erls)
        console.log('Mappings')
        console.log(mappings)
        setDeviceERLMappings(mappings)
    }, [isDataValidationPending])

    return (
        <>
            <SystemNotifications toolName="Device ERLs" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title="Device ERLs" body="" onHelpButtonClick={() => setIsSupportModalOpen(true)} />
            <ToolCard>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
                <Button
                    disabled={deviceUserMappings.length === 0}
                    onClick={handleExportClick}
                >Export Template</Button>
                <FileSelect
                    enabled={true}
                    setSelectedFile={setSelectedFile}
                    isPending={false}
                    handleSubmit={handleFileSelect}
                    setSelectedSheet={setSelectedSheet}
                    defaultSheet={defaultSheet}
                    accept='.xlsx'
                />
                <FeedbackArea
                    gridData={deviceERLMappings}
                    messages={messages}
                    errors={errors}
                    timedMessages={timedMessages}
                />
            </ToolCard>
        </>
    )
}