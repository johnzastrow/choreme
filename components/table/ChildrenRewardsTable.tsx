import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {ChoreMeAvatar} from "../avatar";
import {TaskChoreVM} from "../../types/vm";

export type AssignedChoreTableProps = {
  chores: TaskChoreVM[];
};

export function AssignedChoreTable({ chores }: AssignedChoreTableProps) {
  const rows = chores.map((chore) => ({
    id: chore.task.id,
    kid: <ChoreMeAvatar />,
    chore: chore.chore?.name,
    status: chore.task.status,
  }));

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Kid</TableCell>
            <TableCell align="right">Chore/Value</TableCell>
            <TableCell align="right">Status</TableCell>
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
              <TableCell align="right">{row.chore}</TableCell>
              <TableCell align="right">{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
