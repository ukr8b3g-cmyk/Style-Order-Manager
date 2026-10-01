# Style Order Manager：監査修正の検証記録（2026-10-01）

監査基準は公開mainの`9dbe60a0ecc766fd2a48e43a37335b9e2bd44d05`。8項目の修正を隔離作業コピーに実装した。Neoで22件、reForgeで21件のPythonテストが成功し、ブラウザの4シナリオも成功した。その後、正規化前後のバックアップパスが異なる復元ケースを追加し、両ホストで個別に確認した。

正本候補が3つあるため、実配置への適用は選択待ち。実CSV・実バックアップ・ユーザーの資格情報は変更していない。Forgeは起動しておらず、実Forge画面での確認も未実施。起動中のComfyUIへは操作していない。

## 修正は監査の8項目に限定

|項目|原因|修正と確認|
|---|---|---|
|1. 無関係なCSVの削除|`<stem>_*.csv`を一律に世代整理していた|正式な日時名、通常・manual・pre_restore形式だけを対象にした。不正な日付・別名・シンボリックリンクを除外。`styles_custom.csv`の保持と旧形式の認識を確認。|
|2. 新しいバックアップの即削除|`copy2`が元CSVのmtimeを引き継ぎ、mtimeで順序を判断していた|名前の日時で整理し、6桁の小数秒・排他的作成・最新名より後の日時を使用。新規ファイルを明示的に保持し、存在も検査。古いmtime・未来日時の既存ファイルを含むケースで確認。|
|3. 復元失敗で元CSVを破壊|バックアップを現在CSVへ直接コピーしていた|同じディレクトリの一時ファイルをコピー・flush/fsync・検証後、`os.replace`で置換。部分コピー失敗・置換失敗で元CSVが一致し、安全用コピーも残る。CSV不在からの復元、保持件数1、`..`を含む保存先も確認。|
|4. 保存中の編集喪失|行操作は有効なままで、遅い保存応答が編集状態を置換した|全行入力・ボタン・dragを無効化し、イベント処理にもbusy判定を追加。非同期貼り付けも完了までbusyを保持。遅延保存中の合成input/click/drag/dropと貼り付け競合をブラウザで確認。|
|5. 一覧更新と復元警告|復元後のStyles更新、保存後のbackup更新、dirty警告が欠けていた|Save/Restore後の両タブのrefresh呼出し、Save後のbackup一覧取得、未保存Restoreの明示警告を追加。警告取消時に編集が残ることも確認。|
|6. 複数タブの上書き|古い全件saveを無条件に受け付けた|読込したCSVバイト列のSHA-256をrevisionとして返し、Save/Restoreで一致を必須にした。ロック内と置換直前に再確認し、差異・revision欠落は409。古いタブ・外部変更・一時ファイル作成中の変更を拒否し、UIのdraftを保持。|
|7. subpathでAPIへ届かない|API_BASEがroot絶対パスだった|Gradioのrootとpathnameによる補完でURLを生成。root・`/forge`・多階層subpath・絶対root・root未設定をブラウザで確認。|
|8. 認証を迂回|全7 custom endpointに認証dependencyがなかった|全APIを同じAPIRouterに登録し、UIは実際のGradio `/login_check`、API-onlyはホスト `/sdapi/v1/options`のdependency graphを再利用。未知契約は登録前に拒否。匿名・偽Cookie・失効Cookie・誤Basicを拒否し、正式Cookie・正しいBasicで全7操作が成功。|

CSVの対応ヘッダーは従来どおり`name,prompt,negative_prompt`。Unicode・BOM・カンマ・引用符・改行の往復、重複名・不正ヘッダーの拒否、backup名のpath traversal防止も維持した。ホストの再読込が保存後に失敗した場合は、CSVが確定済みであることを成功応答と再起動案内で伝える。

## 旧コードの不具合も一時データで再現

変更前スナップショットのPythonを、同じ隔離条件で実行した結果：

- 認証ありのGradioで、ホスト`/login_check`は401、拡張`/styles`は200。
- 世代整理で`styles_custom.csv`が削除され、成功応答のbackup_fileが存在しない。
- 現在CSVがないと正当なバックアップでも復元は404。
- 復元先へ部分コピー後の例外を注入すると500になり、元CSVは`partial`で破損。
- 古いrevisionを付けた全件saveも200になり、新しい編集が上書きされた。

これらは実ファイルではなくTemporaryDirectory内のCSVで再現した。修正版では対応する回帰テストが成功している。

## Neo/ReForgeの実装に合わせて認証を検証

