import React, { useEffect } from "react";
import {DataGrid, DataGridProps, GridColDef, GridRowsProp, GridSelectionModel} from '@mui/x-data-grid'
import { DataGridFormattable } from "../../models/DataGridFormattable";

interface FilterAreaProps {
    items: DataGridFormattable[]
    defaultSelected?: number[]
    onSelectionChanged?: (selectedIDs: number[]) => void
}

const FilterArea: React.FC<FilterAreaProps> = ({items, onSelectionChanged, defaultSelected}) => {

    const [rows, setRows] = React.useState<GridRowsProp>([])
    const [columns, setColumns] = React.useState<GridColDef[]>([])
    const [selectedIDs, setSelectedIDs] = React.useState<number[]>([])

    useEffect(() => {
        let rows = []
        let columns = []

        for (const item of items) {
            rows.push(item.toDataGridRow())
        }

        columns = items[0].toDataGidHeader()

        if (defaultSelected) {
            setSelectedIDs(defaultSelected)
        }
        
        setRows(rows)
        setColumns(columns)
    }, [items])

    const handleSelectionModelChanged = (newSelection: GridSelectionModel) => {
        const newSelectionIds = newSelection as number[]
        setSelectedIDs(newSelectionIds)
        if (onSelectionChanged) {
            onSelectionChanged(newSelectionIds)
        }
        console.log(newSelectionIds)
    }

    return (
        <div style={{ height: 800, width: '100%' }}>
            <DataGrid
                rows={rows} 
                columns={columns} 
                checkboxSelection
                disableSelectionOnClick
                onSelectionModelChange={handleSelectionModelChanged}
                experimentalFeatures={{ newEditingApi: true }}
                rowsPerPageOptions={[100, 500, 1000]}
                selectionModel={selectedIDs}
            />
        </div>
    )
}

export default FilterArea;