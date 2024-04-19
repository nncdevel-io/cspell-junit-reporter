# cspell-junit-reporter

CSpell reporter with Junit XML output

## Usage

Add this to cSpell.json:

FIXME npm repository org.

```json
reporters: [
    ["@example/cspell-junit-reporter", { "outFile": "out.xml" }]
]
```

## Output file format

[Common JUnit XML Format & Examples](https://github.com/testmoapp/junitxml)

see also [test fixture files](./test_fixture).

## Settings

- `outFile` (required) - path for Junit XML file to emit
