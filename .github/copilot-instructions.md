# Copilot Instructions – Programming Notes (Android Offline)

## Target
- Android only
- Offline-first
- Deliver signed RELEASE APK

## Must use
- Flutter + Material 3
- Local DB: Drift (SQLite) preferred
- Rich editor: flutter_quill (persist answer as Delta JSON)
- Global search across categories/questions/answers with autosuggest
- Export TXT + JSON, Import JSON restore

## Architecture rules
- Separate data/repositories from UI
- No DB calls directly inside widgets
- Feature folders: categories, notes, search, export_import

## Release
- Configure versionCode/versionName
- Release signing via keystore + key.properties
- README must include: flutter build apk --release and how to install APK