import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import { MongoDocument } from "../../types/MongoDocument";
import { ChoreVM } from "../../types/vm/ChoreVM";

export type ChildrenPaidTableProps = {
  chores: MongoDocument<ChoreVM>[];
};

export function ChildrenPaidTable({ chores }: ChildrenPaidTableProps) {
  const rows = chores.map((chore) => ({
    id: chore.id,
    rewardDate: chore.paidDate ? new Date(chore.paidDate) : new Date(),
    amount: chore.points,
  }));
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "numeric",
  };

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
              <TableCell align="left">
                {row.rewardDate?.toLocaleDateString("en-US", dateOptions)}
              </TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
