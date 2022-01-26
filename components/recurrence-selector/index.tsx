import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, {useEffect} from "react";
import {Daily} from "./Daily";
import {Monthly} from "./Monthly";
import {Weekly} from "./Weekly";
import {RecurrenceType} from "../../types/enum";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  type: RecurrenceType;
  repeat: number[];
  onChange: (value: number[]) => void;
}

function TabPanel(props: TabPanelProps) {
  const {children, value, index, onChange, ...other} = props;

  const [alignment, setAlignment] = React.useState("web");
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setAlignment(newAlignment);
  };

  let data;
  switch (props.type) {
    case RecurrenceType.Daily:
      data = <Daily/>;

      break;
    case RecurrenceType.Weekly:
      data = <Weekly onChange={onChange} repeat={props.repeat}/>;

      break;
    case RecurrenceType.Monthly:
      data = <Monthly onChange={onChange} repeat={props.repeat}/>;

      break;
    default:
      data = (
        <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handleChange}
        >
          <ToggleButton value="web">Web</ToggleButton>
          <ToggleButton value="android">Android</ToggleButton>
          <ToggleButton value="ios">iOS</ToggleButton>
        </ToggleButtonGroup>
      );
      break;
  }
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recurrence-tabpanel-${index}`}
      aria-labelledby={`recurrence-tab-${index}`}
      {...other}
    >
      {index === value && data}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `recurrence-tabpanel-${index}`,
    "aria-controls": `recurrence-tabpanel-${index}`,
  };
}

type RecurrenceSelectorProps = {
  onRecurrenceChange: (value: {
    type: RecurrenceType;
    repeat: number[];
  }) => void;
  recurrence: {
    type: RecurrenceType;
    repeat: number[];
  };
};
export const RecurrenceSelector = ({
                                     onRecurrenceChange,
                                     recurrence,
                                   }: RecurrenceSelectorProps) => {

    const [value, setValue] = React.useState(0);

    useEffect(() => {
      switch (recurrence.type) {
        case RecurrenceType.Daily:
          setValue(1);
          break;
        case RecurrenceType.Weekly:
          setValue(2);
          break;
        case RecurrenceType.Monthly:
          setValue(3);
          break;
        default:
          setValue(0);
          break;
      }
    }, [recurrence]);


    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      console.log(newValue);
      setValue(newValue);
      let type: RecurrenceType;
      switch (newValue) {
        case 1:
          type = RecurrenceType.Daily;
          break;
        case 2:
          type = RecurrenceType.Weekly;
          break;
        case 3:
          type = RecurrenceType.Monthly;
          break;
        default:
          type = RecurrenceType.None;
          break;
      }
      const _recurrence = {
        type,
        repeat: recurrence.repeat,
      };
      onRecurrenceChange(_recurrence);
    };

    const onChange = (value: number[]) => {
      const _recurrence = {
        type: recurrence.type,
        repeat: value,
      };
      onRecurrenceChange(_recurrence);
    };

    return (
      <Box sx={{width: "100%"}}>
        <Box sx={{borderBottom: 1, borderColor: "divider"}}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="recurrence selector"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="None" {...a11yProps(0)} />
            <Tab label="Daily" {...a11yProps(1)} />
            <Tab label="Weekly" {...a11yProps(2)} />
            <Tab label="Monthly" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel
          repeat={recurrence.repeat}
          value={value}
          index={1}
          type={RecurrenceType.Daily}
          onChange={onChange}
        />
        <TabPanel
          repeat={recurrence.repeat}
          value={value}
          index={2}
          type={RecurrenceType.Weekly}
          onChange={onChange}
        />
        <TabPanel
          repeat={recurrence.repeat}
          value={value}
          index={3}
          type={RecurrenceType.Monthly}
          onChange={onChange}
        />
      </Box>
    );
  }
;
