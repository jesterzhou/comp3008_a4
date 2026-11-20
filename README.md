requirements:
node.js version is up to date (26.13.1), please install it from https://nodejs.org/en/download if you do not have node.js or have an older version.

confirm node version
```
node -v # should print "v26.13.1".
```

after installing node / updating

```bash
cd team15_a4_source/src/a4

# then run,

npm install

npm run dev
```

open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

this is a functional interactive interface for searching, adding, removing and editing anime's to a pseudo-account (test)'s anime list. there is no functionality for account management (ie. create, login, logout account) however we can still test the aforementioned features via performing crud operations to a local database. 

features supported:
- [x] searching for anime
- [x] autofill suggestions when searching for anime
- [x] adding anime to list
- [x] removing anime from list
- [x] editing properties of anime from list
- [x] filter user's anime list by status (all anime, watching, completed, on-hold, dropped)
- [x] search within each filtered results of user's anime list by querying
- [x] error prevention of user from discarding changes to anime accidentally

note: the values presented are randomly generated / mock data, and are generated on runtime. therefore values seen from an anime on myanimelist will not be the same as the data presented here.