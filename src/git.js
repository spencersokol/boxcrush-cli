import execa from 'execa';
import rimraf from 'rimraf';
import fs from 'fs';

export async function gitInit( directory ) {
    
    const result = await execa('git', [ 'init' ], {
        cwd: directory,
    } );

    if ( result.failed ) {
        return Promise.reject( new Error( 'Failed to initialize git' ) );
    }

    return;
}

export async function gitDownloadRepository( repositoryURI, directory, failMessage ) {

    const result = await execa( 'git', [ 'clone', repositoryURI, directory ] );
    const gitignore = path.join( directory, '.gitignore' );

    if ( result.failed ) {
        return Promise.reject( new Error( failMessage ) );
    }

    await rimraf( path.join( directory, '.git' ) );

    fs.access( gitignore, fs.F_OK, () => {
        fs.unlink( gitignore );
    } );

    return;
}

export async function gitAddSubmodule( repositoryURI, directory, failMessage ) {

    const result = await execa( 'git', [ 'submodule', 'add', repositoryURI, directory ] );

    if ( result.failed ) {
        return Promise.reject( new Error( failMessage ) );
    }
    
    return;
}