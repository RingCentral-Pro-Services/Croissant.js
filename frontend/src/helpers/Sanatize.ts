export const sanitize = (str: string): string => {
    if (!str) return ''
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
}