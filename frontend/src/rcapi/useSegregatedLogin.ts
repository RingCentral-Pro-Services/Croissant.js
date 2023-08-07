const useSegregatedLogin = (callbackroute: string) => {

    const forwardToSegregatedLogin = () => {
        let url = `${process.env.REACT_APP_SEGREGATED_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_SEGREGATED_AUTH_REDIRECT}&state=${callbackroute}`
        console.log(`URL: ${url}`)
        window.location.replace(url)
    }

    return {forwardToSegregatedLogin}
}

export default useSegregatedLogin