import { CSpellReporterModule, Issue } from '@cspell/cspell-types';

import reportBuilder, { JUnitReportBuilder, TestSuite } from 'junit-report-builder';
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
  getReporter: (settings: ReporterSetting | unknown) => {
    const builder: JUnitReportBuilder = reportBuilder.newBuilder();

    const addIssueByText = (issues : GroupedIssues, key:string, issue :Issue): GroupedIssues =>  {
      return { ...issues, [key]: issues[key] ? [...issues[key], issue] : [issue] };
    }

    const buildTestSuite = (issues: Issue[], text: string) => {
      const suite = builder.testSuite().name(`Forbidden word ${text}`);
      issues.forEach((issue) => createTestCase(suite, issue));
    };

    const createTestCase = (suite: TestSuite, issue: Issue) => {
      const { text, row, col, context, uri } = issue;
      const absolutePath = (uri || '').replace(/^file:\/\//, '');
      const file = path.relative(process.cwd(), absolutePath);
      const message = `${context.text}\n ${' '.repeat(col - 2)}${'^'.repeat(text.length)}`;

      suite
        .testCase()
        .className(`CSpell.ForbiddenWord.${text}`)
        .name(`Forbidden word "${text}" at "${file}" line:${row}`)
        .file(`${file}#L${row}`)
        .failure(message);
    };

    let issues: GroupedIssues = {};

    return {
      issue: (issue: Issue) => {
        const { text } = issue;
        issues = addIssueByText(issues, text, issue);
      },

      result: () => {
        const output = (settings as ReporterSetting).outFile || DEFAULT_OUTPUT;
        console.log(`output xml to ${output}`);
        Object.keys(issues).forEach((text) => buildTestSuite(issues[text], text));

        builder.writeTo(output);
      }
    };
  }
};

export const getReporter = Module.getReporter;

export default Module;
