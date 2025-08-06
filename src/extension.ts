import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Listen for any change in diagnostics (errors, warnings)
  const diag = vscode.languages.onDidChangeDiagnostics(() => {
    const allDiagnostics = vscode.languages.getDiagnostics();
    let errorCount = 0;

    allDiagnostics.forEach(([uri, diags]) => {
      errorCount += diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
    });

    // Debug popup to confirm it’s triggering
    vscode.window.showInformationMessage(`Triggered: ${errorCount} errors`);

    // Pick a meme file based on error count
    let meme = getMemeForBugCount(errorCount);

    // Show the meme in a new webview tab
    showMeme(context, meme);
  });

  context.subscriptions.push(diag);
}

function showMeme(context: vscode.ExtensionContext, memeFile: string) {
  const panel = vscode.window.createWebviewPanel(
    'bugMeme',
    'Bug Meme',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'memes'))]
    }
  );

  const memePath = vscode.Uri.file(
    path.join(context.extensionPath, 'memes', memeFile)
  );

  const memeSrc = panel.webview.asWebviewUri(memePath);

  panel.webview.html = `
    <html>
      <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: black;">
        <img src="${memeSrc}" style="max-width: 100%; max-height: 100%;" />
      </body>
    </html>
  `;
}

function getMemeForBugCount(count: number): string {
  if (count === 0) return 'okay.png';
  if (count < 5) return 'um.png';
  if (count < 10) return 'worse.png';
  return 'worst.png';
}

export function deactivate() {}
