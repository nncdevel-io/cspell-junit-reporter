import { CSpellReporterModule, Issue } from '@cspell/cspell-types';

import reportBuilder from 'junit-report-builder';
import path from 'path';
import process from 'process';

export type ReporterSetting = {
  outFile?: string;
};

export type GroupedIssues = {
  [key: string]: Issue[];
};

export const DEFAULT_OUTPUT = 'cspell-junit-test-report.xml';

const Module: CSpellReporterModule = {
  getReporter: (settings: ReporterSetting | unknown, config) => {
    const builder = reportBuilder.newBuilder();

    const issues: GroupedIssues = {};
    return {
      issue: (issue) => {
        const { text } = issue;

        if (issues[text]) {
          issues[text] = [...issues[text], issue];
        } else {
          issues[text] = [issue];
        }
      },

      result: () => {
        const output = (settings as ReporterSetting).outFile || DEFAULT_OUTPUT;
        console.log(`output xml to ${output}`);
        Object.keys(issues).forEach((text) => {
          const suite = builder.testSuite().name(`Forbidden word ${text}`);
          issues[text].forEach((issue) => {
            const { row, uri } = issue;
            const absolutePath = (uri || '').replace(/^file:\/\//, '');
            const file = path.relative(process.cwd(), absolutePath);

            suite
              .testCase()
              .className(`CSpell.ForbiddenWord.${text}`)
              .name(`Forbidden word "${text}" at "${file}" line:${row}`)
              .file(`${file}#L${row}`)
              .failure();
          });
        });



        builder.writeTo(output);
      },
    };
  },
};

export const getReporter = Module.getReporter;

export default Module;
