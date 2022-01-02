import { MobileDatePicker } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterMoment";
import DateTimePicker from "@mui/lab/DateTimePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  Autocomplete,
  Checkbox,
  createFilterOptions,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import NormalButton from "../../components/button/NormalButton";
import { ChoreLayout } from "../../components/layout";
import NormalTextInput from "../../components/text-input/normal-text-input";
import { useToast } from "../../hooks";
import {
  useCreateChoreMutation,
  useDeleteChoreMutation,
  useUpdateChoreMutation,
} from "../../lib/api";
import dbConnect from "../../lib/db";
import { Chore, User } from "../../models";
import { ChoreStatus, MongoDocument, Role } from "../../types";
import { Recurrence } from "../../types/Recurrence";
import { ChoreVM, UserVM } from "../../types/vm";

const filter = createFilterOptions<ChoreVM>();

const initialState = {
  id: "",
  name: "",
  points: 0,
  assignedTo: [],
  createdDate: new Date(),
  recurrence: Recurrence.None,
  status: ChoreStatus.UNFINISHED,
};
const Chores: NextPage<StaticProps> = ({ users, chores }) => {
  const router = useRouter();
  const { id } = router.query;

  // Queries
  const [createChore, { isLoading }] = useCreateChoreMutation();
  const [updateChore, { isLoading: isUpdating }] = useUpdateChoreMutation();
  const [deleteChore, { isLoading: isDeleting }] = useDeleteChoreMutation();

  const { showToast } = useToast();
  const [state, setState] = useState<{ _id?: string } & ChoreVM>(initialState);
  const initialSelectedUsers = users.map((user) => ({
    ...user,
    isSelected: false,
  }));
  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers);

  useEffect(() => {
    if (id) {
      const chore = chores.find((_chore) => _chore._id === id);
      if (chore) {
        setState(chore);
        setButtonVisibility((prevState) => {
          return {
            ...prevState,
            save: true,
            delete: true,
            new: false,
          };
        });
      }
    }
  }, []);

  useEffect(() => {
    setSelectedUsers((preState) =>
      preState.map((user) => {
        if (state.assignedTo.includes(user._id)) {
          user.isSelected = true;
        } else {
          user.isSelected = false;
        }
        return user;
      })
    );
  }, [state]);

  const [buttonVisibility, setButtonVisibility] = useState({
    new: false,
    save: false,
    cancel: true,
    delete: false,
  });

  function resetAllState() {
    setState(initialState);
    setSelectedUsers(initialSelectedUsers);
  }

  const onTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    if (event.target.name === "chore-amount") {
      const points = isNaN(parseFloat(event.target.value))
        ? 0
        : parseFloat(event.target.value);
      setState({ ...state, points });
    }
  };

  const handleChange = (event: SelectChangeEvent<Recurrence>) => {
    const value = event.target.value as Recurrence;
    setState({ ...state, recurrence: value });
  };

  return (
    <ChoreLayout
      title={"Chores"}
      isLoading={isLoading || isUpdating || isDeleting}
    >
      <Stack spacing={2}>
        <Autocomplete
          value={state}
          onChange={(event, newValue) => {
            const regex = /Add "([^"]*)"/gm;

            if (typeof newValue === "string") {
            } else if (newValue && newValue.name) {
              if (regex.test(newValue.name)) {
                const _name = newValue.name
                  .match(regex)![0]
                  .replace(regex, "$1");
                setState({ ...initialState, name: _name, id: newValue.id });
                setButtonVisibility({
                  ...buttonVisibility,
                  new: true,
                  save: false,
                });
              } else {
                const chore = chores.find(
                  (_chore) => _chore.name === newValue.name
                );
                if (chore) {
                  setState(chore);
                  setButtonVisibility({
                    ...buttonVisibility,
                    save: true,
                    delete: true,
                    new: false,
                  });
                }
              }
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some(
              (option) => inputValue === option.name
            );
            if (inputValue !== "" && !isExisting) {
              filtered.push({
                ...state,
                id: uuidv4(),
                name: `Add "${inputValue}"`,
              });
            }

            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="select-chore"
          options={chores}
          getOptionLabel={(option) => {
            // Value selected with enter, right from the input
            if (typeof option === "string") {
              return option;
            }
            return option.name;
          }}
          renderOption={(props, option) => <li {...props}>{option.name}</li>}
          freeSolo
          renderInput={(params) => (
            <NormalTextInput
              value={state.name}
              label="Search or add chore name "
              color="primary"
              name="chore"
              type="text"
              onChange={onTextChanged}
              {...params}
            />
          )}
        />
        <NormalTextInput
          label="Amount"
          color="primary"
          name="chore-amount"
          type="number"
          value={state.points !== 0 ? state.points : undefined}
          focused={state.points !== 0}
          onChange={onTextChanged}
        />
        <Stack direction={"row"} justifyContent={"space-between"}>
          <FormGroup>
            {selectedUsers.map((user) => (
              <FormControlLabel
                key={user.id}
                onChange={(_, checked) => {
                  if (checked) {
                    setState({
                      ...state,
                      assignedTo: [...state.assignedTo, user._id],
                    });
                  } else {
                    setState({
                      ...state,
                      assignedTo: state.assignedTo.filter(
                        (id) => id !== user._id
                      ),
                    });
                  }
                }}
                control={<Checkbox checked={user.isSelected} />}
                label={`${user.firstName} ${user.lastName}`}
              />
            ))}
          </FormGroup>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">
              Recurrence
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={state?.recurrence as Recurrence}
              onChange={handleChange}
              label="Recurrence"
            >
              {Object.entries(Recurrence).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack>
          <LocalizationProvider dateAdapter={DateAdapter}>
            {" "}
            <MobileDatePicker
              renderInput={(props) => <TextField {...props} />}
              label="Start Date"
              value={state.startDate}
              onChange={(newValue) => {
                setState({ ...state, startDate: newValue! });
              }}
            />
          </LocalizationProvider>
        </Stack>
        <Stack flexDirection={"row"}>
          <NormalButton
            disabled={!buttonVisibility.save}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
            onClick={() => {
              const { _id, ...data } = state;
              _id &&
                updateChore({ _id, ...data })
                  .unwrap()
                  .then(() => {
                    resetAllState();
                    showToast("Chore updated successfully", "success");
                  })
                  .catch((error) => {
                    showToast(error.data.message, "error");
                  });
            }}
          >
            <Typography variant="button">Save</Typography>
          </NormalButton>
          <NormalButton
            disabled={!buttonVisibility.cancel}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
            onClick={() => router.replace("/parent/assigned-chores")}
          >
            <Typography variant="button">Cancel</Typography>
          </NormalButton>
        </Stack>
        <Stack flexDirection={"row"}>
          <NormalButton
            disabled={!buttonVisibility.new}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
            onClick={() => {
              const { _id: _, ...data } = state;
              createChore(data)
                .unwrap()
                .then(() => {
                  resetAllState();
                  showToast("Chore created successfully", "success");
                })
                .catch((error) => {
                  showToast(error.data.message, "error");
                });
            }}
          >
            <Typography variant="button">New</Typography>
          </NormalButton>
          <NormalButton
            disabled={!buttonVisibility.delete}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
            onClick={() => {
              const { _id } = state;
              _id &&
                deleteChore({ _id })
                  .unwrap()
                  .then(() => {
                    resetAllState();
                    showToast("Chore deleted successfully", "success");
                  })
                  .catch((error) => {
                    showToast(error.data.message, "error");
                  });
            }}
          >
            <Typography variant="button">Delete</Typography>
          </NormalButton>
        </Stack>
      </Stack>
    </ChoreLayout>
  );
};

export default Chores;
type StaticProps = {
  users: MongoDocument<UserVM>[];
  chores: MongoDocument<ChoreVM>[];
};

export const getServerSideProps: GetServerSideProps<StaticProps> = async (
  context
) => {
  await dbConnect();
  //Check existing
  const users = (await User.find({ role: { $eq: Role.CHILDREN } }).exec()).map(
    (doc) => {
      const json = doc.toJSON<MongoDocument<UserVM>>();

      return JSON.parse(JSON.stringify(json));
    }
  );
  const chores = (await Chore.find({}).exec()).map((doc) =>
    JSON.parse(JSON.stringify(doc.toJSON<MongoDocument<ChoreVM>>()))
  );
  return {
    props: {
      users,
      chores,
    },
  };
};
