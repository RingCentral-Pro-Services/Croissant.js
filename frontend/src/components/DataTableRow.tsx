import React from "react";
import ExcelFormattable from "../models/ExcelFormattable";

const DataTableRow = (props: {dataSource: ExcelFormattable}) => {
    const {dataSource} = props

    return (
        <tr>
            {dataSource.toExcelRow().map((value) => (
                <td>{value}</td>
            ))}
        </tr>
    )
}

export default DataTableRow