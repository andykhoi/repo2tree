# Repo2JSON: Visual Studio Code Extension for Converting Repositories to JSON

This Visual Studio Code extension allows you to convert a repository to JSON and copy it to the clipboard.

## Features

- Convert a repository to a UTF-8 JSON string or a Base64-encoded JSON string.
- Option to minify the JSON string.
- Customizable file extension and directory filters.

## Usage

1. Open a repository in Visual Studio Code.
2. Press `F1` to open the Command Palette.
3. Type "Convert Repository to String" and select the corresponding command.
4. Select a folder in the workspace that you want to convert to a string.
5. Choose an output format (UTF-8 JSON or Base64-encoded JSON).
6. Choose whether to minify the JSON string.
7. Wait for the conversion to complete.
8. The resulting string is copied to the clipboard.

### Configuration

You can create a `.repo2tree` file in the root of your repository to customize the accepted file extensions and ignored directories. The file should contain a JSON object with the following properties:

- `acceptedFileExtensions`: an array of file extensions (including the `.`) that should be included in the string representation. The default value is `[".js", ".jsx", ".ts", ".tsx", ".json"]`.
- `ignoredDirectories`: an array of directory names that should be ignored during the conversion. The default value is `["node_modules", ".git"]`.

Here's an example `.repo2tree` file:

```json
{
  "acceptedFileExtensions": [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".html"
  ],
  "ignoredDirectories": [
    "node_modules",
    ".git",
    "examples",
    "tests"
  ]
}```