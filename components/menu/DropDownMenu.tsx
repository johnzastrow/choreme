import SendIcon from "@mui/icons-material/Send";
import List, { ListProps } from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { signOut } from "next-auth/react";

export function DropDownMenu(props: ListProps) {
  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Menu
        </ListSubheader>
      }
      {...props}
    >
      <ListItemButton onClick={() => signOut({ callbackUrl: "/auth" })}>
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}
