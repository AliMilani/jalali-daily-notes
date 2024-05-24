import {
	App,
	normalizePath,
	TAbstractFile,
	TFile,
	TFolder,
	Vault,
} from "obsidian";

export function resolveFolder(folderPath: string): TFolder {
	folderPath = normalizePath(folderPath);

	const folder = app.vault.getAbstractFileByPath(folderPath);
	if (!folder) {
		throw new Error(`Folder ${folderPath} does not exist`);
	}
	if (!(folder instanceof TFolder)) {
		throw new Error(`${folderPath} is not a folder`);
	}

	return folder;
}

export function getFilesFromFolder(folder_str: string): Array<TFile> {
	const folder = resolveFolder(folder_str);

	const files: Array<TFile> = [];
	Vault.recurseChildren(folder, (file: TAbstractFile) => {
		if (file instanceof TFile) {
			files.push(file);
		}
	});

	files.sort((a, b) => {
		return a.basename.localeCompare(b.basename);
	});

	return files;
}

export const isFileExist = (vault: Vault, path: string) => {
	return vault.getAbstractFileByPath(path) !== null;
};

export const openNote = async (app: App, path: string) => {
	await app.workspace.openLinkText(path, "", true);
};

export const copyNote = async (app: App, src: string, dest: string) => {
	await app.vault.adapter.copy(src, dest);
};
