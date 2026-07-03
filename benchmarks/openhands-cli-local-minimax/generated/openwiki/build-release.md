# Build & Release

## Binary Build

The CLI is packaged as a standalone executable using **PyInstaller**.

### Build Process

```bash
# Full build (installs PyInstaller, builds, runs binary tests)
./build.sh --install-pyinstaller

# Or step by step:
uv sync --group dev              # install PyInstaller
./build.py                      # build executable
uv run pytest tui_e2e           # run binary tests
```

The build script (`build.py`) runs PyInstaller with `openhands-cli.spec` and then executes `tui_e2e/` tests against the built binary.

### Build Outputs

Built executables land in `dist/`:
```
dist/openhands           # Linux x86_64
dist/openhands.exe       # Windows
dist/openhands-macos     # macOS (universal or platform-specific)
```

### PyInstaller Configuration

- Spec file: `openhands-cli.spec`
- Runtime hooks: `hooks/rthook_profile_imports.py`
- Output: `openhands_cli/` as package in the bundle

## GitHub Actions CI

### Binary Build Workflow

`.github/workflows/cli-build-binary-and-optionally-release.yml`

Builds on every push to `main` and on all PRs. Creates GitHub Release (draft) on tags.

Matrix builds:
| OS | Arch | Artifact |
|----|------|---------|
| Ubuntu 22.04 | x86_64 | `openhands-cli-linux-x86_64` |
| Ubuntu 22.04 ARM | ARM64 | `openhands-cli-linux-arm64` |
| macOS 15 | ARM64 | `openhands-cli-macos-arm64` |
| macOS 15 Intel | x86_64 | `openhands-cli-macos-intel` |

### Version Bump Workflow

`.github/workflows/bump-version.yml`

Triggered manually via GitHub Actions UI. Updates:
1. Version in `pyproject.toml`
2. Regenerates `uv.lock`
3. Updates snapshot tests
4. Opens a draft PR

### Other CI Workflows

| Workflow | Purpose |
|----------|---------|
| `tests.yml` | Unit, integration, snapshot tests |
| `lint.yml` | Ruff linting |
| `type-checking-report.yml` | Pyright type checking |
| `bump-agent-sdk-version.yml` | SDK package version bumps |
| `cli-build-binary-and-optionally-release.yml` | Binary build + release |
| `pypi-release.yml` | PyPI publication |
| `update-install-website.yml` | Updates install.openhands.dev |
| `qa-changes-by-openhands.yml` | Agent-driven QA workflow |
| `check-package-versions.yml` | SDK version consistency checks |
| `stale.yml` | Marks stale issues/PRs |

## Release Procedure

See [`RELEASE_PROCEDURE.md`](../RELEASE_PROCEDURE.md) for the full procedure. Summary:

1. **Trigger version bump**: GitHub Actions → "Bump Version" → enter version (e.g., `1.13.0`)
2. **Wait for CI**: Draft PR auto-opened with version changes
3. **Verify PR**: Review changes, ensure CI passes
4. **Tag release**: On the PR branch, `git tag 1.13.0` (no `v` prefix), push tags
5. **Merge PR**: Wait for CI after tagging, then merge
6. **Publish release**: Edit draft on GitHub Releases page, add notes, publish
7. **Update install website**: Auto-opens PR in `install-openhands-website`; merge it

## Package Publishing (PyPI)

`.github/workflows/pypi-release.yml` publishes to PyPI on version tags.

## Relevant Files

- `build.py` — PyInstaller build script
- `build.sh` — shell wrapper for build
- `openhands-cli.spec` — PyInstaller spec file
- `hooks/` — PyInstaller runtime hooks
- `RELEASE_PROCEDURE.md` — release procedure
- `.github/workflows/` — CI/CD workflows
- `dist/` — built executables (gitignored)
