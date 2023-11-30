import { RestCentral } from "../rcapi/RestCentral"

export const useAuditTrail = () => {

    const reportToAuditTrail = async (data: {action: string, tool: string, uid: string, type: 'Tool' | 'Access' | 'Admin'}) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            return
        }

        try {
            const headers = {
                'Authorization': token,
            }
            const body = {
                action: data.action,
                tool: data.tool,
                type: data.type,
                uid: data.uid
            }

            RestCentral.post('/api/audit', headers, body)
        }
        catch (err) {
            console.log('Error while reporting to audit trail')
            console.log(err)
        }
    }

    return { reportToAuditTrail }

}