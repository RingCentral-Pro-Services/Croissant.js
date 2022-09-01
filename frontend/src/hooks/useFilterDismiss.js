import { useEffect } from 'react'

const useFilterDismiss = () => {
    useEffect(() => {
        window.addEventListener('mouseup', (e) => {
            const filterBox = document.getElementById('filter-box')
            const filterButton = document.getElementById('filter-button')

            if (filterBox && e.target !== filterButton && !filterBox.contains(e.target)) {
                filterBox.classList.remove("w3-show")
            }
        })
    }, [])
}

export default useFilterDismiss