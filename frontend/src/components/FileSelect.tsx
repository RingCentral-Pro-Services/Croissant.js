import React, { useState } from "react"

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
                <button type='button' className="inline browse-button" onClick={handleFileOpenClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFileName ? selectedFileName : "No file selected"}</p>
                <button type='button' onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</button>
                <input id="file-select" type="file" onInput={(e) => handleFileInput(e)} accept=".xlsx, .csv" hidden/>
            </form>
        </div>
    )
}

export default FileSelect