`@cley_faye/jsoncheck`
=====================
Check if a buffer starts like a JSON.

This will start parsing the data provided as a buffer or string, and indicate if at some point an
unexpected character was met.
If the parser can reach the end of the buffer without being stopped before, it will indicate that
the buffer seems to start like a JSON.
It will also return the type of the top-level object.

Why?
----
At some point, I had the need to be able to detect if a file looked-like a JSON file without
actually going over the whole file.
While not 100% safe, checking the first few kilobytes of a file should give a good general idea if
the content is a JSON or not.

Installation
------------

```shell
npm install @cley_faye/jsoncheck
```

This is exported as a module.

Usage
-----

```JavaScript
import {checkJSONStart} from "@cley_faye/jsoncheck";

const res = checkJSONStart("{\"something\": 34, \"anot");
console.log(res);
```

Should output `"object"`.

Tests
-----
Very basic tests, to make sure each function at least do what it's supposed to do.
The actual test command is a bit off, the current situation surrounding modules, TypeScript and
instrumentations tools is a bit complex.
Once it's more stable, I'll add back `nyc`.
