import { useAtom } from "jotai"
import { settingsAtom } from "../../../../App"
import { useEffect } from "react"

export const useSettings = () => {
    const [settings, setSettings] = useAtom(settingsAtom)

    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(settings))
    }, [settings])

}