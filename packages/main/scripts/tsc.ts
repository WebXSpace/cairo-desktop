import { resolve } from 'path';
import ts from 'typescript';
import { getLogger } from './logger';

const logger = getLogger('tsc');

export function watchMain(configPath: string, recompleted: () => void) {
	const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

	// Note that there is another overload for `createWatchCompilerHost` that takes
	// a set of root files.
	const host = ts.createWatchCompilerHost(
		configPath,
		{},
		ts.sys,
		createProgram,
		reportDiagnostic,
		diagnostic => {
			logger.info(ts.formatDiagnostic(diagnostic, formatHost));

			if (diagnostic.code == 6194) {
				recompleted();
			}
		},
	);

	// `createWatchProgram` creates an initial program, watches files, and updates
	// the program over time.
	ts.createWatchProgram(host);
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
	logger.error(ts.formatDiagnostic(diagnostic, formatHost));
}

const formatHost: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: path => path,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => ts.sys.newLine,
};
