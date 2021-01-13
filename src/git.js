import execa from 'execa';
import del from 'del';
import fs from 'fs';
import path from 'path';

export async function gitInit( directory ) {
    
    const result = await execa('git', [ 'init' ], {
        cwd: directory,
    } );

    if ( result.failed ) {
        return Promise.reject( new Error( 'Failed to initialize git' ) );
    }

    return;
}

export async function gitDownloadRepository( repositoryURI, directory, failMessage, branch = undefined ) {

    let args = [];

    args.push( 'clone' );
    args.push( '--depth' );
    args.push( '1' );

    if ( branch ) {
        args.push( '--branch' );
        args.push( branch );
    }

    args.push( repositoryURI );
    args.push( directory );

    const result = await execa( 'git', args );

    if ( result.failed ) {
        return Promise.reject( new Error( failMessage ) );
    }

    await del( path.join( directory, '.git' ) );
    await del( path.join( directory, '.gitignore' ) );
    await del( path.join( directory, '.gitattributes' ) );

    return;
}

export async function gitAddSubmodule( repositoryURI, directory, failMessage ) {

    const result = await execa( 'git', [ 'submodule', 'add', repositoryURI, directory ] );

    if ( result.failed ) {
        return Promise.reject( new Error( failMessage ) );
    }

    return;
}