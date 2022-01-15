
# BitBurner Scripts

This is my personal script library for BitBurner (Steam version)

# Installation
```
home; wget https://raw.githubusercontent.com/Ech0-9/Bitburner/main/install.js install.js; run install.js;
```
# Ports

| Port Number | Description           |
| ----------- | -----------           |
| 1           | Load_balancer Listner |
| 2           | Load_Balancer Sender  |
| 3           | Analyzer Listener     |
| 4           | Analyzer Sender       |
| 5           | Logistics Listener    |

# Conventions
- scripts prefixed with "t_" represent an independent task.  These typically require a target server, but should be capable of running independently of anything else, including utils.
- scripts prefixed with "d_" represent daemons.  These are effectively scripts that run forever, as long as their state is maintained, and they do not encounter errors.
- scripts prefixed with "r_" represent reports.  This will print directly to the terminal.
- scripts prefixed with "u_" represent utilities.  These are handy for manual tasks.
