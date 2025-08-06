import * as vscode from 'vscode';
import * as path from 'path';

let panel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  const diag = vscode.languages.onDidChangeDiagnostics(() => {
    const allDiagnostics = vscode.languages.getDiagnostics();
    let errorCount = 0;

    allDiagnostics.forEach(([uri, diags]) => {
      errorCount += diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
    });

    vscode.window.showInformationMessage(`Triggered: ${errorCount} errors`);

    const meme = getMemeForBugCount(errorCount);
    showMeme(context, meme);
  });

  context.subscriptions.push(diag);
}

function showMeme(context: vscode.ExtensionContext, memeFile: string) {
  // Reuse panel if it already exists
  if (panel) {
    const memePath = vscode.Uri.file(path.join(context.extensionPath, 'memes', memeFile));
    const memeSrc = panel.webview.asWebviewUri(memePath);
    panel.webview.html = `<html><body><img src="${memeSrc}" style="width:100%;"></body></html>`;
    panel.webview.postMessage({ type: 'update', memeSrc });

  } else {
    panel = vscode.window.createWebviewPanel(
      'bugMeme',
      'Bug Meme',
      vscode.ViewColumn.Two,
      {}
    );

    const memePath = vscode.Uri.file(path.join(context.extensionPath, 'memes', memeFile));
    const memeSrc = panel.webview.asWebviewUri(memePath);
    panel.webview.html = `<html><body><img src="${memeSrc}" style="width:100%;"></body></html>`;

    panel.onDidDispose(() => {
      panel = undefined; // Reset when closed
    });
  }
}

function getMemeForBugCount(count: number): string {
  if (count === 0) return 'okay.png';
  if (count < 5) return 'um.png';
  if (count < 10) return 'worse.png';
  return 'worst.png';
}

export function deactivate() {}
