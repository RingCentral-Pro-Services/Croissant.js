import React from 'react'
import { useState } from "react";
import useFileSave from "../../../hooks/useFileSave";
import ResourcesArea from '../../shared/ResourcesArea';
import useAnalytics from "../../../hooks/useAnalytics";
import Header from '../../shared/Header';
import {Button} from '@mui/material'
const axios = require('axios').default;

const LegactyAuditMenus = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPending, setIsPending] = useState(false)
    const {setData, setOutputFilename} = useFileSave()
    const {fireEvent} = useAnalytics()

    const instructionsData = [
        {text: "Auditing Menus", link: "/croissant-audit.pdf", id: 1}
    ]

    const resourcesData = [
        {text: "Documentation", link: "https://docs.google.com/document/d/1xcF5H6KHnn-UF_vgAq7LEKJBa-g4XKBY3YvH0or-9HQ/edit?usp=sharing", id: 1}
    ]

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        document.getElementById('audit-menu-file-select')?.click()
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("filetoupload", selectedFile as File);
        setIsPending(true)

        axios
        .post('/audit', formData, {responseType: "blob"})
        .then((res: any) => {
            setOutputFilename(res.headers["content-disposition"].replace("attachment; filename=", ""))
            setData(res.data)
            setIsPending(false)
            fireEvent('update-audit')
        })
        .catch((err: Error) => alert(err.message));
    }

    return ( 
        <>
            <form>
                <Button variant='outlined' type='button' className="inline browse-button" onClick={handleClick}>Browse...</Button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                <Button variant='contained' type='button' onClick={handleSubmit}>{isPending ? "Processing" : "Submit"}</Button>
                <input id="audit-menu-file-select" type="file" onInput={(e) => setSelectedFile((e.target as HTMLInputElement).files![0])} accept=".xml" hidden/>
            </form>
            <ResourcesArea title="Instructions" links={instructionsData} />
            <ResourcesArea title="Resources" links={resourcesData} />
        </>
     );
}
 
export default LegactyAuditMenus;