import React from "react";
import ExcelFormattable from "../models/ExcelFormattable";
import {TableRow, TableCell} from '@mui/material'

const DataTableRow = (props: {dataSource: ExcelFormattable}) => {
    const {dataSource} = props

    return (
        <TableRow>
            {dataSource.toExcelRow().map((value) => (
                <TableCell>{value}</TableCell>
            ))}
        </TableRow>
    )
}

export default DataTableRow