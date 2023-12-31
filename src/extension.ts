// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HomePanel } from './HomePanel';
import { SidebarProvider } from './SidebarProvider';
import * as child_process from 'child_process';
import { docPR } from './utils';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext ) {

	const API_KEY = ""
	console.log('Congratulations, your extension "vspr" is now active!');
	const sidebarProvider = new SidebarProvider(context.extensionUri);

	// const icon=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	// icon.text="$(smiley)";
	// icon.command="vspr.askQuestion";
	// icon.show();

  	context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vspr-sidebar",
      sidebarProvider
    )
  );
	context.subscriptions.push(
		vscode.commands.registerCommand("vspr.refresh",async()=>{
			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand("vspr-sidebar.focus");
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("vspr.DocPR", async() => {
			// Get all git changes from source control using vscode api
			let changes: any =[];
			try {
                // Get the current workspace folder
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

                if (workspaceFolder) {
                    const gitCommand = 'git diff HEAD --name-only';

                    // Run the git command to get a list of changed files
                    const changedFiles = child_process
                        .execSync(gitCommand, { cwd: workspaceFolder.uri.fsPath })
                        .toString()
                        .split('\n')
                        .filter(Boolean);

                    // Iterate through changed files and get detailed changes
                    for (const file of changedFiles) {
                        const fileDiffCommand = `git diff HEAD -- ${file}`;

                        // Run the git diff command for each file
                        const fileDiff = child_process
                            .execSync(fileDiffCommand, { cwd: workspaceFolder.uri.fsPath })
                            .toString();
						
                        // Log or process the detailed changes for the file
						changes.push({
							"Changes for file": file,
							"Changes": fileDiff,
						});
                    }
					console.log(changes);
					let changesString ="";
						console.log(changes, "changes");
						changes.forEach((element:any) => {
							changesString += JSON.stringify(element);
						});
					await vscode.window.withProgress({
						location: vscode.ProgressLocation.Notification,
						title: "Generating documentation...",
						cancellable: true,
					}, async () => {
						const results = await docPR(changesString,API_KEY);

						// Add a trademark to the end of the results
						const finalResults = results +  "\n\n---\n\n*Generated with [VSPR] by GS *";


						const doc = await vscode.workspace.openTextDocument({
							content: finalResults,
							language: 'markdown',
						});

						await vscode.window.showTextDocument(doc, {
							viewColumn: vscode.ViewColumn.Beside,
							preserveFocus: true,
							preview: true,
						});
						
					});

					await vscode.window.showInformationMessage('PR generated successfully!');

					// Close the sidebar
					await vscode.commands.executeCommand("workbench.action.closeSidebar");

                } else {
                    vscode.window.showWarningMessage("No workspace folder found.");
                }
            } catch (error) {
                console.error("Error getting git changes:", error);
                vscode.window.showErrorMessage("Error getting git changes. Please try again.");
            }

		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
