import { useEffect } from 'react'

const useFilterServices = (pages, setPages, filteredPages, setFilteredPages) => {

    // Handle clicks to filter items
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
    
    // Handle input from the search field, for filtering
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

    // Add an event listener to dismiss the filter box when clicked outside of
    useEffect(() => {
        window.addEventListener('mouseup', (e) => {
            const filterBox = document.getElementById('filter-box')
            const filterButton = document.getElementById('filter-button')

            if (filterBox && e.target !== filterButton && !filterBox.contains(e.target)) {
                filterBox.classList.remove("w3-show")
            }
        })
    }, [])

    return { handleFilterClick, handleInput }
}

export default useFilterServices