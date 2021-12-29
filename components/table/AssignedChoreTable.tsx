import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import React from "react";
import { MongoDocument } from "../../types/MongoDocument";
import { ChoreVM } from "../../types/vm";
import { ChoreMeAvatar } from "../avatar";
import { TextButton } from "../button";

export type AssignedChoreTableProps = {
  chores: MongoDocument<ChoreVM>[];
  choreRejector: (id: string) => void;
};

export function AssignedChoreTable({
  chores,
  choreRejector,
}: AssignedChoreTableProps) {
  const rows = chores.map((chore) => ({
    id: chore._id,
    kid: <ChoreMeAvatar />,
    chore: chore.name,
    status: chore.status,
  }));
  const columns: GridColDef[] = [
    { field: "kid", headerName: "Kid" },
    { field: "chore", headerName: "Chore/Value" },
    { field: "status", headerName: "Status" },
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
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.kid}
              </TableCell>
              <TableCell align="right">
                <Link href={`/parent/chores?id=${row.id}`}>
                  <a>{row.chore}</a>
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
