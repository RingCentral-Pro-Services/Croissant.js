import React from "react";
import { ExcelRange } from "../../models/ExcelRange";
import { Input } from "@mantine/core";

export const ExcelRangeEditor = (props: { ranges: ExcelRange[], onRangeChange: (ranges: ExcelRange[]) => void }) => {
    const { ranges, onRangeChange } = props

    const handleChange = (range: ExcelRange) => {
        const newRanges = [...ranges]
        for (let i = 0; i < newRanges.length; i++) {
            if (newRanges[i].name === range.name) {
                newRanges[i].start = range.start.trim()
                newRanges[i].end = range.end.trim()
            }
        }

        onRangeChange(newRanges)
    }

    return (
        <div style={{ width: 500 }}>
            <h3>Edit Excel Ranges</h3>
            <p>We'll use these ranges when reading excel files.</p>
            <div style={{ maxHeight: 400, overflowX: 'auto' }}>
                {ranges.map((range) => (
                    <ExcelRangeEditorRow range={range} onChange={handleChange} />
                ))}
            </div>
        </div>
    )
}

const ExcelRangeEditorRow = (props: { range: ExcelRange, onChange: (range: ExcelRange) => void }) => {
    const { range, onChange } = props

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
            <p style={{ minWidth: 250 }}>{range.name}</p>
            <Input
                style={{ width: 75 }}
                className="healthy-margin-right"
                value={range.start}
                onChange={(e) => onChange({ ...range, start: e.currentTarget.value })}
            />
            <p className="healthy-margin-right">:</p>
            <Input
                style={{ width: 75 }}
                value={range.end}
                onChange={(e) => onChange({ ...range, end: e.currentTarget.value })}
            />
        </div>
    )
}