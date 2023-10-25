// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

function validateInput(value: string) {
  if (!value) {
    return "No input found.";
  }
  if (!value.includes("<svg")) {
    return "No svg input found.";
  }
  return null;
}

async function cleanSvg(value: string) {
  if (!value) {
    throw new Error("No input found.");
  }

  return value.replace(/.*?<svg/, "<svg");
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"svg-cleaner" is now active!');

  const cleanCommand = vscode.commands.registerCommand(
    "svg-cleaner.clean",
    async () => {
      const value = await vscode.window.showInputBox({
        placeHolder: "Paste your svg here",
        ignoreFocusOut: true,
        validateInput,
      });

      const svgContent = await cleanSvg(value!);

      // find the selected editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return; // No open text editor
      }
      editor.insertSnippet(new vscode.SnippetString(svgContent));
    }
  );

  const cleanClipboardCommand = vscode.commands.registerCommand(
    "svg-cleaner.cleanClipboard",
    async () => {
      const value = await vscode.env.clipboard.readText();
      const svgContent = await cleanSvg(value);

      // find the selected editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return; // No open text editor
      }

      editor.insertSnippet(new vscode.SnippetString(svgContent));
    }
  );

  const svgSvelteComponentSnippetCommand = vscode.commands.registerCommand(
    "svg-cleaner.svgSvelteComponentSnippet",
    async () => {
      const value = await vscode.env.clipboard.readText();
      const svgContent = await cleanSvg(value!);

      // find the selected editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return; // No open text editor
      }

      const svgContentWithoutFillWidthHeight = svgContent.replace(
        /(fill|width|height)=".*?"/g,
        ""
      );

      const svgContentWithSvelteInputParams =
        svgContentWithoutFillWidthHeight.replace(
          /<svg/g,
          `<svg fill={fill} width={width} height={height}`
        );

      editor.insertSnippet(
        new vscode.SnippetString(
          `<script lang="ts">
	export let fill = '#FFF';
	export let width = '100%';
	export let height = '100%';
</script>
		  
${svgContentWithSvelteInputParams}
		  `
        )
      );
    }
  );

  context.subscriptions.push(
    cleanCommand,
    cleanClipboardCommand,
    svgSvelteComponentSnippetCommand
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
