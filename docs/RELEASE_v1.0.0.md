# v1.0.0 — Backup completion and restore selection fixes

- A successful CSV save/restore stays successful when deleting older backups fails. The response returns the committed styles and revision, attempts the host reload, and reports a separate cleanup warning. Manual backups distinguish a completed copy from failed retention too.
- Changing the backup folder immediately clears the previous selection. Restore stays disabled while loading or after a failed list request. The selected list is bound to its verified absolute folder, which is shown in the confirmation dialog and used for restore.
- Revision conflicts, failed replacement, safety backups and host authentication keep their existing safeguards.

## 日本語

- CSV保存・復元が確定した後の世代整理失敗を、操作全体の失敗として返さないよう修正しました。確定内容とrevisionを返し、ホスト更新を試みたうえで、整理失敗を警告として表示します。手動バックアップも、コピー成功と整理失敗を区別します。
- 保存先の入力で旧選択を即無効化し、一覧取得中・取得失敗時はリストアできないよう修正しました。選択した一覧と取得元フォルダーを紐づけ、確認画面にフォルダーを表示します。同名バックアップを別フォルダーから誤って復元する経路を防ぎます。
- revision競合検出、置換失敗時の保護、安全用バックアップ、ホスト認証の既存動作を維持します。

## Updating / 更新

Keep your `styles.csv`, backup folders, host settings and browser preferences. Installation does not rewrite or migrate them. Keep a copy of any local extension changes before updating.

`styles.csv`、バックアップ保存先、本体設定、ブラウザーの設定は保持してください。インストール時の書き換え・移行はありません。拡張に個人変更がある場合は、更新前に別途保管してください。

The Python update takes effect after your next normal Forge Neo/reForge restart and browser refresh. Updating these files does not restart the host automatically.

Pythonの更新は、次回ご自身でForge Neo／reForgeを通常再起動し、ブラウザーを再読み込みすると有効になります。自動再起動は行いません。

## Validation / 検証

- Local: 31 Python tests, including six host-authentication tests; four existing and eight new isolated Edge browser scenarios passed.
- CSV/backup tests use temporary files and real Gradio/FastAPI/TestClient. Host reload calls are observed through a test double. Browser API requests are intercepted and never reach a user's host.
- Includes retention failures, stale revisions, failed replacement, A→B→A response reversal, same-name backups, partially typed paths, list failure, draft preservation and post-warning saves.
- Live Forge/ReForge UI, actual Windows file locking and GPU generation are separate checks and were not performed for this fix.

Python31件（認証6件を含む）と独立Edge12シナリオが成功しました。実稼働ホストの画面・他アプリによる実ファイルロック・GPU生成の成功を意味するものではありません。
