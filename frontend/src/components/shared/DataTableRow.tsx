import React from "react";
import ExcelFormattable from "../../models/ExcelFormattable";
import { DataTableFormattable } from "../../models/DataTableFormattable";
import {TableRow, TableCell} from '@mui/material'

const DataTableRow = (props: {dataSource: DataTableFormattable}) => {
    const {dataSource} = props

    return (
        <TableRow>
            {dataSource.toDataTableRow().map((value) => (
                <TableCell>{value}</TableCell>
            ))}
        </TableRow>
    )
}

export default DataTableRow