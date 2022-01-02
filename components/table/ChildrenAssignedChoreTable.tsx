import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import { formatDate } from "../../lib/date";
import { MongoDocument } from "../../types/MongoDocument";
import { ChoreVM } from "../../types/vm";
import { TextButton } from "../button";

export type AssignedChoreTableProps = {
  chores: MongoDocument<ChoreVM>[];
  choreFinisher: (id: string) => void;
};

export function ChildrenAssignedChoreTable({
  chores,
  choreFinisher,
}: AssignedChoreTableProps) {
  const rows = chores.map((chore) => ({
    id: chore._id,
    startDate: chore.startDate
      ? formatDate(new Date(chore.startDate))
      : formatDate(new Date()),
    chore: chore.name,
    status: chore.status,
    paid: chore.paidDate !== undefined,
  }));

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
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
                {row.startDate}
              </TableCell>
              <TableCell align="right">{row.chore}</TableCell>
              <TableCell align="center">
                <Stack direction={"column"}>
                  {row.status}
                  {row.status !== "finished" && (
                    <TextButton onClick={() => choreFinisher(row.id)}>
                      Finish
                    </TextButton>
                  )}
                  {row.paid ? (
                    <Chip label="Paid" color="primary" />
                  ) : (
                    <Chip label="Unpaid" color="error" variant="outlined" />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
