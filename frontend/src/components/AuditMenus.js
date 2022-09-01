import { useState, useEffect } from "react";
import ResourcesArea from './ResourcesArea';
const axios = require('axios').default;
const FileSaver = require('file-saver');

const AuditMenus = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState(null)
    const [outputFilename, setOutputFilename] = useState(null)

    const instructionsData = [
        {text: "Auditing Menus", link: "", id: 1}
    ]

    const resourcesData = [
        {text: "Documentation", link: "https://docs.google.com/document/d/1xcF5H6KHnn-UF_vgAq7LEKJBa-g4XKBY3YvH0or-9HQ/edit?usp=sharing", id: 1}
    ]

    const handleClick = (e) => {
        e.preventDefault()
        document.getElementById('audit-menu-file-select').click()
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("filetoupload", selectedFile);
        setIsPending(true)

        axios
        .post('/audit', formData, {responseType: "blob"})
        .then((res) => {
            setOutputFilename(res.headers["content-disposition"].replace("attachment; filename=", ""))
            setData(res.data)
            setIsPending(false)
        })
        .catch((err) => alert(err.message));
    }

    useEffect(() => {
        if (!data) {
            return
        }

        const blob = new Blob([data])
        FileSaver.saveAs(blob, outputFilename)
        setData(null)
    }, [data, outputFilename])

    return ( 
        <>
            <h2>Audit Menus</h2>
            <form>
                <button type='button' className="inline browse-button" onClick={handleClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                <button type='button' onClick={handleSubmit}>{isPending ? "Waiting for server" : "Submit"}</button>
                <input id="audit-menu-file-select" type="file" onInput={(e) => setSelectedFile(e.target.files[0])} accept=".xml" hidden/>
            </form>
            <ResourcesArea title="Instructions" links={instructionsData} />
            <ResourcesArea title="Resources" links={resourcesData} />
        </>
     );
}
 
export default AuditMenus;