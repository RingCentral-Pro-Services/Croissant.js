import { useState } from 'react'
import LucidchartFilterPage from '../models/LucidchartFilterPage'
/**
 * Extract pages names from Lucidchart CSV files
 * @returns An object containing an array of pages, a function to set 
 * pages, and a function to extract pages from a given CSV file
 */
const usePageExtractor = () => {
    const [pages, setPages] = useState<LucidchartFilterPage[]>([])

    const extract = (file: File) => {
        if (!file) {
            return
        }
        let reader = new FileReader()

        reader.onload = () => {
            let result = []
            let rows = (reader.result as string)?.split("\n")
            for (let index = 0; index < rows.length; index++) {
                let elements = rows[index].split(",")
                if (elements.length >= 12 && elements[1] === "Page") {
                    result.push({text: elements[11], isChecked: true})
                }
            }
            setPages(result)
        }
        reader.readAsText(file)
    }

    return {pages, setPages, extract}
}

export default usePageExtractor