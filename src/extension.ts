import * as vscode from "vscode";
import { Timer } from "./Timer";

function generateAction(timer : Timer, timerCommandId : string, subscriptions : vscode.ExtensionContext) {
	subscriptions.push(
		vscode.commands.registerCommand(timerCommandId, () => {
			//Initialize quickpick
			const quickPick = vscode.window.createQuickPick();

			const quickPickItems: vscode.QuickPickItem[] = [
				{ label: "0 secs" },
				{ label: "1 min" },
				{ label: "5 min" },
				{ label: "10 min" },
				{ label: "20 min" },

			];
			//if the timer is running add an item to stop it
			const stopLabel = "STOP";
			if (timer.isRunning()) {
				quickPickItems.unshift({ label: stopLabel, description: "Stop the timer" });
			}
			const pauseLabel = "PAUSE";
			if (timer.isRunning()) {
				quickPickItems.unshift({ label: pauseLabel, description: "Pause the timer" });
			}
			const continueLabel = "CONTINUE";
			if (timer.isPaused()) {
				quickPickItems.unshift({ label: continueLabel, description: "Countinue the timer" });
			}

			quickPick.items = quickPickItems;

			//user picked
			quickPick.onDidChangeSelection(([item]) => {
				if (item) {
					var time; 
					if(item.label="0 secs") {
						time = 5;
					}
					else
					//set the time picked and start the timer
						time = Number(item.label.split(" ")[0]) * 60;
					if (item.label === stopLabel) {
						time = 0;
					}

					if(item.label === pauseLabel) {
						timer.pauseTime();
					}
					else if(item.label === continueLabel) {
						timer.continuePaused();
					}
					else timer.start(time);
				}
				quickPick.hide();
			});
			quickPick.show();
		}),
	);
}

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("BreakTime"); //user configuration

	if (config.enable === true) {
		let currentPanel: vscode.WebviewPanel | undefined = undefined;
		vscode.commands.registerCommand('exercise.start', () => {
			if (currentPanel) {
			  currentPanel.reveal(vscode.ViewColumn.One);
			} else {
			  currentPanel = vscode.window.createWebviewPanel(
				'exercise',
				'Exercise',
				vscode.ViewColumn.One,
				{
				  enableScripts: true
				}
			  );
			  currentPanel.webview.html = getWebviewContent();
			  currentPanel.onDidDispose(
				() => {
				  currentPanel = undefined;
				},
				undefined,
				subscriptions
			  );

			  currentPanel.webview.onDidReceiveMessage(
				(			message: { command: any; }) => {
				switch (message.command) {
				  case 'ignore':
					currentPanel.dispose();
					return;
				}
			  },
			  undefined,
			  vscode.ExtensionContext.subscriptions
			);
			}
		  })

		const timerStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 299);
		const timerStatusBarTxt: string = `Next short break in: `;

		//Timer
		const shortTimer = new Timer(timerStatusBarItem, timerStatusBarTxt);
		const timerCommandId: string = "ShortTime.start";

		const timerStatusBarItem2: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 299);
		const timerStatusBarTxt2: string = `Long break in: `;

		const longTimer = new Timer(timerStatusBarItem2, timerStatusBarTxt2);
		const longTimerCommandId: string = "LongTime.start";

		generateAction(shortTimer, timerCommandId, subscriptions);
		generateAction(longTimer, longTimerCommandId, subscriptions);

		timerStatusBarItem.command = timerCommandId;
		timerStatusBarItem.text = timerStatusBarTxt;
		timerStatusBarItem.show();
		subscriptions.push(timerStatusBarItem);

		
		timerStatusBarItem2.text = timerStatusBarTxt2;
		timerStatusBarItem2.command = longTimerCommandId;
		timerStatusBarItem2.show();
		subscriptions.push(timerStatusBarItem2);
	}
}

//https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Hamstring_Stretch.gif
//https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Neck_Stretch.gif

function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Cat Coding</title>
	  </head>
	  <body>
	  <image id="exerciseImg" width="420" height="315"
		  src="https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Triceps_Stretch.gif">
	  </image>
	  <br></br>
	  <button name="nextButton" type="button" onclick="nextExercise();">Skip this exercise</button>
	  <button name="ignoreBreak" type="button" onclick="ignore();">Ignore break</button>
	  <script>
			  const vscode = acquireVsCodeApi();
			function nextExercise() {
				document.getElementById('exerciseImg').src="https://images-prod.healthline.com/hlcmsresource/images/topic_centers/Fitness-Exercise/400x400_Stretches_to_Do_at_Work_Every_Day_Neck_Stretch.gif";
			}
			function ignore(){
				vscode.postMessage({
					command: 'ignore',
					text: 'ignore'
				})
			}
	  </script>
	  </body>
  </html>`;
  }

// this method is called when your extension is deactivated
export function deactivate() {}

