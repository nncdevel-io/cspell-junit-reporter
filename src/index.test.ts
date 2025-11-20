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
  /**
   * テストの意図:
   *   モジュールからgetReporter関数がエクスポートされていることを確認する基本的な存在チェック
   *
   * このテストで確認できること:
   *   - getReporter関数がモジュールから正しくエクスポートされている
   *   - getReporter関数がnullやundefinedではない
   *
   * 確認できないこと:
   *   - getReporter関数の実際の動作
   *   - 返り値の型や構造
   *   - 関数の引数処理
   */
  test('getReporter is defined', () => {
    const { getReporter } = Module;
    expect(getReporter).not.toBeNull();
  });

  /**
   * テストの意図:
   *   getReporter関数が正しいインターフェースを持つレポーターオブジェクトを返すことを確認する
   *
   * このテストで確認できること:
   *   - getReporter関数が空の設定でも正常に動作する
   *   - 返されるレポーターオブジェクトがnullではない
   *   - レポーターオブジェクトがissueメソッドを持っている
   *   - レポーターオブジェクトがresultメソッドを持っている
   *
   * 確認できないこと:
   *   - issueメソッドの実際の動作（問題の蓄積処理など）
   *   - resultメソッドの実際の動作（XML出力など）
   *   - 設定パラメータが正しく反映されるか
   *   - 異常な設定値に対する動作
   */
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
  /**
   * テストの意図:
   *   スペルチェック問題が発生した場合に、正しい形式のJUnit XMLファイルが出力されることを確認する
   *   エンドツーエンドの統合テスト
   *
   * このテストで確認できること:
   *   - issueメソッドが複数回呼び出せる（問題を蓄積できる）
   *   - resultメソッドが呼ばれたときに指定したパスにXMLファイルが作成される
   *   - 出力されるXMLの内容が期待される形式と一致する（フィクスチャとの比較）
   *   - 同じテキストに対する複数の問題がグループ化される
   *   - ファイルパス、行番号、問題のテキストなどが正しくXMLに含まれる
   *
   * 確認できないこと:
   *   - 実際のCSpellとの統合動作
   *   - より複雑なシナリオ（多数の異なる問題、異なるファイルからの問題など）
   *   - XMLのエンコーディングや特殊文字のエスケープ処理
   *   - 大量の問題に対するパフォーマンス
   *   - エラーハンドリング（ファイル書き込み失敗など）
   *   - 既存ファイルの上書き動作
   */
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

  /**
   * テストの意図:
   *   スペルチェック問題が発生しなかった場合（クリーンな結果）でも、
   *   正しい形式の空のJUnit XMLファイルが出力されることを確認する
   *
   * このテストで確認できること:
   *   - issueメソッドが一度も呼ばれない場合でも正常に動作する
   *   - resultメソッドのみ呼び出しても指定したパスにXMLファイルが作成される
   *   - 問題がない場合の出力XMLが期待される形式（空のテストスイート）と一致する
   *   - CI/CDツールが正しく解釈できる有効なXML構造が出力される
   *
   * 確認できないこと:
   *   - 空のXMLがCI/CDツールで実際に正しく解釈されるか
   *   - resultメソッドが複数回呼ばれた場合の動作
   *   - エラーハンドリング（ファイル書き込み失敗など）
   */
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
  /**
   * テストの意図:
   *   設定が指定されていない場合にデフォルトの出力パスが使用されることを確認する
   *   デフォルト設定でのフォールバック動作のテスト
   *
   * このテストで確認できること:
   *   - 空の設定オブジェクトでもレポーターが正常に動作する
   *   - outFileが指定されていない場合、DEFAULT_OUTPUT定数で定義されたパスが使用される
   *   - デフォルトパスにXMLファイルが作成される
   *   - デフォルト設定でも出力されるXMLの形式は正しい
   *
   * 確認できないこと:
   *   - デフォルトパスのディレクトリが存在しない場合の動作
   *   - デフォルトパスへの書き込み権限がない場合のエラーハンドリング
   *   - 他のデフォルト設定値（出力形式、エンコーディングなど）の動作
   *   - compareFileでTEST_OUTPUTと比較しているが、これはDEFAULT_OUTPUTであるべき（潜在的なバグ）
   */
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
