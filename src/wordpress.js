import chalk from 'chalk';
import Listr from 'listr';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import mkdirp from 'mkdirp';
import { gitAddSubmodule, gitDownloadRepository, gitInit } from './git';

// git repo variables
const wpGitRepo = 'https://github.com/WordPress/WordPress.git';
const baseThemeGitRepo = 'https://boxcrushtfs.visualstudio.com/Boxcrush%20-%20Wordpress%20Theme%20Base/_git/Boxcrush%20-%20Wordpress%20Theme%20Base';
const frameworkGitRepo = 'https://boxcrushtfs.visualstudio.com/Boxcrush%20-%20Wordpress%20Theme%20Framework/_git/Boxcrush%20-%20Wordpress%20Theme%20Framework';

export let choiceWordpressBoxcrushFramework = {
    name: 'Wordpress with the Boxcrush Theme Framework',
    value: 'wordpress-boxcrush-framework'
};

export let choiceWordpress = {
    name: 'Wordpress',
    value: 'wordpress'
};

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
            title: 'Install Wordpress',
            task: () => gitDownloadRepository( wpGitRepo, wpDir, 'Failed to install Wordpress.' )
        },
        {
            title: 'Install Boxcrush Base Theme',
            task: () => gitDownloadRepository( baseThemeGitRepo, themeDir, 'Failed to install Boxcrush base Wordpress theme.' )
        },
        {
            title: 'Install standard use Wordpress plugins',
            task: () => {}
        },
        {
            title: 'Initialize Git',
            task: () => gitInit( options.targetDirectory )
        },
        {
            title: 'Install Boxcrush Wordpress Theme Framework',
            task: () => gitAddSubmodule( frameworkGitRepo, frameworkGitRepo, 'Failed to install Boxcrush Wordpress Theme Framework.' )
        }
    ] );

    await tasks.run();

    return true;
}

async function createDirectories( directories ) {
    directories.forEach( ( item ) => { mkdirp( item ) } );
}

