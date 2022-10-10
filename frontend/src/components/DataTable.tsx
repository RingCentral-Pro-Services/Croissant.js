import React from "react";
import { DataTableFormattable } from "../models/DataTableFormattable";
import DataTableRow from "./DataTableRow";
import {Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material'

const DataTable = (props: {header: string[], data: DataTableFormattable[]}) => {
    const {header, data} = props

    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    {header.map((column) => (
                        <TableCell>{column}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((values) => (
                    <DataTableRow dataSource={values} />
                ))}
            </TableBody>
        </Table>
    )
}

export default DataTable