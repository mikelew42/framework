# ext/File/0 — File0

`File0` is the original file-persistence class. It mixes path resolution,
HTTP fetch, and socket transport into a single object. Kept for backwards
compat. New code should use `FileSaver` at `ext/File/FileSaver.js` instead.
