import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export function Daily() {
  return (
    <ToggleButtonGroup color="primary" exclusive>
      <ToggleButton value="mon" selected>
        Mon
      </ToggleButton>
      <ToggleButton value="tue" selected>
        Tue
      </ToggleButton>
      <ToggleButton value="wed" selected>
        Wed
      </ToggleButton>
      <ToggleButton value="thu" selected>
        Thu
      </ToggleButton>
      <ToggleButton value="fri" selected>
        Fri
      </ToggleButton>
      <ToggleButton value="sat" selected>
        Sat
      </ToggleButton>
      <ToggleButton value="sun" selected>
        Sun
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
