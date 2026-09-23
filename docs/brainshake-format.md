# BrainShake workspace format

`.brainshake` is a ZIP archive containing one portable workspace. Format version 2
contains every board, the selected board, named snapshots, and local media assets.
It is independent of a browser profile or account.

## Archive layout

```text
workspace.brainshake
├── manifest.json
└── media/
    └── <sha256>.<extension>
```

`manifest.json` has this shape:

```json
{
  "format": "brainshake",
  "schemaVersion": 2,
  "id": "workspace-...",
  "name": "My workspace",
  "activeBoardId": "board-...",
  "headSnapshotId": "snapshot-...",
  "boards": [{ "id": "board-...", "name": "Ideas", "objects": [] }],
  "snapshots": [
    {
      "id": "snapshot-...",
      "parentId": null,
      "label": "Original idea",
      "createdAt": "2026-09-22T12:00:00.000Z",
      "activeBoardId": "board-...",
      "boards": [{ "id": "board-...", "name": "Ideas", "objects": [] }]
    }
  ]
}
```

`boards` is the current working copy. A snapshot is an immutable copy of the
whole workspace at a chosen point. `parentId` links it to the checkpoint from
which it was made; restoring an older checkpoint and saving again creates a
new branch in that lineage. `headSnapshotId` is the current working copy's
checkpoint ancestor. The working copy can contain changes made since then.

Local image, video, and HTML media sources using either a Data URL (Base64 or
percent-encoded) or a live Blob URL are replaced in archive JSON with paths
under `media/`. The ZIP stores the original asset bytes directly, so its media
files do not require Base64 encoding. The filename is the SHA-256 digest of the
asset bytes, so identical assets used by multiple boards or snapshots appear
once. Each object also retains its `mediaType`. External URLs remain links and
require network access when the archive is opened elsewhere.

## Browser storage

The working boards are currently autosaved in `localStorage`. Snapshots and
their shared media are saved in IndexedDB. Restoring a snapshot first creates
an automatic checkpoint of the current working copy. Undo/redo is separate
and remains an in-memory, short-lived editing history.

The working copy still inherits the browser's `localStorage` quota. Large
media can make autosave fail even when snapshot storage succeeds; the header
reports this failure. Moving the working copy to IndexedDB is a separate
storage migration.

## Compatibility

The importer also reads older `.brainshake` ZIP files with `board.json` and
legacy JSON board exports. These import into the selected board. Importing a
version 2 archive replaces the current workspace after confirmation. Import
validates all media references and checks that the new working copy fits in
browser storage before replacing saved snapshots. Save, restore, and import
operations are serialized. Unsupported format versions or missing referenced
media are rejected.
