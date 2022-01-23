
# BitBurner Scripts V2

This is my personal script library for BitBurner (Steam version)

# Installation
```
home; wget https://raw.githubusercontent.com/Ech0-9/Bitburner/v3/install.js install.js; run install.js;
```
# Ports

| Port Number | Description      |
| ----------- | -----------      |
| 1           | ServerList       |
| 2           | Priority target  |
| 3           | Priortiy Primed  |
| 4           | Logistic Update  |

# Conventions
- scripts prefixed with "t_" represent an independent task.  These typically require a target server, but should be capable of running independently of anything else, including utils.
- scripts prefixed with "d_" represent daemons.  These are effectively scripts that run forever, as long as their state is maintained, and they do not encounter errors.
- scripts prefixed with "r_" represent reports.  This will print directly to the terminal.
- scripts prefixed with "u_" represent utilities.  These are handy for manual tasks.
