#!/bin/bash

TARGET=../dist
#rm -rf $TARGET
#'concurrent:dist',
echo "TODO : concurrent:dist"
#'compass',
compass compile
duo app/scripts/utils/pack.js > app/scripts/utils/packed.js
#'copy:softDist'
cd app/
pwd
echo "rm -rf \"$TARGET\""
rm -rf "$TARGET"
for dirToCreate in config i18n images styles views/resources views/maintenance scripts/utils; do
    mkdir -p $TARGET/app/$dirToCreate
done
echo "Copying app source files ..."
for pattern in *.{ico,txt} .htaccess i18n/*.json images/*.png scripts/app.js scripts/controllers scripts/directives scripts/services scripts/utils/packed.js views/index.html views/404.html views/partials views/resources/factions.json views/maintenance/index.html config/piwik.config.js ; do
    echo "copying $pattern to $TARGET/app/$pattern"
    cp -r $pattern $TARGET/app/$pattern
done
echo "...done"
rm -f $TARGET/app/scripts/utils/pack.js

cp ../.sass-tmp/main.css $TARGET/app/styles/

echo "Copying server source files ..."
mkdir -p $TARGET/lib/gameRules
for pattern in {package,bower}.json .bowerrc server.js lib/config lib/controllers lib/gameRules/singleElim.js lib/models lib/service lib/utils lib/{middleware,routes}.js; do
    echo "copying ../$pattern to $TARGET/$pattern"
    cp -r ../$pattern $TARGET/$pattern
done
echo "...done"

echo "Cleaning up .gitignore files"
find $TARGET -name .gitignore -exec rm {} \;