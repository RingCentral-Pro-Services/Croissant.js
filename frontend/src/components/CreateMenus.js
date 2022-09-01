import { useState, useEffect } from 'react'
import PageFilter from './PageFilter';
import ResourcesArea from './ResourcesArea';
const axios = require('axios').default;
const FileSaver = require('file-saver');

const CreateMenus = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState(null)
    const [outputFilename, setOutputFilename] = useState(null)
    const [filteredPages, setFilteredPages] = useState(null)
    const [pages, setPages] = useState([])

    const instructionsData = [
        {text: "Building with the BRD", link: "", id: 1},
        {text: "Building with Lucidchart", link: "", id: 2}
    ]

    const rescourcesData = [
        {text: "Documentation", link: "https://docs.google.com/document/d/1xcF5H6KHnn-UF_vgAq7LEKJBa-g4XKBY3YvH0or-9HQ/edit?usp=sharing", id: 1},
        {text: "Example BRD", link: "https://docs.google.com/spreadsheets/d/1mEaZVjjmesskNf47Dz0jMgPgZDKZ13PISgqiNyyMNos/edit?usp=sharing", id: 2},
        {text: "Example Lucidchart", link: "https://lucid.app/lucidchart/51421e0f-912e-47ca-a063-59d43cf436fd/edit?viewport_loc=-1505%2C-1165%2C5370%2C2692%2C0_0&invitationId=inv_50c4ff9e-896f-4ddc-b3df-ccd0251074b5#", id:3}
    ]

    useEffect(() => {
        window.addEventListener('mouseup', (e) => {
            const filterBox = document.getElementById('filter-box')
            const filterButton = document.getElementById('filter-button')

            if (e.target != filterButton && !filterBox.contains(e.target)) {
                filterBox.classList.remove("w3-show")
            }
        })
    }, [])

    const handleFilterClick = (text) => {
        if (text === "Select All") {
            let result = [...pages]
            result.forEach((page) => {
                page.checked = true
            })
            setPages([...result])
        }

        let result = pages.map((page) => {
            if (page.text !== text) {
                return {text: page.text, checked: page.checked}
            }
            return {text: page.text, checked: !page.checked}
        })
        setPages(result)

        if (filteredPages) {
            let filtered = filteredPages.map((page) => {
                if (page.text !== text) {
                    return {text: page.text, checked: page.checked}
                }
                return {text: page.text, checked: !page.checked}
            })
            setFilteredPages(filtered)
        }
    }

    const handleInput = () => {
        const input = document.getElementById("myInput").value.toUpperCase()

        if (!input) {
            setFilteredPages(null)
            return
        }

        let result = []
        pages.forEach((page) => {
            if (page.text.toUpperCase().includes(input)) {
                result.push({text: page.text, checked: page.checked})
            }
        })
        setFilteredPages(result)
    }

    const handleClick = (e) => {
        e.preventDefault()
        document.getElementById('create-menu-file-select').click()
    }

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("filetoupload", selectedFile);
        pages.forEach((page) => {
            page.checked && formData.append("page", page.text)
        })
        setIsPending(true)

        axios
        .post('/fileupload', formData)
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

        const blob = new Blob([data], {type: "text/plain;charset=utf-8"})
        FileSaver.saveAs(blob, outputFilename)
        setData(null)
    }, [data, outputFilename])

    useEffect(() => {
        if (!selectedFile) {
            return
        }
        let reader = new FileReader()

        reader.onload = () => {
            let result = []
            let rows = reader.result.split("\n")
            for (let index = 0; index < rows.length; index++) {
                let elements = rows[index].split(",")
                if (elements.length >= 12 && elements[1] === "Page") {
                    console.log(elements[11])
                    result.push({text: elements[11], checked: true})
                }
            }
            setPages(result)
        }
        reader.readAsText(selectedFile)
    }, [selectedFile])

    return ( 
        <>
            <h2>Create Menus</h2>
            <form action='/fileupload' method="post" encType="multipart/form-data">
                <button type='button' className="inline browse-button" onClick={handleClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                {selectedFile && selectedFile.name.includes('.csv') && <PageFilter pages={filteredPages ? filteredPages : pages} handleFilterClick={handleFilterClick} handleInput={handleInput} />}
                <button type='button' onClick={handleSubmit}>{isPending ? "Waiting for server" : "Submit"}</button>
                <input id="create-menu-file-select" type="file" onInput={(e) => setSelectedFile(e.target.files[0])} accept=".xlsx, .xml, .csv" hidden/>
            </form>
            <ResourcesArea title="Instructions" links={instructionsData}/>
            <ResourcesArea title="Resources" links={rescourcesData}/>
        </>
     );
}
 
export default CreateMenus;