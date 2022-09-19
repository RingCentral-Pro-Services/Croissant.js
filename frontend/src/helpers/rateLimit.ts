const rateLimit = (headers: any) => {
    let requestsRemaining = headers['x-rate-limit-remaining']
    let interval = headers['x-rate-limit-window']
    let timeout = 0

    if (requestsRemaining < 1) timeout = interval * 1000
    return timeout
}

export default rateLimit