|ホスト|ローカル本体HEAD|依存環境|結果|
|---|---|---|---|
|Forge-Neo|`c3b4291a73ccffe91964e0a9f7772e75ee4d629d`|Gradio 4.40.0 / FastAPI 0.127.1 / httpx 0.28.1|全体22件成功。追加パス正規化テスト1件成功。|
|Forge-Neo2|同上|Gradioのroutes.pyはNeoとSHA-256一致|独立レビューで認証6件成功。全体テストは未実施。|
|reForge|`739b2e1d9ab63160eaff9c8f73172c8da68424e1`|Gradio 3.41.2 / FastAPI 0.94.0 / httpx 0.24.1|全体21件成功・1件スキップ。追加パス正規化テスト1件成功。|

スキップはGradio 3に存在しない外部`auth_dependency`機能だけ。通常ログイン、secure/unsecure Cookie、失効、API専用Basic認証は両バージョンで確認した。テスト用資格情報はテスト内に作成し、ユーザーの設定や資格情報は読み込んでいない。API専用テストは本体の認証・ルート登録メソッドをASTで取り出し、GPUコードのimportを避けて実行した。

根拠は各インストールの`webui.py`、`modules/api/api.py`、`modules/script_callbacks.py`、`venv/Lib/site-packages/gradio/routes.py`。UIのコールバックはGradio起動後、API-onlyのコールバックは本体API登録後に呼ばれる。Cookie名を固定せず、FastAPIがホストの入れ子dependencyを実行する。調査と修正候補の独立レビューを1回ずつ行い、具体的な認証迂回・通常操作の退行は見つからなかった。

一次資料：[Neo本体](https://github.com/Haoming02/sd-webui-forge-classic)、[reForge本体](https://github.com/Panchovix/stable-diffusion-webui-reForge)、[Gradioの認証連携仕様](https://www.gradio.app/guides/sharing-your-app)。本記録の互換判断は上記のローカルHEADとインストール済み依存を対象とする。

## 再実行は実データを使わずに行える

拡張ルートから次のコマンドを実行する。pytestや新規パッケージの追加は不要。

```powershell
$env:GRADIO_ANALYTICS_ENABLED='False'
& D:\StabilityMatrix\Data\Packages\Forge-Neo\venv\Scripts\python.exe -B tests\test_style_order_manager.py
& D:\StabilityMatrix\Data\Packages\reForge\venv\Scripts\python.exe -B tests\test_style_order_manager.py
node --check javascript\style_order_manager.js
node --check tests\test_style_order_manager_ui.cjs
node tests\test_style_order_manager_ui.cjs
```

ブラウザテストは既存のPlaywrightを使い、Edgeをheadlessで起動する。APIは全てインターセプトするため、Forgeへは接続しない。Pythonのテストデータは終了時に削除し、ブラウザもfinallyで閉じる。常駐バックエンドは新規起動していない。

## 正本選択後に実配置へ適用する

正本候補は`D:\StabilityMatrix\Data\Packages\{Forge-Neo,Forge-Neo2,reForge}\extensions\Style-Order-Manager`。いずれも`main...origin/main`、HEADは監査基準と一致し、`git status --short`は空。候補配下と関連する上位に追加のAGENTS.md・プロジェクトskillは見つからなかった。ユーザー共通ルールとD:\Codexのルール、Codexのメモリ概要を確認した。

変更前スナップショットは`D:\Codex\_snapshots\Style-Order-Manager\20261001-before-audit-fixes\`。各候補ごとに追跡ファイル8件をコピーし、全件のSHA-256一致を確認した。`SOURCE_SHA256.txt`・`GIT_STATUS.txt`・`BASE_REVISION.txt`を併記した。実CSVと実バックアップは含めていない。

既存のForgeプロセスがないため、実画面でStylesの選択肢が更新されるところまでは確認していない。ブラウザテストで確認したのは正式なrefreshボタンのclickと拡張DOMの動作。GPU生成、ホストの再起動、認証・network設定の変更、コミット・プッシュ・公開は行っていない。

競合検知は拡張の1プロセス内の排他と内容hashによる。ホスト本体・外部エディタ・別プロセスとのOS全体の排他ではなく、最終hash確認とreplaceの間には競合の余地が残る。また、旧backupには所有者metadataがないため、正式な日時名は予約形式として扱う。これらの限界を両READMEに記載した。

実配置への適用前に、対象の状態とスナップショットのhashを再確認する。適用先の選択後、変更対象だけをコピーし、`git diff --check`・`--stat`・`status`と変更ファイルhashを確認する。
