import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
} from "obsidian";
import moment from "moment-jalaali";
import { FolderSuggest } from "folderSuggester";
import { FileSuggest } from "fileSuggester";
import { isFileExist, openNote, copyNote } from "utils";

interface PluginSettings {
	dailyNotePath: string;
	templateFilePath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	dailyNotePath: "",
	templateFilePath: "",
};

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(
			"calendar-heart",
			"Create new jalali daily note",
			async (evt: MouseEvent) => {
				await this.createNewDailyNote();
			}
		);

		this.addCommand({
			id: "create-new-jalali-daily-note",
			name: "Create new jalali daily note",
			callback: () => {
				this.createNewDailyNote();
			},
		});

		this.addSettingTab(new defaultSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createNewDailyNote() {
		const todayJalali = moment().format("jYYYY-jMM-jDD");
		const targetPath = `${this.settings.dailyNotePath}/${todayJalali}.md`;

		if (isFileExist(this.app.vault, targetPath)) {
			new Notice("File already exists");
			openNote(this.app, targetPath);
			return;
		}

		const templatePath = this.settings.templateFilePath;
		if (!templatePath || !isFileExist(this.app.vault, templatePath)) {
			new Notice("Template file does not exist");
			return;
		}

		await copyNote(this.app, templatePath, targetPath);

		await openNote(this.app, targetPath);
		return;
	}
}

class defaultSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Daily note folder path")
			.setDesc("Enter the path to your daily notes directory")
			.addSearch((cb) => {
				new FolderSuggest(cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.dailyNotePath)
					.onChange((dailyNotePath) => {
						this.plugin.settings.dailyNotePath = dailyNotePath;
						this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName("Template path")
			.setDesc("Enter template file path")
			.addSearch((cb) => {
				new FileSuggest(cb.inputEl);
				cb.setPlaceholder("Example: folder1/template_file")
					.setValue(this.plugin.settings.templateFilePath)
					.onChange((templateFilePath) => {
						this.plugin.settings.templateFilePath =
							templateFilePath;
						this.plugin.saveSettings();
					});
			});
	}
}
