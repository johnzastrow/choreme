import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";

export type AssignedChoreTableProps = {
  rows: any[];
};

export function ChoreMeTable({ rows }: AssignedChoreTableProps) {
  const columns: GridColDef[] = [
    { field: "kid", headerName: "Kid", width: 200, type: "string" },
    { field: "rewards", headerName: "Rewards", width: 130, type: "number" },
  ];

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Kid</TableCell>
            <TableCell align="right">Rewards</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.kid}
              </TableCell>
              <TableCell align="right">{row.rewards}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
