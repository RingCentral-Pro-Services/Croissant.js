import { useState, useEffect } from 'react'
const FileSaver = require('file-saver');

const useFileSave = () => {
    const [data, setData] = useState(null)
    const [outputFilename, setOutputFilename] = useState(null)

    useEffect(() => {
        if (!data) {
            return
        }

        const blob = new Blob([data])
        FileSaver.saveAs(blob, outputFilename)
        setData(null)
    }, [data, outputFilename])

    return {setData, setOutputFilename}
}

export default useFileSave