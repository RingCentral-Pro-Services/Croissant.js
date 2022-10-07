import { useState, useEffect } from 'react'
import LucidchartFilterPage from '../models/LucidchartFilterPage'

const useFilterServices = (pages: LucidchartFilterPage[], setPages: any, filteredPages: any, setFilteredPages: any) => {
    const [selectAll, setSelectAll] = useState(true)

    // Handle clicks to filter items
    const handleFilterClick = (text: string) => {
        if (text === "Select All") {
            let result = [...pages]

            let selectedPages = pages.filter((page: LucidchartFilterPage) => {
                return page.isChecked
            })

            if (selectedPages.length === pages.length) {
                // All pages are selected, deselect them all
                result.forEach((page: LucidchartFilterPage) => {
                    page.isChecked = false
                })
                setSelectAll(false)
            }
            else {
                // Some pages are not selected, select them all
                result.forEach((page: LucidchartFilterPage) => {
                    page.isChecked = true
                })
                setSelectAll(true)
            }
            setPages([...result])
        }

        let result = pages.map((page: LucidchartFilterPage) => {
            if (page.label !== text) {
                return {label: page.label, isChecked: page.isChecked}
            }
            return {label: page.label, isChecked: !page.isChecked}
        })
        setPages(result)

        if (filteredPages) {
            let filtered = filteredPages.map((page: LucidchartFilterPage) => {
                if (page.label !== text) {
                    return {label: page.label, isChecked: page.isChecked}
                }
                return {label: page.label, isChecked: !page.isChecked}
            })
            setFilteredPages(filtered)
        }
    }
    
    // Handle input from the search field, for filtering
    const handleInput = () => {
        const input = (document.getElementById("myInput") as HTMLInputElement).value.toUpperCase()

        if (!input) {
            setFilteredPages(null)
            return
        }

        let result: any = []
        pages.forEach((page: LucidchartFilterPage) => {
            if (page.label.toUpperCase().includes(input)) {
                result.push({label: page.label, isChecked: page.isChecked})
            }
        })
        setFilteredPages(result)
    }

    // Add an event listener to dismiss the filter box when clicked outside of
    useEffect(() => {
        window.addEventListener('mouseup', (e) => {
            const filterBox = document.getElementById('filter-box')
            const filterButton = document.getElementById('filter-button')

            if (filterBox && e.target !== filterButton && !filterBox.contains(e.target as HTMLElement)) {
                filterBox.classList.remove("w3-show")
            }
        })
    }, [])

    return { handleFilterClick, handleInput, selectAll }
}

export default useFilterServices