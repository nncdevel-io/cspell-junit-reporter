# cspell-junit-reporter

CSpell reporter with Junit XML output

## Usage

Add this to cSpell.json:

```
reporters: [
    ["@nncdevel-io/cspell-junit-reporter", { "outFile": "out.xml" }]
]
```

in yaml format:

```yaml
reporters:
  - "@nncdevel-io/cspell-junit-reporter"
  -
    - outFile: out.xml
```

## Output file format

[Common JUnit XML Format & Examples](https://github.com/testmoapp/junitxml)

see also [test fixture files](./test_fixture).

## Settings

- `outFile` (required) - path for Junit XML file to emit
