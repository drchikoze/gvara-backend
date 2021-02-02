'use strict';

import FS        from 'q-io/fs';
import inlineCss from 'inline-css';
import pathUtil  from 'path';

class Inliner {
    constructor() {
    }

    inlineHTML(sourceHTML, sourcePath, destinationPath) {
        const inlinerOptions = {
            url: 'file://' + sourcePath
        };
        inlineCss(sourceHTML, inlinerOptions).then( inlinedHTML => {
            FS.write(destinationPath, inlinedHTML).then( (error) => {
                if (error) {
                    console.log('⛔️  error - ', sourcePath);
                    console.log(error);
                }

                console.log('✅  build - ', sourcePath);
            });
        }
        ).catch(err => {
            console.log('⛔️  error - ', err);
        });
    }

    buildAll(sourceDir, destinationDir) {
        const sourceFolder = pathUtil.join(__dirname, sourceDir);
        const destinationFolder = pathUtil.join(__dirname, destinationDir);

        return FS.toObject(sourceFolder).then( object => {
            for (const path in object ) {
                const relativePath = FS.relativeFromDirectory(sourceFolder, path);
                const fileInfo = pathUtil.parse(path);

                if (fileInfo.ext === '.html') {
                    const sourceHTML = object[ path ].toString();
                    const destinationPath = pathUtil.join(destinationFolder, relativePath);
                    this.inlineHTML(sourceHTML, path, destinationPath);
                }
            }
        });
    }
}

export default Inliner;
