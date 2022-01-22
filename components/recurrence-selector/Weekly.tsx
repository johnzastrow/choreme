import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import {useEffect, useState} from "react";

type WeeklyProps = {
  onChange: (value: number[]) => void;
  repeat: number[];
};

export function Weekly({repeat, onChange}: WeeklyProps) {
  // const [state, setState] = useState(Array(7).fill(false).map((_, i) => repeat.includes(i)));
  const _state = Array(7).fill(false).map((_, i) => repeat.includes(i+1))

  const mapStateToRepeatDay = (state: boolean[]) => {
    let data: number[] = [];
    state.forEach((v, i) => {
      if (v) {
        data.push(i + 1);
      }
    });
    return data;
  };

  const toggleButton = (index: number) => {
    // setState((prevState) =>
    //   prevState.map((value, i) => {
    //     if (i === index) {
    //       return !value;
    //     } else {
    //       return value;
    //     }
    //   })
    // );
    onChange(mapStateToRepeatDay(_state.map((value, i) => {
      if (i === index) {
        return !value;
      } else {
        return value;
      }
    })));
  };

  return (
    <ToggleButtonGroup color="primary" exclusive>
      <ToggleButton
        value="mon"
        selected={_state[0]}
        onClick={() => toggleButton(0)}
      >
        Mon
      </ToggleButton>
      <ToggleButton
        value="tue"
        selected={_state[1]}
        onClick={() => toggleButton(1)}
      >
        Tue
      </ToggleButton>
      <ToggleButton
        value="wed"
        selected={_state[2]}
        onClick={() => toggleButton(2)}
      >
        Wed
      </ToggleButton>
      <ToggleButton
        value="thu"
        selected={_state[3]}
        onClick={() => toggleButton(3)}
      >
        Thu
      </ToggleButton>
      <ToggleButton
        value="fri"
        selected={_state[4]}
        onClick={() => toggleButton(4)}
      >
        Fri
      </ToggleButton>
      <ToggleButton
        value="sat"
        selected={_state[5]}
        onClick={() => toggleButton(5)}
      >
        Sat
      </ToggleButton>
      <ToggleButton
        value="sun"
        selected={_state[6]}
        onClick={() => toggleButton(6)}
      >
        Sun
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
