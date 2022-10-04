import React, { useEffect, useState } from "react"
import {Button} from '@mui/material'
import useReadExcel from "../hooks/useReadExcel"
import ExcelSheetSelector from "./ExcelSheetSelector"

const FileSelect = (props: {handleSubmit: () => void, setSelectedFile: (file: File) => void, isPending: boolean, setSelectedSheet: (sheetName: string) => void, defaultSheet: string, accept: string}) => {
    const {handleSubmit, setSelectedFile, isPending, setSelectedSheet, defaultSheet, accept} = props
    const [selectedFileName, setSelectedFileName] = useState<string | null>()
    const {excelSheets, readSheetNames} = useReadExcel()

    const handleFileOpenClick = () => {
        document.getElementById('file-select')?.click()
    }

    const handleFileInput = (e: any) => {
        if ((e.target as HTMLInputElement).files![0].name.includes('.xlsx')) {
            readSheetNames((e.target as HTMLInputElement).files![0])
        }

        setSelectedFile((e.target as HTMLInputElement).files![0])
        setSelectedFileName((e.target as HTMLInputElement).files![0].name)
    }

    return (
        <div className="file-select">
            <form>
                <Button className="inline browse-button" variant="outlined" type="button" onClick={handleFileOpenClick}>Browse...</Button>
                <p className="inline healthy-margin-right">{selectedFileName ? selectedFileName : "No file selected"}</p>
                {selectedFileName && selectedFileName.includes('.xlsx') ? <ExcelSheetSelector sheets={excelSheets} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} /> : <></>}
                <Button variant="outlined" type="button" onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</Button>
                <input id="file-select" type="file" onInput={(e) => handleFileInput(e)} accept={accept} hidden/>
            </form>
        </div>
    )
}

export default FileSelect