import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import {useEffect, useState} from "react";

type MonthlyProps = {
  onChange: (value: number[]) => void;
  repeat: number[];
};

export function Monthly({repeat, onChange}: MonthlyProps) {
  const _state = Array(31).fill(false).map((_, i) => repeat.includes(i + 1));

  const mapStateToData = (state: boolean[]) => {
    let data: number[] = [];
    state.forEach((v, i) => {
      if (v) {
        data.push(i + 1);
      }
    });
    return data;
  };

  const toggleButton = (index: number) => {
    onChange(mapStateToData(_state.map((value, i) => {
      if (i === index) {
        return !value;
      } else {
        return value;
      }
    })));
  };

  return (
    <ToggleButtonGroup color="primary" exclusive sx={{flexWrap: "wrap"}}>
      {_state.map((value, i) => (
        <ToggleButton
          key={`monthly-toggle-button-${i}`}
          value={i}
          selected={value}
          onClick={() => toggleButton(i)}
        >
          {i < 9 ? `0${i + 1}` : `${i + 1}`}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
