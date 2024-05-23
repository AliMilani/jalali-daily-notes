import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
} from "obsidian";

import moment from "moment-jalaali";

interface PluginSettings {
	dailyNotePath: string;
	templateFilePath: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	dailyNotePath: "",
	templateFilePath: "",
};
const createNewDailyNote = async (plugin: MyPlugin) => {
	const todayJalali = moment().format("jYYYY-jMM-jDD");
	const targetPath = `${plugin.settings.dailyNotePath}/${todayJalali}.md`;
	if (plugin.app.vault.getAbstractFileByPath(targetPath)) {
		new Notice("File already exists");
		return;
	}

	const templatePath = plugin.settings.templateFilePath;
	if (
		!templatePath ||
		!plugin.app.vault.getAbstractFileByPath(templatePath)
	) {
		new Notice("Template file does not exist");
		return;
	}

	await plugin.app.vault.adapter.copy(templatePath, targetPath);
	plugin.app.workspace.openLinkText(targetPath, "", true);
	return;
};
export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(
			"calendar-heart",
			"Create new jalali daily note",
			async (evt: MouseEvent) => {
				await createNewDailyNote(this);
			}
		);

		this.addCommand({
			id: "create-new-jalali-daily-note",
			name: "Create new jalali daily note",
			callback: () => {
				createNewDailyNote(this);
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
			.setName("daily note folder path")
			.setDesc("Enter the path to your daily notes directory")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter the path to your daily notes directory"
					)
					.setValue(this.plugin.settings.dailyNotePath)
					.onChange(async (value) => {
						this.plugin.settings.dailyNotePath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("template path")
			.setDesc("Enter template file path")
			.addText((text) =>
				text
					.setPlaceholder("Enter the path to your template file")
					.setValue(this.plugin.settings.templateFilePath)
					.onChange(async (value) => {
						this.plugin.settings.templateFilePath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
