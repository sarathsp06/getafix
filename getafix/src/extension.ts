import * as vscode from "vscode";
import Getafix from "./getafix";
import { log, alert } from "./utils";

const baseURL = "http://34.90.163.182";
//const baseURL = "http://localhost:8080";

function pretty(json :any): any {
  let result = "\n";
  for(var key in json) {
    result = `${result}  ${key} : ${JSON.stringify(json[key])}\n`;
  }
  return result;
}


function RequestItemString(item: any): string {
  return `
- ${item.Method} ${item.URL.Path}
  TimeStamp: ${item.TimeStamp}
  Headers:
  ${pretty(item.Headers)}
  Data:${item.Data}
-`;
}

async function updateData(getafix: Getafix, ed: vscode.TextEditor)  {
  if (ed?.document.isClosed) {
    return;
  }
  let result = await getafix.GetRequests();
  if (result === null) { return;  }

  log(result);
  ed?.edit(async editBuilder => {
    editBuilder.insert(
      new vscode.Position(4, 0),
      result.map((x: any) => `${RequestItemString(x)}`).join("")
    );
    var foldS = await vscode.commands.executeCommand("editor.fold", {
      levels: 1,
      direction: "up"
    });
  });
}

export function activate(ctx: vscode.ExtensionContext) {
  const helloWorld = vscode.commands.registerCommand("getafix.helloworld", () =>
    alert("Hello world!")
  );

  const getafixRegister = vscode.commands.registerCommand(
    "getfix.start",
    async () => {
      let gfx = new Getafix(baseURL);

      let succ = await gfx.NewSession();
      log("creating session:" + succ);
      log("Webhook URL:" + gfx.WebhookURL());

      const doc = await vscode.workspace.openTextDocument();
      await vscode.window.showTextDocument(doc);
      let editor = vscode.window.activeTextEditor;
      if (editor) {
        editor!.edit(editBuilder => {
          editBuilder.insert(
            new vscode.Position(0, 0),
            `${gfx.WebhookURL()}\n\n---------\n\r`
          );
        });
        setInterval(() => {
          updateData(gfx, editor!);
        }, 1000);
      }
    }
  );

  ctx.subscriptions.push(getafixRegister);
  ctx.subscriptions.push(helloWorld);
}

// this method is called when your extension is deactivated
export function deactivate() {
  alert("You can always comeback !!!!");
}