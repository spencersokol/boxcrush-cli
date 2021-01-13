import chalk from 'chalk';
import Listr from 'listr';
import path from 'path';
import mkdirp from 'mkdirp';
import { gitAddSubmodule, gitDownloadRepository, gitInit } from './git';
import del from 'del';
import got from 'got';
import replace from 'replace-in-file';
import fs from 'fs';
import { promisify } from 'util';
import ncp from 'ncp';
import { fail } from 'assert';

const access = promisify( fs.access );
const copy = promisify( ncp );

// git repo variables
const wpGitRepo = 'https://github.com/WordPress/WordPress.git';
const baseThemeGitRepo = 'https://boxcrushtfs.visualstudio.com/Boxcrush%20-%20Wordpress%20Theme%20Base/_git/Boxcrush%20-%20Wordpress%20Theme%20Base';
const frameworkGitRepo = 'https://boxcrushtfs.visualstudio.com/Boxcrush%20-%20Wordpress%20Theme%20Framework/_git/Boxcrush%20-%20Wordpress%20Theme%20Framework';
const stdPluginsRepo = 'https://boxcrushtfs.visualstudio.com/Boxcrush%20-%20Wordpres%20Standard%20Plugins/_git/Boxcrush%20-%20Wordpres%20Standard%20Plugins';

export let choiceWordpressBoxcrushFramework = {
    name: 'Wordpress with the Boxcrush Theme Framework',
    value: 'wordpress-boxcrush-framework'
};

export let choiceWordpress = {
    name: 'Wordpress',
    value: 'wordpress'
};

export async function uninstallWordpress( options ) {

    // dir variables
    const contentDir = path.join( options.targetDirectory, 'content' );
    const mediaDir = path.join( options.targetDirectory, 'media' );
    const wpDir = path.join( options.targetDirectory, 'wordpress' );

    await del( [ contentDir, mediaDir, wpDir ], { force: true } );

    return true;
}

export function isWordpressInstall( options ) {
    return options.runInstall && ( ( choiceWordpressBoxcrushFramework.value === options.softwareToInstall ) || ( choiceWordpress.value === options.softwareToInstall ) );
}

export async function createWordpressProject( options ) {

    // dir variables
    const contentDir = path.join( options.targetDirectory, 'content' );
    const mediaDir = path.join( options.targetDirectory, 'media' );
    const pluginsDir = path.join( options.targetDirectory, 'content/plugins' );
    const themesDir = path.join( options.targetDirectory, 'content/themes' );
    const themeDir = path.join( themesDir, options.wordpressBoxcrushFramework.themeNameSanitized );
    const frameworkDir = path.join( themeDir, 'lib/boxcrush' );
    const wpDir = path.join( options.targetDirectory, 'wordpress' );

    const tasks = new Listr( [
        {
            title: 'Scaffolding',
            task: () => createDirectories( [ contentDir, pluginsDir, themesDir, mediaDir, wpDir, themeDir ] )
        },
        {
            title: 'Download Wordpress',
            task: () => gitDownloadRepository( wpGitRepo, wpDir, 'Failed to download Wordpress.' )
        },
        {
            title: 'Download Boxcrush Base Theme',
            task: () => gitDownloadRepository( baseThemeGitRepo, themeDir, 'Failed to download Boxcrush base Wordpress theme.' )
        },
        {
            title: 'Download standard use Wordpress plugins',
            task: () => gitDownloadRepository( stdPluginsRepo, pluginsDir, 'Failed to download standard plugins.' )
        },
        {
            title: 'Initialize Git',
            task: () => gitInit( options.targetDirectory )
        },
        {
            title: 'Download Boxcrush Wordpress Theme Framework',
            task: () => gitAddSubmodule( frameworkGitRepo, frameworkDir, 'Failed to download Boxcrush Wordpress Theme Framework.' )
        },
        {
            title: 'Copy Wordpress config templates',
            task: () => copyFiles( options, 'Unable to copy template files' )
        },
        {
            title: 'Generate Wordpress config salts',
            task: () => updateWordpressConfig( options, 'Unable to generate Wordpress config.php file.' )
        },
        {
            title: 'Configure Boxcrush Base Theme',
            task: () => fillThemePlaceholders( options, themeDir, 'Unable to configure Boxcrush Base Theme.' )
        }
    ] );

    await tasks.run();

    return true;
}

