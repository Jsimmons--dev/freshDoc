# Given a line number and JS file find the name of the function that contains it
Use case:
- User references a method in fastDoc (TM)
- User changes the body of the method in their code

fastDoc needs to know that the method has changed and docs might need updating

## Solution

1. Use [acorn](npm link) to parse the JS file into an AST
2. After acorn parses, we can look at the relevant line and ask acorn what function it is in

The function then loops through every node in the file and finds a function where the start <=targetLine and end >= targetLine


3. After we find the function, we return it's name 



## Example

[link to file](@fastdoc:./findFunctionByLineNumber.js)

```javascript @fastdoc ./findFunctionByLineNumber:login()
login(stuff1, stuff2)
```

```javascript @fastdoc ./findFunctionByLineNumber:50-54
function login() {
    return user
}
```

Problem:
- Code is what runs, and is sometimes the most effective way to explain something
- Code is hard to keep up to date with docs (rot)

Solution:
- link to code (explainations include code now)
- if rot is happening, help the authors of docs fix it
    - Fix it for me?

-- what kind of links?
## fs view
- project 👎
- folders 👎
- files👍
- functions 🤩
- line ranges 👍


### methods
- link: filename + function name
 


- location
    - function name not found in file
        - deleted?
        - moved?

outputs:
- change in signature
    - update this name?
- change in body
    - does this doc need to be updated?
- signature not found in file
    - found signature somewhere else
        - are any of these where it went?
    - not found anywhere
        - did this get removed? Do the docs need an update?


### line ranges
- link: filename + line range
- how can this rot?
    - any change within these lines

outputs
- any change within this lines?
    - AST in existing file?
                - no
                    - deleted?
                    - moved?
                - yes
                    - update this line range?


### files
- link: filename, markdown link
- how can this rot?
    - file was changed
    - file was moved
    - file was renamed

outputs:
- file was changed
    - update this doc? ＄
- file was moved
    - update this link?
- file was renamed
    - update this link?


# MVP

- files👍
    - file was changed?
    - update this doc? ＄
- line ranges 👍