import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { GridColDef } from "@mui/x-data-grid";
import React, { ChangeEvent, Fragment, useImperativeHandle } from "react";
import { formatDate } from "../../lib/date";
import { UserTaskData } from "../../types/vm";
import { TaskChoreVM } from "../../types/vm/TaskChoreVM";
import { ChoreMeAvatar } from "../avatar";
import { TextButton } from "../button";

export type RewardsTableProps = {
  data: UserTaskData;
  rejecter: (id: string) => void;
};

export type RewardsTableHandle = {
  getSelectedItems: () => TaskChoreVM[];
  clearSelectedItems: () => void;
};

export const _RewardsTable: React.ForwardRefRenderFunction<
  RewardsTableHandle,
  RewardsTableProps
> = ({ data, rejecter }, forwardedRef) => {
  const [state, setState] = React.useState<{
    selectedItems: TaskChoreVM[];
  }>({
    selectedItems: [],
  });

  useImperativeHandle(forwardedRef, () => ({
    getSelectedItems: () => state.selectedItems,
    clearSelectedItems: () => setState({ selectedItems: [] }),
  }));

  const onSelectedItemsChange = (
    e: ChangeEvent<HTMLInputElement>,
    selectedItem: TaskChoreVM
  ) => {
    state.selectedItems.includes(selectedItem)
      ? setState({
          selectedItems: state.selectedItems.filter(
            (item) => item.task._id !== selectedItem.task._id
          ),
        })
      : setState({ selectedItems: [...state.selectedItems, selectedItem] });
  };

  const rows = data.tasks.map((chore) => ({
    id: chore.task._id,
    kid: <ChoreMeAvatar name={data.profile.firstName} />,
    startDate: chore.task.startDate && new Date(chore.task.startDate),
    chore: chore.chore?.name,
    rewards: chore.chore?.points,
    status: chore.task.status,
    task: chore,
  }));
  const columns: GridColDef[] = [
    { field: "kid", headerName: "Kid" },
    { field: "startDate", headerName: "Start Date" },
    { field: "chore", headerName: "Chore" },
    { field: "rewards", headerName: "Rewards" },
    { field: "status", headerName: "Status" },
  ];
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field}>{column.headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              // sx={{ "&:last-child td, &:last-child th": { border: 1 } }}
            >
              <TableCell component="th" scope="row">
                {row.kid}
              </TableCell>
              <TableCell align="right">
                {row.startDate && formatDate(row.startDate)}
              </TableCell>
              <TableCell align="right">{row.chore}</TableCell>
              <TableCell align="right">{row.rewards}</TableCell>
              <TableCell align="right">
                <Fragment>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(e) => onSelectedItemsChange(e, row.task)}
                        checked={state.selectedItems.some(
                          (chore) => chore.task._id === row.id
                        )}
                      />
                    }
                    label={row.status}
                  />
                  <TextButton onClick={() => rejecter(row.id)}>
                    <Typography>Reject</Typography>
                  </TextButton>
                </Fragment>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export const RewardsTable = React.forwardRef(_RewardsTable);
