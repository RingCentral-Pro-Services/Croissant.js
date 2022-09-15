const useAnalytics = () => {
    const fireEvent = (eventName: string) => {
        // @ts-ignore
        window.gtag('event', eventName, {
            'event_category' : 'dowloads',
            'event_label' : "file"
        })
    }

    return {fireEvent}
}

export default useAnalytics