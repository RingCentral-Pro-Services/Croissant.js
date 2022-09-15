import { useState, useEffect } from 'react'

const useFilterServices = (pages: any, setPages: any, filteredPages: any, setFilteredPages: any) => {
    const [selectAll, setSelectAll] = useState(true)

    // Handle clicks to filter items
    const handleFilterClick = (text: string) => {
        if (text === "Select All") {
            let result = [...pages]

            let selectedPages = pages.filter((page: any) => {
                return page.checked
            })

            if (selectedPages.length === pages.length) {
                // All pages are selected, deselect them all
                result.forEach((page) => {
                    page.checked = false
                })
                setSelectAll(false)
            }
            else {
                // Some pages are not selected, select them all
                result.forEach((page) => {
                    page.checked = true
                })
                setSelectAll(true)
            }
            setPages([...result])
        }

        let result = pages.map((page: any) => {
            if (page.text !== text) {
                return {text: page.text, checked: page.checked}
            }
            return {text: page.text, checked: !page.checked}
        })
        setPages(result)

        if (filteredPages) {
            let filtered = filteredPages.map((page: any) => {
                if (page.text !== text) {
                    return {text: page.text, checked: page.checked}
                }
                return {text: page.text, checked: !page.checked}
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
        pages.forEach((page: any) => {
            if (page.text.toUpperCase().includes(input)) {
                result.push({text: page.text, checked: page.checked})
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