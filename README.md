# static-server README

This is a simple static server serving static files (HTML, CSS, JS, WASM,...) inside the current folder **without** live-reload feature.

It is also my first extenstion for vscode so I will keep it as simple as possible. 

Please feel free to leave feedback at my [github repository](https://github.com/mtnguyen97/vscode-static-server).

Thank you!

## Features

To start serving, go `View` -> `Command Pallette` -> type `> Static Server: Serve` and press `Enter`.

To stop current server, go `View` -> `Command Pallette` -> type `> Static Server: Stop` and press `Enter`.

The server uses port 7357 as default. If that port is in use, it will use another random port (shown on status bar).

It always serves files inside the **first** workspace folder. If no folder is open, the response status code will be 502.

