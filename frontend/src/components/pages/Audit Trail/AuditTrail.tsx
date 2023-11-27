import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import { AuditTrailItem, AuditTrailItemData } from "./models/AuditTrailItem";
import useLogin from "../../../hooks/useLogin";
import { RestCentral } from "../../../rcapi/RestCentral";
import FilterArea from "../../shared/FilterArea";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import { AuditTrailFilters } from "./components/AuditTrailFilters";

export const AuditTrail = () => {
    const [auditItems, setAuditItems] = useState<AuditTrailItem[]>([])
    const [filteredAuditItems, setFilteredAuditItems] = useState<AuditTrailItem[]>([])
    const [initiatorFilter, setInitiatorFilter] = useState<string[]>([])
    const [toolFilter, setToolFilter] = useState<string[]>([])
    const [typeFilter, setTypeFilter] = useState<string[]>([])

    useLogin('audit-trail')

    useEffect(() => {
        fetchAuditTrail()
    }, [])

    useEffect(() => {
        // Filter the audit items based on the filters, if any. Should update when filters are removed as well
        let filteredItems = auditItems
        if (initiatorFilter.length > 0) {
            filteredItems = filteredItems.filter((item) => initiatorFilter.includes(item.data.initiator))
        }
        if (toolFilter.length > 0) {
            filteredItems = filteredItems.filter((item) => toolFilter.includes(item.data.tool))
        }
        if (typeFilter.length > 0) {
            filteredItems = filteredItems.filter((item) => typeFilter.includes(item.data.type))
        }
        setFilteredAuditItems(filteredItems)
    }, [initiatorFilter, toolFilter, typeFilter])

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
            setFilteredAuditItems(itemsFormatted)
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
                {auditItems.length > 0 ? <AuditTrailFilters auditItems={auditItems} onInitiatorFilterChange={setInitiatorFilter} onToolFilterChange={setToolFilter} onTypeFilterChange={setTypeFilter} /> : <></>}
                <FilterArea
                items={filteredAuditItems}
                showSiteFilter={false}
                additive
                defaultSelected={[]}
            />
            </ToolCard>
        </>
    )
}