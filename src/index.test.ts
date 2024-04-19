import { describe, expect, test } from '@jest/globals';
import { Issue, ReporterConfiguration, RunResult } from '@cspell/cspell-types';
import Module from '.';
import { ReporterSetting, DEFAULT_OUTPUT } from '.';
import * as fs from 'fs';

const dummyIssue: Issue = {
  uri: 'file://dummy-input',
  text: 'dummy-text',
  offset: 11,
  length: 11,
  context: {
    text: 'dummy-context-text',
    offset: 11,
    length: 11,
  },
  row: 11,
  col: 11,
  line: {
    text: 'dummy-line-text',
    offset: 11,
    length: 11,
  },
};

const dummyIssue2: Issue = {
  text: 'dummy-text',
  offset: 13,
  length: 13,
  context: {
    text: 'dummy-context-text',
    offset: 13,
    length: 13,
  },
  row: 13,
  col: 13,
  line: {
    text: 'dummy-line-text',
    offset: 13,
    length: 13,
  },
};

const TEST_OUTPUT = './test_output/output.xml';

describe('getReporter', () => {
  test('getReporter is defined', () => {
    const { getReporter } = Module;
    expect(getReporter).not.toBeNull();
  });

  test('getReporter returns instance', () => {
    const { getReporter } = Module;
    const settings: ReporterSetting = {};
    const config: ReporterConfiguration = {};

    const reporter = getReporter(settings, config);
    expect(reporter).not.toBeNull();

    expect(reporter.issue).not.toBeNull();
    expect(reporter.result).not.toBeNull();
  });
});

const compareFile = (expected: fs.PathLike, actual: fs.PathLike) => {
  const e = fs.readFileSync(expected, 'utf-8').toString() + '\n';
  const a = fs.readFileSync(actual, 'utf-8').toString(); // actual output has no newline on EOF.

  expect(a).toBe(e);
};

describe('reporter', () => {
  test('reporter output xml file on issue occured', () => {
    // delete previous output xml
    if (fs.existsSync(TEST_OUTPUT)) {
      fs.rmSync(TEST_OUTPUT);
    }

    const { getReporter } = Module;
    const settings: ReporterSetting = {
      outFile: TEST_OUTPUT,
    };
    const config: ReporterConfiguration = {};

    const reporter = getReporter(settings, config);

    if (reporter.issue) {
      reporter.issue(dummyIssue);
      reporter.issue(dummyIssue2);
    } else {
      throw Error('Illegal State.');
    }

    if (reporter.result) {
      const dummyResult: RunResult = {
        files: 1,
        filesWithIssues: new Set(),
        issues: 0,
        errors: 0,
      };
      reporter.result(dummyResult);

      expect(fs.existsSync(TEST_OUTPUT)).toBeTruthy();

      compareFile(TEST_OUTPUT, './test_fixture/errors.xml');
    } else {
      throw Error('Illegal State.');
    }
  });

  test('reporter output xml file on no issue', () => {
    // delete previous output xml
    if (fs.existsSync(TEST_OUTPUT)) {
      fs.rmSync(TEST_OUTPUT);
    }

    const { getReporter } = Module;
    const settings: ReporterSetting = {
      outFile: TEST_OUTPUT,
    };
    const config: ReporterConfiguration = {};

    const reporter = getReporter(settings, config);

    if (reporter.result) {
      const dummyResult: RunResult = {
        files: 1,
        filesWithIssues: new Set(),
        issues: 0,
        errors: 0,
      };
      reporter.result(dummyResult);

      expect(fs.existsSync(TEST_OUTPUT)).toBeTruthy();

      compareFile(TEST_OUTPUT, './test_fixture/empty.xml');
    } else {
      throw Error('Illegal State.');
    }
  });
});

describe('reporter with default settings', () => {
  test('reporter output xml file on no issue', () => {
    // delete previous output xml
    if (fs.existsSync(DEFAULT_OUTPUT)) {
      fs.rmSync(DEFAULT_OUTPUT);
    }

    const { getReporter } = Module;
    const settings: ReporterSetting = {};
    const config: ReporterConfiguration = {};

    const reporter = getReporter(settings, config);

    if (reporter.result) {
      const dummyResult: RunResult = {
        files: 1,
        filesWithIssues: new Set(),
        issues: 0,
        errors: 0,
      };
      reporter.result(dummyResult);

      expect(fs.existsSync(DEFAULT_OUTPUT)).toBeTruthy();

      compareFile(TEST_OUTPUT, './test_fixture/empty.xml');
    } else {
      throw Error('Illegal State.');
    }
  });
});
