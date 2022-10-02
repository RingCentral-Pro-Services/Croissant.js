import React, { useState } from "react"
import {Button} from '@mui/material'

const FileSelect = (props: {handleSubmit: () => void, setSelectedFile: (file: File) => void, isPending: boolean}) => {
    const {handleSubmit, setSelectedFile, isPending} = props
    const [selectedFileName, setSelectedFileName] = useState<string | null>()

    const handleFileOpenClick = () => {
        document.getElementById('file-select')?.click()
    }

    const handleFileInput = (e: any) => {
        setSelectedFile((e.target as HTMLInputElement).files![0])
        setSelectedFileName((e.target as HTMLInputElement).files![0].name)
    }

    return (
        <div className="file-select">
            <form>
                <Button className="inline browse-button" variant="outlined" type="button" onClick={handleFileOpenClick}>Browse...</Button>
                <p className="inline healthy-margin-right">{selectedFileName ? selectedFileName : "No file selected"}</p>
                <Button variant="outlined" type="button" onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</Button>
                <input id="file-select" type="file" onInput={(e) => handleFileInput(e)} accept=".xlsx, .csv" hidden/>
            </form>
        </div>
    )
}

export default FileSelect