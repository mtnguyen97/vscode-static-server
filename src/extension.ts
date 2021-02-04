// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { AddressInfo } from 'net';
import * as express from 'express';
import * as vscode from 'vscode';
import * as cors from 'cors';
import { close, existsSync, fstat } from 'fs';
import { Server } from 'http';
import { on } from 'cluster';

const port = 7357;
let isServing = false;
let server: Server;
let statusBarItem: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "static-live-server" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('static-server.serve', serve);

	let closeCommand = vscode.commands.registerCommand('static-server.stop', stop);

	context.subscriptions.push(disposable, closeCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
	stop();
}

function stop() {
	if (isServing) {
		server.close();
		statusBarItem.dispose();
		isServing = false;
	}
}

async function serve() {
	if (!isServing) {
		let app = express();
		app.use(cors());
		app.get("/*", (req, res) => {
			let dirs = vscode.workspace.workspaceFolders;
			if (dirs?.length) {
				let dir = dirs[0];
				let path = dir.uri.fsPath + req.originalUrl;
				if (existsSync(path)) {
					res.sendFile(path);
					return;
				}
				res.sendStatus(404);
				return;
			}
			res.status(502).send("No folder is open on current VS window. Please open one (File -> Open Folder...).");
		});
		server = app.listen(port);
		server.addListener('error', (err) => onErrorEvent(err, app)).addListener("listening", onListeningEvent);
		isServing = true;
	}
}

function onListeningEvent() {
	let addr = server.address() as AddressInfo;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'static-server.stop';
	statusBarItem.tooltip = 'Click to stop Static Server';
	statusBarItem.text = `$(play) Static Server (:${addr.port})`;
	statusBarItem.show();
	let url = `http://localhost:${addr.port}`;
	vscode.window.showInformationMessage(`Static Server is serving at ${url}`, 'Open').then((s) => {
		switch (s) {
			case 'Open': vscode.env.openExternal(vscode.Uri.parse(url));
		}
	});
}

function onErrorEvent(err: Error, app: express.Express) {
	if (err.name === 'EADDRINUSE') {
		server.close();
		server = app.listen(0).addListener("error", (err: Error) => onErrorEvent(err, app)).addListener("listening", onListeningEvent);
	}
}
