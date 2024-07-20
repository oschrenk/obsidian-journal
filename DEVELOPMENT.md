# DEVELOPMENT

```
npm run build

# sometimes rollup cache is messed up and you need to delete it
rm -rf node_modules/.cache/rollup-plugin-typescript2/
```

**"Deploy"**

Instead of properly releasing a forked version, just copy it directly to Obsidian.
Yes, updates might then overwrite it, but that's OK.

```
cp build/main.js /Users/oliver/Obsidian/memex/.obsidian/plugins/journals/
```
