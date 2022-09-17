import * as vscode from "vscode";
import { Timer } from "./Timer";

function generateAction(timer : Timer, timerCommandId : string, subscriptions : vscode.ExtensionContext) {
	subscriptions.push(
		vscode.commands.registerCommand(timerCommandId, () => {
			//Initialize quickpick
			const quickPick = vscode.window.createQuickPick();

			const quickPickItems: vscode.QuickPickItem[] = [
				{ label: "1 min" },
				{ label: "5 min" },
				{ label: "10 min" },
				{ label: "20 min" },
				{ label: "25 min" },
				{ label: "30 min" },
				{ label: "40 min" },
				{ label: "60 min" },
				{ label: "90 min" },
				{ label: "120 min" },
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
					//set the time picked and start the timer
					let time = Number(item.label.split(" ")[0]) * 60;
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

// this method is called when your extension is deactivated
export function deactivate() {}
