import { Typography } from "@mui/material";
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
import { TaskChoreVM } from "../../types/vm";
import { TextButton } from "../button";
import NormalButton from "../button/NormalButton";

export type AssignedChoreTableProps = {
  chores: TaskChoreVM[];
  choreFinisher: (id: string) => void;
};

export function ChildrenAssignedChoreTable({
  chores,
  choreFinisher,
}: AssignedChoreTableProps) {
  const rows = chores.map((chore) => {
    const { chore: _chore, task } = chore;
    return {
      id: _chore?._id,
      startDate: task.startDate
        ? formatDate(new Date(task.startDate))
        : formatDate(new Date()),
      chore: _chore?.name,
      points: _chore?.points,
      status: task.status,
      paid: task.paidDate !== undefined,
      taskId: task._id,
    };
  });

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
              <TableCell align="right">
                {row.chore} ({row.points})
              </TableCell>
              <TableCell align="center">
                <Stack direction={"column"}>
                  {row.status}
                  {row.status !== "finished" && (
                    <NormalButton onClick={() => choreFinisher(row.taskId)}>
                      <Chip label="Finish" color="success" />
                    </NormalButton>
                  )}
                  {row.paid ? (
                    <Typography color="primary">Paid</Typography>
                  ) : (
                    <Typography color="error">Unpaid</Typography>
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
