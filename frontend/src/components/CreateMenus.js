import { useState, useEffect } from 'react'
import ResourcesArea from './ResourcesArea';
const axios = require('axios').default;
const FileSaver = require('file-saver');

const CreateMenus = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState(null)
    const [outputFilename, setOutputFilename] = useState(null)

    const instructionsData = [
        {text: "Building with the BRD", link: "", id: 1},
        {text: "Building with Lucidchart", link: "", id: 2}
    ]

    const rescourcesData = [
        {text: "Documentation", link: "https://docs.google.com/document/d/1xcF5H6KHnn-UF_vgAq7LEKJBa-g4XKBY3YvH0or-9HQ/edit?usp=sharing", id: 1},
        {text: "Example BRD", link: "https://docs.google.com/spreadsheets/d/1mEaZVjjmesskNf47Dz0jMgPgZDKZ13PISgqiNyyMNos/edit?usp=sharing", id: 2},
        {text: "Example Lucidchart", link: "https://lucid.app/lucidchart/51421e0f-912e-47ca-a063-59d43cf436fd/edit?viewport_loc=-1505%2C-1165%2C5370%2C2692%2C0_0&invitationId=inv_50c4ff9e-896f-4ddc-b3df-ccd0251074b5#", id:3}
    ]

    const handleClick = (e) => {
        e.preventDefault()
        document.getElementById('create-menu-file-select').click()
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("filetoupload", selectedFile);
        setIsPending(true)

        axios
        .post('/fileupload', formData)
        .then((res) => {
            console.log(res.headers["content-disposition"])
            setOutputFilename(res.headers["content-disposition"].replace("attachment; filename=", ""))
            setData(res.data)
            setIsPending(false)
        })
        .catch((err) => alert("File Upload Error"));
    }

    useEffect(() => {
        if (!data) {
            return
        }

        const blob = new Blob([data], {type: "text/plain;charset=utf-8"})
        FileSaver.saveAs(blob, outputFilename)
        setData(null)
    }, [data, outputFilename])

    return ( 
        <>
            <h2>Create Menus</h2>
            <form action='/fileupload' method="post" encType="multipart/form-data">
                <button type='button' className="inline browse-button" onClick={handleClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                <button type='button' onClick={handleSubmit}>{isPending ? "Waiting for server" : "Submit"}</button>
                <input id="create-menu-file-select" type="file" onInput={(e) => setSelectedFile(e.target.files[0])} hidden/>
            </form>
            <ResourcesArea title="Instructions" links={instructionsData}/>
            <ResourcesArea title="Resources" links={rescourcesData}/>
        </>
     );
}
 
export default CreateMenus;