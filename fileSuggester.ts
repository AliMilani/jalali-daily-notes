// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TFile } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { getFilesFromFolder } from "utils";

export class FileSuggest extends TextInputSuggest<TFile> {
	constructor(public inputEl: HTMLInputElement) {
		super(inputEl);
	}

	getSuggestions(input_str: string): TFile[] {
		const allFiles = getFilesFromFolder("");

		return allFiles
			.filter((file) =>
				file.path.toLowerCase().contains(input_str.toLowerCase())
			)
			.slice(0, 1000);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path;
		this.inputEl.trigger("input");
		this.close();
	}
}
