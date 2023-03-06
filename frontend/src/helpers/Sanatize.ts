export const sanatize = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
}