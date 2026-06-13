# bea-c

bea-c is a local evidence reader for exported logs and transcripts.

Open an exported evidence file, choose the matching reader, and generate a source-backed report inside VS Code.

## What bea-c reads

bea-c works with files you already exported from tools you use, including:

- service logs
- access logs
- Windows event exports
- network command transcripts
- storage command output
- HTTP transcripts
- compute probe output

bea-c does not collect live logs or connect to remote systems.

## Commands

- `bea-c: Read Evidence File`
- `bea-c: Read Evidence File as JSON`

## Supported readers

- journal
- access-log
- windows-event
- network
- storage
- http
- compute-probe

## How it works

1. Run `bea-c: Read Evidence File` from the Command Palette.
2. Select an exported evidence file.
3. Choose the reader that matches the file.
4. bea-c runs the local command-line tool.
5. The generated report opens in VS Code.

Text reports are written next to the selected file as:

```text
<file>.beac.report.txt
```

JSON reports are written next to the selected file as:

```text
<file>.beac.report.json
```

## Local command setting

This extension requires the local `bea-c` command-line tool.

If `bea-c` is not available on your PATH, set `beac.binaryPath` to the full path of the local binary.

Example:

```json
{
  "beac.binaryPath": "/path/to/bea-c"
}
```

## Privacy and boundary

bea-c is local-first. The extension reads the file you select, runs a local command, writes a local report, and opens that report in VS Code.

No live collection. No monitoring. No remote log access. No cloud upload.