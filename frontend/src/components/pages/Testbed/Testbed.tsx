import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import FileSelect from "../../shared/FileSelect";
import { ExcelReader } from "../../../helpers/ExcelReader";
import ToolCard from "../../shared/ToolCard";
import { ExcelRangeEditor } from "../../shared/ExcelRangeEditor";
import { ExcelRange } from "../../../models/ExcelRange";

const Testbed = () => {
    const [targetUID, setTargetUID] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [ranges, setRanges] = useState<ExcelRange[]>([
        {name: 'Message Only', start: 'B2', end: 'F1000'},
        {name: 'Announcement Only', start: 'G2', end: 'K1000'},
    ])
    const defaultSheet = 'Groups'

    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    const handleButtonClick = () => {
    }

    const handleFileSelect = async () => {
        if (!selectedFile) return
        const reader = new ExcelReader(selectedFile)
        const messageOnlyData = await reader.read(selectedSheet, {range: ranges.find(range => range.name === 'Message Only')})
        const announcementOnlyData = await reader.read(selectedSheet, {range: ranges.find(range => range.name === 'Announcement Only')})
        console.log('message only data')
        console.log(messageOnlyData)

        console.log('announcement only data')
        console.log(announcementOnlyData)
    }
    
    return (
        <>
            <Header title="Testbed" body="For testing things" />
            <ToolCard>
                <ExcelRangeEditor ranges={ranges} onRangeChange={setRanges}/>
            </ToolCard>
            <div className="tool-card">
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button variant='filled' onClick={handleButtonClick}>Go</Button>
                <FileSelect
                    enabled={true}
                    setSelectedFile={setSelectedFile}
                    isPending={false}
                    handleSubmit={handleFileSelect}
                    setSelectedSheet={setSelectedSheet}
                    defaultSheet={defaultSheet}
                    accept='.xlsx'
                />
            </div>
        </>
    )
}

export default Testbed;