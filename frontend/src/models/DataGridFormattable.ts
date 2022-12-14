import { GridRowsProp, GridColDef } from '@mui/x-data-grid';

export interface DataGridFormattable {
    toDataGridRow: () => GridRowsProp
    toDataGidHeader: () => GridColDef[]
}