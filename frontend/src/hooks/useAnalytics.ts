const useAnalytics = () => {
    const fireEvent = (eventName: string) => {
        window.gtag('event', eventName, {
            'event_category' : 'dowloads',
            'event_label' : "file"
        })
    }

    return {fireEvent}
}

export default useAnalytics