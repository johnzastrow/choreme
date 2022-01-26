import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import { formatDate } from "../../lib/date";
import { MongoDocument } from "../../types/MongoDocument";
import { ChoreVM } from "../../types/vm/ChoreVM";
import { TaskChoreVM } from "../../types/vm/TaskChoreVM";

export type ChildrenPaidTableProps = {
  chores: { [key: string]: TaskChoreVM[] };
};

export function ChildrenPaidTable({ chores }: ChildrenPaidTableProps) {
  console.log(chores);
  const rows = Object.entries(chores).map(([key, value]) => {
    console.log(key);
    return {
      id: value[0].task._id,
      rewardDate: new Date(key),
      amount: value.reduce((acc, cur) => acc + cur.chore!.points, 0),
    };
  });
  // const rows = chores.map((chore) => {
  //   const { chore: _chore, task } = chore;

  //   return {
  //     id: _chore?.id,
  //     rewardDate: task.paidDate ? new Date(task.paidDate) : new Date(),
  //     amount: _chore?.points,
  //   };
  // });

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Reward Date</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="left">{formatDate(row.rewardDate)}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
