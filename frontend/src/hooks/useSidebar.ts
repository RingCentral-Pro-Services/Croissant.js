import { useEffect } from "react"

// This hook is used to highlight the selected sidebar item
// This is probably not the best way to do this, but it works
const useSidebar = (labelText: string) => {
    useEffect(() => {
        const items = document.querySelectorAll(".MuiListItem-root")
        for (const item of items) {
            if (item.textContent === labelText) {
                item.classList.add("nav-item-selected")
            }
            else {
                item.classList.remove("nav-item-selected")
            }
        }
    }, [labelText])
}

export default useSidebar