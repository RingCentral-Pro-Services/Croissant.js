const useAnalytics = () => {
    const fireEvent = (eventName: string) => {
        try {
            // @ts-ignore
            window.gtag('event', eventName, {
                'event_category' : 'dowloads',
                'event_label' : "file"
            })
        } catch (e) {
            console.log('Failed to fire analytics event')
        }
    }

    return {fireEvent}
}

export default useAnalytics