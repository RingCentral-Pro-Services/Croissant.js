import React, { useEffect, useState } from "react";
import {DataGrid, DataGridProps, GridColDef, GridRowsProp, GridSelectionModel} from '@mui/x-data-grid'
import { DataGridFormattable } from "../../models/DataGridFormattable";
import AdaptiveFilter from "./AdaptiveFilter";

interface FilterAreaProps {
    items: DataGridFormattable[]
    defaultSelected?: number[]
    showSiteFilter?: boolean
    additive?: boolean
    onSelectionChanged?: (selectedItems: DataGridFormattable[]) => void
}

const FilterArea: React.FC<FilterAreaProps> = ({items, onSelectionChanged, defaultSelected, showSiteFilter, additive = false}) => {

    const [allItems, setAllItems] = useState<DataGridFormattable[]>([])
    const [filteredItems, setFilteredItems] = useState<DataGridFormattable[]>([])
    const [rows, setRows] = useState<GridRowsProp>([])
    const [columns, setColumns] = useState<GridColDef[]>([])
    const [selectedIDs, setSelectedIDs] = useState<number[]>([])

    useEffect(() => {
        setFilered(items)
        setFilteredItems(items)
        if (onSelectionChanged) onSelectionChanged(items)
        if (!additive) {
            setSelectedIDs(items.map((item) => item.property('id')))
        }
        
    }, [items])

    const setFilered = (items: DataGridFormattable[]) => {
        if (items.length === 0) {
            setRows([])
            setColumns([])
            return
        }

        let rows = []
        let columns = []

        for (const item of items) {
            rows.push(item.toDataGridRow())
        }

        if (items.length > 0) {
            columns = items[0].toDataGidHeader()
        }
        columns = items[0].toDataGidHeader()
        
        setRows(rows)
        setColumns(columns)
    }

    const handleSelectionModelChanged = (newSelection: GridSelectionModel) => {
        const newSelectionIds = newSelection as number[]
        let selectedItems = filteredItems.filter((item) => newSelectionIds.includes(item.property('id')))
        setSelectedIDs(newSelectionIds)
        if (onSelectionChanged) {
            onSelectionChanged(selectedItems)
        }
    }

    const handleSiteFilterChanged = (selectedSites: string[]) => {
        if (selectedSites.length === 0) {
            setFilered([])
            return
        }
        let newItems = items.filter((item) => selectedSites.includes(item.property('site')))
        setFilteredItems(newItems)
        setFilered(newItems)
    }

    return (
        <div style={{width: '100%' }}>
            {showSiteFilter ? <AdaptiveFilter title='Site' placeholder='search' options={[...new Set(items.map((item) => item.property('site'))).values()]} defaultSelected={[...new Set(items.map((item) => item.property('site'))).values()]} disabled={false} setSelected={handleSiteFilterChanged} /> : <></>}
            <DataGrid
                rows={rows} 
                columns={columns} 
                autoHeight
                checkboxSelection={onSelectionChanged != undefined ? true : false}
                disableSelectionOnClick
                onSelectionModelChange={handleSelectionModelChanged}
                experimentalFeatures={{ newEditingApi: true }}
                rowsPerPageOptions={[50, 100, 500, 1000]}
                selectionModel={selectedIDs}
            />
        </div>
    )
}

export default FilterArea;