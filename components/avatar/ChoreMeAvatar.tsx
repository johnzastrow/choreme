import { Avatar, AvatarProps } from "@mui/material";
import React from "react";

export type ChoreMeAvatarProps = AvatarProps & {
  name?: string;
};

export function ChoreMeAvatar({ name, ...props }: ChoreMeAvatarProps) {
  return <Avatar {...stringAvatar(name ?? "")} {...props} />;
}

ChoreMeAvatar.defaultProps = {
  name: "Chore Me",
};

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.substring(0, 2)}`,
  };
}
