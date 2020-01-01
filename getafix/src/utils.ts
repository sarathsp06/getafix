import * as vscode from "vscode";


export function log(msg: string) {
  console.log("[SARATH] " + msg);
}
 
export function alert(msg: string)  {
  log("sending alert: " + msg);
  vscode.window.showInformationMessage(msg);
}