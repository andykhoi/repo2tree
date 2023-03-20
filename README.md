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
}
```

### Credits

This extension was developed by [Andy Tran](https://github.com/andykhoi).

The following third-party libraries were used in this project:

- [vscode](https://github.com/microsoft/vscode) - Visual Studio Code's APIs for extension development.
- [esbuild](https://github.com/evanw/esbuild) - A fast JavaScript bundler and minifier.
- [uglify-js](https://github.com/mishoo/UglifyJS2) - A JavaScript parser, minifier, and mangler.
- [jsonminify](https://github.com/fkei/JSON.minify) - A JavaScript JSON minifier.

### Contributing

Contributions are welcome! If you'd like to contribute to this project, please feel free to submit a pull request or open an issue on the [Repo2Tree](https://github.com/andykhoi/repo2tree). Here are a few ways in which you can contribute:

- Report bugs and errors: If you encounter any bugs or errors while using this extension, please let us know by opening an issue on the GitHub repository.
- Suggest new features: If you have an idea for a new feature that you think would be useful for this extension, please feel free to suggest it by opening an issue on the GitHub repository.
- Contribute code: If you'd like to contribute code to this project, please fork the repository and submit a pull request with your changes.

Thank you for considering contributing to this project! I appreciate your support.