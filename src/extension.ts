import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as esbuild from 'esbuild';
import { minify } from 'uglify-js';
import jsonminify from 'jsonminify';

function minifyFileContents(contentsString: string, fileExtension: string, shouldMinify: boolean): string {
	if (!shouldMinify) {
		return contentsString;
	  }
	if (fileExtension === '.js' || fileExtension === '.ts') {
	  const result = minify(contentsString);
	  return result.code || contentsString;
	} else if (fileExtension === '.json') {
	  return jsonminify(contentsString);
	} else if (fileExtension === '.tsx' || fileExtension === '.jsx') {
	  const result = esbuild.transformSync(contentsString, {
		loader: 'tsx',
		minify: true,
		target: 'es2018',
	  });
	  return result.code || contentsString;
	}
	return contentsString;
  }


  async function askForMinification(): Promise<boolean> {
	const minifyItems = [
	  { label: 'Yes', value: true },
	  { label: 'No', value: false },
	];
  
	const selectedOption = await vscode.window.showQuickPick(minifyItems, {
	  placeHolder: 'Do you want to minify the files?',
	});
  
	return selectedOption?.value || false;
  }
  

  async function askForOutputFormat(): Promise<{ format: string; maxLineLength: number }> {
	const outputFormatItems = [
	  { label: 'UTF-8 JSON string', value: 'utf-8' },
	  { label: 'Base64 encoded JSON string', value: 'base64' },
	];
  
	const selectedFormat = await vscode.window.showQuickPick(outputFormatItems, {
	  placeHolder: 'Choose an output format',
	});
  
	const outputFormat = selectedFormat?.value || 'utf-8';
  
	let maxLineLength = 4000;
  
	if (outputFormat === 'base64') {
	  const inputOptions: vscode.InputBoxOptions = {
		prompt: 'Enter the maximum character length per line (must be a multiple of 4, default is 4000)',
		value: '4000',
		validateInput: (value) => {
		  const intValue = parseInt(value);
		  if (isNaN(intValue) || intValue % 4 !== 0) {
			return 'Value must be a multiple of 4';
		  }
		  return null;
		},
	  };
  
	  const input = await vscode.window.showInputBox(inputOptions);
	  maxLineLength = parseInt(input as string) || 4000;
	}
  
	return { format: outputFormat, maxLineLength: maxLineLength };
  }

function readDirectoryContents(
	dirPath: string,
	basePath: string,
	shouldMinify: boolean,
	allowedExtensions: string[],
	ignoreDirectories: string[]
): any[] {

	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
	return entries.flatMap((entry) => {
	  const fullPath = path.join(dirPath, entry.name);
	  const relativePath = path.relative(basePath, fullPath);
  
	  if (entry.isDirectory()) {
		if (ignoreDirectories.includes(entry.name)) {
			return [];
		}
		return {
		  type: 'directory',
		  path: relativePath,
		  children: readDirectoryContents(fullPath, basePath, shouldMinify, allowedExtensions, ignoreDirectories),
		};
	  } else if (entry.isFile()) {
		const fileExtension = path.extname(entry.name);
  
		if (allowedExtensions.includes(fileExtension)) {
			const contents = fs.readFileSync(fullPath);
			const contentsString = Buffer.from(contents).toString('utf-8');
			const minifiedContents = minifyFileContents(contentsString, fileExtension, shouldMinify);
			return {
			  type: 'file',
			  path: relativePath,
			  children: minifiedContents,
			};
		  }		
		return [];
	  }
	  return [];
	});
  }
  
function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.repo2tree', async () => {
    try {
      // Get the root folder of the workspace
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
      }

      // Ask the user to select a folder in the workspace
      const folderUri = await vscode.window.showWorkspaceFolderPick();
      if (!folderUri) {
        vscode.window.showErrorMessage('No folder selected.');
        return;
      }

	   // Read configuration from the repository, if available
	   const configPath = path.join(folderUri.uri.fsPath, '.repo2treerc');
	   let config = {
		 acceptedFileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
		 ignoredDirectories: ['node_modules'],
	   };
   
	   try {
		 if (fs.existsSync(configPath)) {
		   const configFileContents = fs.readFileSync(configPath, 'utf-8');
		   const configFileData = JSON.parse(configFileContents);
		   config = { ...config, ...configFileData };
		 }
	   } catch (error) {
		 vscode.window.showErrorMessage(`Error reading configuration file: ${(error as Error).message}`);
		 return;
	   }

	// Ask the user to choose an output format
	const outputFormat = await askForOutputFormat();

	// Ask the user whether to minify the code
	const shouldMinify = await askForMinification();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Converting Repository to String',
          cancellable: false,
        },
        async (progress) => {
          // Read all files and folders in the selected directory and build a tree-like structure
          progress.report({ message: 'Reading directory contents...' });
          const treeStructure = readDirectoryContents(
			folderUri.uri.fsPath,
			folderUri.uri.fsPath,
			shouldMinify,
			config.acceptedFileExtensions,
          	config.ignoredDirectories
		);

          // Create a metadata object for the tree structure
          progress.report({ message: 'Creating metadata object...' });
          const repositoryName = path.basename(folderUri.uri.fsPath);

          const metadata = {
            repositoryName,
            description: 'Formatted repository tree for AI models',
            tree: treeStructure,
          };

          // Format the tree structure
          progress.report({ message: 'Formatting tree structure...' });
			const jsonString = JSON.stringify(metadata, null, 2);

			let outputString = jsonString;

			if (outputFormat.format === 'base64') {
			// Encode the JSON string using Base64
			progress.report({ message: 'Encoding JSON string...' });
			const base64String = Buffer.from(jsonString).toString('base64');
			const chunkSize = outputFormat.maxLineLength - ( outputFormat.maxLineLength % 4);
			const numChunks = Math.ceil(base64String.length / chunkSize);
			const encodedChunks = [];

			for (let i = 0; i < numChunks; i++) {
				const chunk = base64String.substr(i * chunkSize, chunkSize);
				encodedChunks.push(chunk);
			}

			outputString = encodedChunks.join('\n');
			}

          // Copy the output string to the clipboard
          progress.report({ message: 'Copying to clipboard...' });
          await vscode.env.clipboard.writeText(outputString);

          const formatMessage = outputFormat.format === 'utf-8' ? 'JSON string' : 'Base64-encoded JSON string';
          vscode.window.showInformationMessage(`${formatMessage} copied to clipboard.`);
        },
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      vscode.window.showErrorMessage(`Error: ${errorMessage}`);
    }
  });

  context.subscriptions.push(disposable);
}

exports.activate = activate;
