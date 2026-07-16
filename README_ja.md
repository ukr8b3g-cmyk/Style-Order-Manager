# Style Order Manager

[English README](README.md)

![WebUIのExtensionsタブに表示したStyle Order Manager](docs/images/extensions-tab.png)

Forge Neo、ReForge、その他のAutomatic1111系WebUIで使える、`styles.csv`の並び順管理ツールです。ドラッグ＆ドロップによる順番変更を主機能にしています。

Style Order Managerは、大量の`styles.csv`でも各スタイルをコンパクトな一行表示で見やすくし、順番変更を軽快に行えることを重視して作りました。検索、編集、追加、削除、保存、バックアップ、リストアなど最低限必要な機能に絞った軽量ツールで、高度な管理機能はあえて多く搭載していません。

スタイル数が多い`styles.csv`をテキストエディターで直接編集すると、順番や内容を把握しにくくなるため、この拡張機能を作成しました。多機能化せず、スタイルの順番と内容を見やすく確認できることに重点を置いています。

## 対応状況

- Forge Neo: 現在の開発環境で動作確認済み
- ReForge: 動作確認済み
- Automatic1111: 標準的な拡張APIを使用。未確認

## 主な機能

- ドラッグ＆ドロップによるスタイル並べ替え
- 検索、追加、削除、`name`・`prompt`・`negative_prompt`の編集
- 通常時はコンパクト表示、クリック時のみポジティブ／ネガティブ内容を表示
- 未保存変更の表示と明示的な保存操作
- 保存前バックアップ、保存先選択、残す件数の指定
- バックアップ一覧とリストア
- ダーク／ライトテーマに対応した入力欄
- 英語を初期値とした `EN / JA` 切り替え

## 必要条件

- Forge Neo、ReForge、またはAutomatic1111系の対応WebUI
- ヘッダー `name,prompt,negative_prompt` の標準 `styles.csv`
- 追加のPythonパッケージは不要

## インストール方法

### Extensionsタブからインストール

1. WebUIの **Extensions** → **Install from URL** を開きます。
2. 次のURLを入力します。

   `https://github.com/ukr8b3g-cmyk/Style-Order-Manager`

3. インストール後、WebUIに変更を適用して再起動し、**Style Order Manager** タブを開きます。

### 手動インストール

PowerShellまたはコマンドプロンプトで、WebUIの`extensions`フォルダへcloneします。

```powershell
git clone https://github.com/ukr8b3g-cmyk/Style-Order-Manager.git <webui-directory>\extensions\style-order-manager
```

インストール後にWebUIを再起動してください。

## 使い方

1. **Style Order Manager** タブを開きます。
2. `☷` のハンドルをドラッグして順番を変更します。
3. カードをクリックすると内容確認と編集ができます。
4. **Save** を押すと、新しい順番と編集内容が`styles.csv`へ保存されます。

CSVヘッダーは`name,prompt,negative_prompt`のまま維持されます。

保存後は、WebUI本体のStyles欄にある**更新（リフレッシュ）ボタン**（円形矢印のボタン）を押すと、変更したスタイル一覧がプロンプト画面へ反映されます。必要に応じて、Style Order Managerの**Reload list**も使用してください。

### プロンプト編集画面を開く

WebUIのプロンプト操作欄にある**鉛筆アイコン**を押すと、プロンプト／スタイルの編集画面が開きます。

![鉛筆アイコンから開くプロンプト編集画面](docs/images/prompt-editor.png)

## バックアップとリストア

バックアップは初期値ON、10件保持です。標準の相対パスは次のとおりです。

```text
styles_backups
```

このフォルダは`styles.csv`と同じフォルダ内に作成されます。`styles.csv`がWebUIルートにある場合、実際の保存先は`<webui-directory>\styles_backups`です。

リストア前には、現在の`styles.csv`を安全用バックアップとして保存します。指定件数を超えた古いバックアップは自動削除されます。

## 拡張機能の構成

```text
style-order-manager/
├─ javascript/style_order_manager.js
├─ scripts/style_order_manager.py
├─ docs/images/extensions-tab.png
├─ docs/images/prompt-editor.png
├─ style.css
├─ README.md
├─ README_ja.md
└─ .gitignore
```

追加のインストーラー`install.py`は不要です。WebUIとPython標準ライブラリだけを使用します。

## 拡張機能一覧への登録

WebUIのExtensionsタブに表示するには、リポジトリ公開後、外部の拡張機能インデックスへリポジトリURL、表示名、説明、日付、`tab`・`UI related`などのタグを登録します。これはリポジトリ内のファイルとは別の作業です。
