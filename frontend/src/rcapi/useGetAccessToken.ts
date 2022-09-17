// Eventually this hook will submit a fetch request to obtain an access token for a customer account
// For now, it will just copy the RC user access token
const useGetAccessToken = () => {
    let rc_access_token = localStorage.getItem('rc_access_token')
    if (!rc_access_token) return
    localStorage.setItem('cs_access_token', rc_access_token)
}

export default useGetAccessToken