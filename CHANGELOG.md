# Changelog

## 0.3.1 (2021-12-31)

### Build Infrastructure

- The module is now written in TypeScript and bundles SortableJS directly.
  This removes the need for the `_sortablejs` module and reduces the number of files loaded by Foundry.

## 0.3.0 (2021-12-28)

### Compatibility

- Bump compatible core version to V9.

## 0.2.2 (2021-08-06)

### Fixes

- [#7](https://github.com/pyrige/fvtt-keikaku/issues/7)
  Fixes a conflict with styles introduced by the PF1e system.

### Compatibility

- The module is fully compatible with the 0.8.8 stable release.
  Initial testing shows it also works just fine on the V9 prototype.

## 0.2.1 (2021-06-03)

### Compatibility

- The module is fully compatible with the 0.8.6 stable release.

### Minor Changes

- Use `<hr>` as divider between tasks.
  This way custom styles will be used if available.

## 0.2.0 (2021-04-24)

### New Features

- Game Masters can now view other players' to-do lists.
  Entries cannot be modified by anyone but the owner.
  Players can mark individual entries as **secret**, in which case they are omitted from the output.
