import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { GridColDef } from '@mui/x-data-grid'
import React, { ChangeEvent, Fragment, useImperativeHandle } from 'react'
import { formatDate } from '../../lib/date'
import { MongoDocument } from '../../types/MongoDocument'
import { ChoreVM } from '../../types/vm'
import { ChoreMeAvatar } from '../avatar'
import { TextButton } from '../button'

export type RewardsTableProps = {
  chores: MongoDocument<ChoreVM>[]
  rejecter: (id: string) => void
}

export type RewardsTableHandle = {
  getSelectedItems: () => MongoDocument<ChoreVM>[]
  clearSelectedItems: () => void
}

export const _RewardsTable: React.ForwardRefRenderFunction<
  RewardsTableHandle,
  RewardsTableProps
> = ({ chores, rejecter }, forwardedRef) => {
  const [state, setState] = React.useState<{
    selectedItems: MongoDocument<ChoreVM>[]
  }>({
    selectedItems: [],
  })

  useImperativeHandle(forwardedRef, () => ({
    getSelectedItems: () => state.selectedItems,
    clearSelectedItems: () => setState({ selectedItems: [] }),
  }))

  const onSelectedItemsChange = (
    e: ChangeEvent<HTMLInputElement>,
    selectedItem: string
  ) => {
    const selectedChore = chores.find((chore) => chore.id === selectedItem)
    if (state.selectedItems.some((chore) => chore.id === selectedItem)) {
      setState({
        selectedItems: state.selectedItems.filter(
          (chore) => chore.id !== selectedItem
        ),
      })
    } else {
      selectedChore &&
        setState({ selectedItems: [...state.selectedItems, selectedChore] })
    }
  }

  const rows = chores.map((chore) => ({
    id: chore.id,
    kid: <ChoreMeAvatar />,
    startDate: chore.startDate && new Date(chore.startDate),
    chore: chore.name,
    rewards: chore.points,
    status: chore.status,
  }))
  const columns: GridColDef[] = [
    { field: 'kid', headerName: 'Kid' },
    { field: 'startDate', headerName: 'Start Date' },
    { field: 'chore', headerName: 'Chore' },
    { field: 'rewards', headerName: 'Rewards' },
    { field: 'status', headerName: 'Status' },
  ]
  return (
    <TableContainer component={Paper}>
      <Table aria-label='simple table'>
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
              <TableCell component='th' scope='row'>
                {row.kid}
              </TableCell>
              <TableCell align='right'>
                {row.startDate && formatDate(row.startDate)}
              </TableCell>
              <TableCell align='right'>{row.chore}</TableCell>
              <TableCell align='right'>{row.rewards}</TableCell>
              <TableCell align='right'>
                <Fragment>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(e) => onSelectedItemsChange(e, row.id)}
                        checked={state.selectedItems.some(
                          (chore) => chore.id === row.id
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
  )
}
export const RewardsTable = React.forwardRef(_RewardsTable)
