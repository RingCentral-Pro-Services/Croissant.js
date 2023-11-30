import React from "react";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import { AuditTrailItem } from "../models/AuditTrailItem";

export const AuditTrailFilters = (props: { auditItems: AuditTrailItem[], onInitiatorFilterChange: (value: string[]) => void, onToolFilterChange: (value: string[]) => void, onTypeFilterChange: (value: string[]) => void }) => {
    const { auditItems, onInitiatorFilterChange, onToolFilterChange, onTypeFilterChange } = props

    return (
        <div className="healthy-margin-bottom inline">
            <p>Filters</p>
            <AdaptiveFilter
                options={Array.from(new Set(auditItems.map((item) => item.data.initiator)))}
                title={"Initiator"}
                placeholder={"Search Initiator"}
                setSelected={onInitiatorFilterChange}
            />
            <AdaptiveFilter
                options={Array.from(new Set(auditItems.map((item) => item.data.tool)))}
                title={"Tool"}
                placeholder={"Search tool"}
                setSelected={onToolFilterChange}
            />
            <AdaptiveFilter
                options={Array.from(new Set(auditItems.map((item) => item.data.type)))}
                title={"Type"}
                placeholder={"Search type"}
                setSelected={onTypeFilterChange}
            />
        </div>
    )
}