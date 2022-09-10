const useAnalytics = () => {
    const fireEvent = (eventName) => {
        window.gtag('event', eventName, {
            'event_category' : 'dowloads',
            'event_label' : "file"
        })
    }

    return {fireEvent}
}

export default useAnalytics