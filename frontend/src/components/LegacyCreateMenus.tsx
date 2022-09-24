import React from 'react'
import { useState } from 'react'
import PageFilter from './PageFilter';
import ResourcesArea from './ResourcesArea';
import usePageExtractor from '../hooks/usePageExtractor';
import useFilterServices from '../hooks/useFilterServices';
import useFileSave from '../hooks/useFileSave';
import useAnalytics from '../hooks/useAnalytics';
import LucidchartFilterPage from '../models/LucidchartFilterPage';
const axios = require('axios').default;

const LegacyCreateMenus = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPending, setIsPending] = useState(false)
    const {setData, setOutputFilename} = useFileSave()
    const [filteredPages, setFilteredPages] = useState(null)
    const {pages, setPages, extract} = usePageExtractor()
    const {handleFilterClick, handleInput, selectAll} = useFilterServices(pages, setPages, filteredPages, setFilteredPages)
    const {fireEvent} = useAnalytics()

    const instructionsData = [
        {text: "Building with the BRD", link: "/croissant-brd.pdf", id: 1},
        {text: "Building with Lucidchart", link: "/croissant-lucidchart.pdf", id: 2}
    ]

    const rescourcesData = [
        {text: "Documentation", link: "https://docs.google.com/document/d/1xcF5H6KHnn-UF_vgAq7LEKJBa-g4XKBY3YvH0or-9HQ/edit?usp=sharing", id: 1},
        {text: "Example BRD", link: "https://docs.google.com/spreadsheets/d/1mEaZVjjmesskNf47Dz0jMgPgZDKZ13PISgqiNyyMNos/edit?usp=sharing", id: 2},
        {text: "Example Lucidchart", link: "https://lucid.app/lucidchart/51421e0f-912e-47ca-a063-59d43cf436fd/edit?viewport_loc=-1505%2C-1165%2C5370%2C2692%2C0_0&invitationId=inv_50c4ff9e-896f-4ddc-b3df-ccd0251074b5#", id:3}
    ]

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        document.getElementById('create-menu-file-select')?.click()
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("filetoupload", selectedFile as File);
        pages.forEach((page: LucidchartFilterPage) => {
            page.isChecked && formData.append("page", page.text)
        })
        setIsPending(true)

        axios
        .post('/fileupload', formData)
        .then((res: any) => {
            setOutputFilename(res.headers["content-disposition"].replace("attachment; filename=", ""))
            setData(res.data)
            setIsPending(false)
            fireEvent('create-menu')
        })
        .catch((err: Error) => alert(err.message));
    }

    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
        extract(file)
    }

    return (
        <>
            <form action='/fileupload' method="post" encType="multipart/form-data">
                <button type='button' className="inline browse-button" onClick={handleClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                {selectedFile && selectedFile.name.includes('.csv') && <PageFilter pages={filteredPages ? filteredPages : pages} selectAll={selectAll} handleFilterClick={handleFilterClick} handleInput={handleInput} />}
                <button type='button' onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</button>
                <input id="create-menu-file-select" type="file" onInput={(e) => handleFileSelect((e.target as HTMLInputElement).files![0])} accept=".xlsx, .xml, .csv" hidden/>
            </form>
            <ResourcesArea title="Instructions" links={instructionsData}/>
            <ResourcesArea title="Resources" links={rescourcesData}/>
        </>
     );
}
 
export default LegacyCreateMenus;