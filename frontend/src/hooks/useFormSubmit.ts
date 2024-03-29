import { useState, useEffect} from 'react'
const axios = require('axios').default;

const useFormSubmit = (url: string) => {
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState(null)

    useEffect(() => {
        const abortCont = new AbortController()
        setIsPending(true)

        axios
        .post(url, formData)
        .then((res: any) => {
            alert("File Upload success");
            console.log(res.data)
            setData(res.data)
            setIsPending(false)
        })
        .catch((err: any) => setError(err));

        return () => abortCont.abort()
    }, [url, formData])

    return {data, isPending, error, setFormData}
}

export default useFormSubmit