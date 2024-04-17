export const isCircular = (object: any) => {
    try {
        JSON.stringify(object)
        return false
    }
    catch (e) {
        return true
    }
}