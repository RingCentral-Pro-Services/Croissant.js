const useLogin = (callbackroute: string = '', isSyncing: boolean = false) => {
    let token = localStorage.getItem('rc_access_token')
    let expiration = localStorage.getItem('rc_token_expiry')

    // Sync is running, don't redirect to login page
    if (isSyncing) return

    const isTokenExpired = () => {
        if (!expiration) return true

        let expirationTime = new Date(parseInt(expiration))
        let currentTime = new Date()

        if (currentTime >= expirationTime) return true

        return false
    }

    if (!token || isTokenExpired()) {
        let url = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=${callbackroute}`
        console.log(`URL: ${url}`)
        window.location.replace(url)
    }

}

export default useLogin