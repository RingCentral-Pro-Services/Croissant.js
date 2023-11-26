import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import { AuditTrailItem, AuditTrailItemData } from "./models/AuditTrailItem";
import useLogin from "../../../hooks/useLogin";
import { RestCentral } from "../../../rcapi/RestCentral";
import FilterArea from "../../shared/FilterArea";

export const AuditTrail = () => {
    const [auditItems, setAuditItems] = useState<AuditTrailItem[]>([])

    useLogin('audit-trail')

    useEffect(() => {
        fetchAuditTrail()
    }, [])

    const fetchAuditTrail = async () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) return

        try {
            const headers = {
                'Authorization': token
            }
            const res = await RestCentral.get('/api/audit', headers)
            const items: AuditTrailItemData[] = res.data.items

            items.sort((a, b) => {
                return a.id < b.id ? 1 : -1
            })

            const itemsFormatted = items.map((item) => new AuditTrailItem(item))
            setAuditItems(itemsFormatted)
        }
        catch (e) {
            console.log('Error fetching audit trail')
            console.log(e)
        }
    }

    return (
        <>
            <Header title="Audit Trail" body="" />
            <ToolCard>
                <FilterArea
                items={auditItems}
                showSiteFilter={false}
                additive
                defaultSelected={[]}
            />
            </ToolCard>
        </>
    )
}