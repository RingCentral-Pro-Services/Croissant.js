export const adjustParkLocationName = (schema: string, selectionName: string, iteration: number) => {
    return schema.replaceAll('{selectionName}', selectionName).replaceAll('{iteration}', `${iteration}`)
}