async function createDirectories( directories ) {
    directories.forEach( ( item ) => { mkdirp( item ) } );
}

async function copyFiles( options, failMessage ) {
    
    const templateDir = path.resolve(
        new URL( import.meta.url ).pathname,
        '../../templates/wordpress'
    );

    try {
        await copy( path.join( templateDir, '.gitignore' ), path.join( options.targetDirectory, '.gitignore' ) );
        await copy( path.join( templateDir, '.code-workspace' ), path.join( options.targetDirectory, options.wordpressBoxcrushFramework.themeNameSanitized + '.code-workspace' ) );
        await copy( path.join( templateDir, 'config.php' ), path.join( options.targetDirectory, 'config.php' ) );
        await copy( path.join( templateDir, 'index.php' ), path.join( options.targetDirectory, 'index.php' ) );
        await copy( path.join( templateDir, 'wp-config.php' ), path.join( options.targetDirectory, 'wp-config.php' ) );
    } catch ( error ) {
        return Promise.reject( new Error( failMessage ) );
    }

    return true;

}

async function updateWordpressConfig( options, failMessage ) {

    try {
        const response = await got( 'https://api.wordpress.org/secret-key/1.1/salt/' );
        const config = path.join( options.targetDirectory, 'config.php' );

        await replace( { 
            files: config,
            from: '[[WORDPRESS_SALTS]]',
            to: response.body
        } );

        await replace( {
            files: config,
            from: /\[\[URL\]\]/g,
            to: options.wordpressBoxcrushFramework.siteURL
        } );

        await replace( {
            files: config,
            from: '[[DB_NAME]]',
            to: options.wordpressBoxcrushFramework.dbName
        } );

        await replace( {
            files: config,
            from: '[[DB_USER]]',
            to: options.wordpressBoxcrushFramework.dbUser
        } );

        await replace( {
            files: config,
            from: '[[DB_PASSWORD]]',
            to: options.wordpressBoxcrushFramework.dbPassword
        } );

        await replace( {
            files: config,
            from: '[[TABLE_PREFIX]]',
            to: options.wordpressBoxcrushFramework.tablePrefix
        } );

    } catch ( error ) {
        return Promise.reject( new Error( failMessage ) );
    }

    return true;
}

async function fillThemePlaceholders( options, directory, failMessage ) {

    const phpFiles = path.join( directory, '**/*.php' );
    const scssFiles = path.join( directory, '**/*.scss' );
    const jsFiles = path.join( directory, '**/*.js' );
    const replacements = [
        {
            files: phpFiles,
            from: /\[\[NAMESPACE\]\]/g,
            to: options.wordpressBoxcrushFramework.namespace
        },
        {
            files: phpFiles,
            from: /\[\[THEME_NAME\]\]/g,
            to: options.wordpressBoxcrushFramework.themeName
        },
        {
            files: phpFiles,
            from: /\[\[THEME_CONSTANT\]\]/g,
            to: options.wordpressBoxcrushFramework.domainConstant
        },
        {
            files: phpFiles,
            from: /\[\[THEME_SANITIZED\]\]/g,
            to: options.wordpressBoxcrushFramework.themeNameSanitized
        },
        {
            files: [ phpFiles, jsFiles ],
            from: /\[\[THEME_JAVASCRIPT_OBJECT\]\]/g,
            to: options.wordpressBoxcrushFramework.themeJSObject
        },
        {
            files: jsFiles,
            from: /__javascript_wordpress_theme_prefix/g,
            to: options.wordpressBoxcrushFramework.themeJSFunctionPrefix
        }
    ];

    try {
        replacements.forEach( async ( item ) => { await replace( item ); } );
    } catch ( error ) {
        return Promise.reject( new Error( failMessage ) );
    }

    return true;
}