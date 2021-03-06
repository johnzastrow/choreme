import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {GridColDef} from "@mui/x-data-grid";
import Link from "next/link";
import React from "react";
import {ChoreMeAvatar} from "../avatar";
import {TextButton} from "../button";
import MUILink from "@mui/material/Link";
import {AssignedTaskChore} from "../../pages/parent/assigned-chores";

export type AssignedChoreTableProps = {
  chores: AssignedTaskChore[];
  choreRejector: (id: string) => void;
};

export function AssignedChoreTable({
                                     chores,
                                     choreRejector,
                                   }: AssignedChoreTableProps) {
  const rows = chores.map((chore) => ({
    id: chore.task._id,
    kid: <ChoreMeAvatar name={chore.owner.firstName}/>,
    chore: chore.chore?.name,
    status: chore.task.status,
    points: chore.chore?.points
  }));
  const columns: GridColDef[] = [
    {field: "kid", headerName: "Kid"},
    {field: "chore", headerName: "Chore/Value"},
    {field: "status", headerName: "Status"},
  ];

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
              sx={{"&:last-child td, &:last-child th": {border: 0}}}
            >
              <TableCell component="th" scope="row">
                {row.kid}
              </TableCell>
              <TableCell align="right">
                <Link href={`/parent/chores?id=${row.id}`}>
                  <MUILink href="#" underline="hover">
                    {row.chore} ({row.points})
                  </MUILink>
                </Link>
              </TableCell>
              <TableCell align="right">
                <React.Fragment>
                  {row.status}
                  <TextButton onClick={() => choreRejector(row.id)}>
                    Reject
                  </TextButton>
                </React.Fragment>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
