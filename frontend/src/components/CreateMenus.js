import { useFormSubmit } from '../hooks/useFormSubmit'
import { useState, useEffect } from 'react'
const axios = require('axios').default;

const CreateMenus = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState(null)

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
            alert("File Upload success");
            console.log(res.data)
            setData(res.data)
            setIsPending(false)
        })
        .catch((err) => alert("File Upload Error"));
    }

    useEffect(() => {
        console.log('Use effect ran')
    }, [data])

    return ( 
        <>
            <h2>Create Menus</h2>
            <form action='/fileupload' method="post" encType="multipart/form-data">
                <button type='button' className="inline browse-button" onClick={handleClick}>Browse...</button>
                <p className="inline healthy-margin-right">{selectedFile ? selectedFile.name : "No file selected"}</p>
                <button type='button' onClick={handleSubmit}>{isPending ? "Waiting for server" : "Submit"}</button>
                <input id="create-menu-file-select" type="file" onInput={(e) => setSelectedFile(e.target.files[0])} hidden/>
            </form>
        </>
     );
}
 
export default CreateMenus;