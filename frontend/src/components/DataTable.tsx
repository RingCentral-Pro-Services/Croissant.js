import React from "react";
import ExcelFormattable from "../models/ExcelFormattable";
import DataTableRow from "./DataTableRow";

const DataTable = (props: {header: string[], data: ExcelFormattable[]}) => {
    const {header, data} = props

    return (
        <div className="data-table">
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
        </div>
    )
}

export default DataTable