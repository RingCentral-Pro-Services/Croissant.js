import React from "react";
import ExcelFormattable from "../models/ExcelFormattable";
import DataTableRow from "./DataTableRow";

const DataTable = (props: {header: string[], data: ExcelFormattable[]}) => {
    const {header, data} = props

    return (
        <table>
            <tr>
                {header.map((column) => (
                    <th>{column}</th>
                ))}
            </tr>
            {data.map((values) => (
                <DataTableRow dataSource={values}/>
            ))}
        </table>
    )
}

export default DataTable