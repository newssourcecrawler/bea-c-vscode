import * as vscode from "vscode";
import { execFile } from "child_process";
import * as path from "path";

type ReaderChoice = {
  label: string;
  command: string;
};

const READERS: ReaderChoice[] = [
  { label: "journal", command: "journal" },
  { label: "access-log", command: "access-log" },
  { label: "windows-event", command: "windows-event" },
  { label: "network", command: "network" },
  { label: "storage", command: "storage" },
  { label: "http", command: "http" },
  { label: "compute-probe", command: "probe" },
];

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("beac.readEvidenceFile", async () => {
      await readEvidenceFile("text");
    }),
    vscode.commands.registerCommand("beac.readEvidenceFileJson", async () => {
      await readEvidenceFile("json");
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up. The extension does not run listeners or background work.
}

async function readEvidenceFile(format: "text" | "json"): Promise<void> {
  const pickedFile = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "Select evidence file",
    title: "Select exported evidence file",
  });

  if (!pickedFile || pickedFile.length === 0) {
    return;
  }

  const reader = await vscode.window.showQuickPick(READERS, {
    title: "Choose reader",
    placeHolder: "Select the reader for this exported evidence file",
  });

  if (!reader) {
    return;
  }

  const readerCommand = reader.command;

  const inputPath = pickedFile[0].fsPath;
  const outputPath =
    format === "json"
      ? `${inputPath}.beac.report.json`
      : `${inputPath}.beac.report.txt`;

  const config = vscode.workspace.getConfiguration("beac");
  const binaryPath = config.get<string>("binaryPath", "bea-c");

  const args =
    format === "json"
      ? ["read", readerCommand, "--format", "json", inputPath, "--out", outputPath]
      : ["read", readerCommand, inputPath, "--out", outputPath];

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `bea-c reading ${path.basename(inputPath)}`,
      cancellable: false,
    },
    async () => {
      await runBeac(binaryPath, args);
    }
  );

  const doc = await vscode.workspace.openTextDocument(outputPath);
  await vscode.window.showTextDocument(doc, { preview: false });

  vscode.window.showInformationMessage(
    `bea-c report created: ${path.basename(outputPath)}`
  );
}

function runBeac(binaryPath: string, args: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    execFile(
      binaryPath,
      args,
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 10,
      },
      (error, stdout, stderr) => {
        if (error) {
          const detail = stderr.trim() || stdout.trim() || error.message;
          reject(new Error(`bea-c failed: ${detail}`));
          return;
        }

        resolve();
      }
    );
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(message);
    throw error;
  });
}