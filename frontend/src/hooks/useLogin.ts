const useLogin = () => {
    let token = localStorage.getItem('rc_access_token')

    if (!token) {
        let url = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}`
        console.log(`URL: ${url}`)
        window.location.replace(url)
    }
}

export default useLogin