import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import useExportToExcel from "../../../hooks/useExportToExcel";
import { AuditTrailItem, AuditTrailItemData } from "../Audit Trail/models/AuditTrailItem";
import { RestCentral } from "../../../rcapi/RestCentral";
import FilterArea from "../../shared/FilterArea";
import { UsageItem } from "./UsageItem";
import { Button } from "@mantine/core";

export const UserUsage = () => {
    const [auditItems, setAuditItems] = useState<AuditTrailItem[]>([])
    const [selectedYear, setSelectedYear] = useState(`${new Date().getFullYear()}`)
    const [usageItems, setUsageItems] = useState<UsageItem[]>([])
    const { exportToExcel } = useExportToExcel()

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
            const res = await RestCentral.get(`/api/audit?year=${selectedYear}`, headers)
            const items: AuditTrailItemData[] = res.data.items

            items.sort((a, b) => {
                return a.id < b.id ? 1 : -1
            })

            const itemsFormatted = items.map((item) => new AuditTrailItem(item))

            const usage: UsageItem[] = []

            for (const item of itemsFormatted) {
                if (['Account Access', 'Croissant', 'Auth'].includes(item.data.tool)) {
                    continue
                }

                let existingItem = usage.find((currentItem) => currentItem.data.title === item.data.initiator)
                
                if (!existingItem) {
                    const newItem = new UsageItem({title: item.data.initiator, count: 1})
                    usage.push(newItem)
                    continue
                }

                existingItem.data.count += 1
            }

            usage.sort((a, b) => {
                return a.data.count < b.data.count ? 1 : -1
            })

            setUsageItems(usage)

            setAuditItems(itemsFormatted)
        }
        catch (e) {
            console.log('Error fetching audit trail')
            console.log(e)
        }
    }

    const handleExportClick = () => {
        exportToExcel([{
            sheetName: 'Usage',
            headers: ['Name', 'Usage Count'],
            data: usageItems
        }], 'build-usage-by-user.xlsx')
    }

    return (
        <>
            <Header title="Usage by User" body="" />
            <ToolCard>
                <Button
                    className="healthy-margin-bottom"
                    onClick={handleExportClick}
                    variant='filled'
                >Export</Button>
                <FilterArea
                    items={usageItems}
                    showSiteFilter={false}
                    defaultSelected={[]}
                />
            </ToolCard>
        </>
    )
}