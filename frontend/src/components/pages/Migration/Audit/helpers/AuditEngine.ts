export interface AuditResult {
    path: string
    expectedValue: string
    foundValue: string
}

export function compareObjects(obj1: any, obj2: any, path: string[] = []): AuditResult[] {
    const discrepancies: AuditResult[] = [];

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && !['uri', 'id', 'extensions', 'customRules', 'directNumbers'].includes(key)) {
            const value1 = obj1[key];
            const value2 = obj2[key];

            const currentPath = [...path, key];

            if (typeof value1 !== typeof value2) {
                //   discrepancies.push(`Type mismatch at path ${currentPath.join('.')} (${typeof value1} vs ${typeof value2})`);
                discrepancies.push({
                    path: currentPath.join('.'),
                    expectedValue: value1,
                    foundValue: value2 ? value2 : 'nothing'
                })
                continue;
            }

            if (typeof value1 === 'object' && typeof value2 === 'object') {
                const nestedDiscrepancies = compareObjects(value1, value2, currentPath);
                discrepancies.push(...nestedDiscrepancies);
            } else if (value1 !== value2) {
                //   discrepancies.push(`Value mismatch at path ${currentPath.join('.')} (${value1} vs ${value2})`);
                discrepancies.push({
                    path: currentPath.join('.'),
                    expectedValue: value1,
                    foundValue: value2 ? value2 : 'nothing'
                })
            }
        }
    }

    // for (const key in obj2) {
    //   if (obj2.hasOwnProperty(key) && !['uri', 'id'].includes(key) && !obj1.hasOwnProperty(key)) {
    //     const currentPath = [...path, key];
    //     discrepancies.push(`Key ${currentPath.join('.')} exists in the second object but not in the first object`);
    //   }
    // }

    return discrepancies;
}