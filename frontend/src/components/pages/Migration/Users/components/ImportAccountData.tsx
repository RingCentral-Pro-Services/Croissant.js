import { Button } from "@mantine/core";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { useState } from "react";
import FileSelect from "../../../../shared/FileSelect";

interface ImportAccountDataProps {
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
}

const ImportAccountData = (props: ImportAccountDataProps) => {
    const {isOpen, setIsOpen} = props
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const defaultSheet = ''
    
    const handleFileSelect = async () => {
        if (!selectedFile) return
        console.log('Selected File')
        console.log(selectedFile)
        const text = await selectedFile.text()
        const json = JSON.parse(text)
        console.log('json object')
        console.log(json)
    }

    return (
        <>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>Import Account Data</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <p>Import account data here</p>
                        <FileSelect enabled={true} accept=".json" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Back</Button>
                    <Button onClick={() => console.log('import button clicked')}>Import</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ImportAccountData