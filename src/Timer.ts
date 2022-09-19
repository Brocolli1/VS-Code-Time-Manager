import * as vscode from "vscode";

enum timerType {
	Short = 1,
	Long,
	Workday,
	Break, 
}

export class Timer {
	private config = vscode.workspace.getConfiguration("BreakTime");
	private redText: number = 0;

	private myType: timerType = timerType.Short; 

	private intervalID: any = undefined;
	private currentTime: number = 0;
	private running: boolean = false;

	private statusBarItem: vscode.StatusBarItem;
	private statusBarTxt: string;

	private paused: boolean = false;
	private onBreak: boolean = false;

	constructor(statusBarItem: vscode.StatusBarItem, statusBarTxt: string) {
		this.statusBarItem = statusBarItem;
		this.statusBarTxt = statusBarTxt; 
	}

	public message() {
		vscode.window.showInformationMessage(`Time for a break!`, "Take a break", "Ignore").then((selectedItem: string) => {
			if(selectedItem == "Take a break")
				this.takeBreak();
			else
				this.start(0);
		});		
	}

	private setTimer() {
		//set interval that handle the count down
		if(this.myType == timerType.Break) 
			this.statusBarItem.color = "green";

		this.intervalID = setInterval(() => { 
			if (this.currentTime <= 0) {
				if(!this.onBreak)
				{
					this.resetTimer();
					this.message()
				}
				else 
				{
				//	this.panel.dispose();
				}
			} else if (!this.paused) {
				//decrease time and update the text in UI
				this.currentTime--;
				//check settings about last minute to display or not
				if (this.onBreak) {
					this.statusBarItem.text = `On break for the next: ${this.currentTime}`;
				} else {
					this.statusBarItem.text = `Break in: ${this.secToTime(this.currentTime)}`;
				}

				//last tot sec display red text
				const color: string = "firebrick";
				if (this.currentTime < this.redText && this.statusBarItem.color !== color) {
					this.statusBarItem.color = color;
				}
			}
		}, 1000);
	}

	public start(time: number) {
		if (time === 0) {
			//the user stopped the timer
			this.resetTimer();
			return;
		}

		this.currentTime = time;
		this.running = true;

		if (this.intervalID) {
			clearInterval(this.intervalID);
		}

		this.setTimer();
	}

	public pauseTime() {
		this.paused = true;
		this.running = false;
		this.statusBarItem.text = "Paused";
	}

	public continuePaused() {
		this.paused = false;
		this.running = true; 
		this.start(this.currentTime)
	}

	public isPaused() {
		return this.paused;
	}

	public isRunning() {
		return this.running;
	}


	private propagateBreak() {
		
	}

	private takeBreak() {
		this.onBreak = true;
		this.statusBarItem.color = "green";
		this.start(60);
		vscode.commands.executeCommand('exercise.start');
	}

	private resetTimer() {
		this.statusBarItem.text = this.statusBarTxt;
		clearInterval(this.intervalID);
		this.statusBarItem.color = undefined;
		this.currentTime = 0;
		this.intervalID = undefined;
		this.running = false;
		this.statusBarItem.color = undefined;
	}

	private secToTime(totalSecs: number) {
		const hours = Math.floor(totalSecs / 3600);
		const minutes = Math.floor((totalSecs % 3600) / 60);
		const seconds = Math.floor(totalSecs % 60);
		return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}min ` : ""}${totalSecs <= 60 ? `${seconds}sec` : ""}`;
	}
}
