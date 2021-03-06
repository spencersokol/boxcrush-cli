import arg from 'arg';
import inquirer from 'inquirer';
import { choiceWordpressBoxcrushFramework, choiceWordpress, createWordpressProject, isWordpressInstall, uninstallWordpress } from './wordpress';

function parseRawArgs( rawArgs ) {
    const args = arg(
        {
            '--install': Boolean,
            '--uninstall': Boolean,
            '-i': '--install',
            '-u': '--uninstall'
        },
        {
            argv: rawArgs.slice( 2 )
        }
    );
    return {
        runInstall: args[ '--install' ] || false,
        uninstall: args[ '--uninstall' ] || false,
        targetDirectory: process.cwd(),
        softwareToInstall: undefined,
        wordpress: {
            version: '5.6'
        },
        wordpressBoxcrushFramework: {
            siteURL: undefined,
            dbName: undefined,
            dbUser: undefined,
            dbPassword: undefined,
            tablePrefix: undefined,
            namespace: undefined,
            themeName: undefined,
            themeNameSanitized: undefined,
            domainConstant: undefined,
            themeJSObject: undefined,
            themeJSFunctionPrefix: undefined
        }
    };
}

async function promptForOptions( options ) {
    let answers = await promptForMainOptions( options );
    return await promptForWordpressOptions( answers );
}

async function promptForMainOptions( options ) {

    const questions = [];

    if ( options.runInstall && ! options.softwareToInstall ) {
        questions.push( {
            type: 'list',
            name: 'softwareToInstall',
            message: 'Choose which software to install:',
            choices: [ 
                choiceWordpressBoxcrushFramework,
                choiceWordpress
            ],
            default: choiceWordpressBoxcrushFramework.value
        } );
    }

    const answers = await inquirer.prompt( questions );

    return {
        ...options,
        softwareToInstall: options.softwareToInstall || answers.softwareToInstall
    };
}

async function promptForWordpressOptions( options ) {

    if ( choiceWordpressBoxcrushFramework.value !== options.softwareToInstall )
        return { ...options };

    let questions = [];

    questions.push( {
        type: 'input',
        name: 'siteURL',
        message: 'Enter the development URL for this Wordpress install:'
    } );

    questions.push( {
        type: 'input',
        name: 'dbName',
        message: 'Enter the database name for this Wordpress install:'
    } );

    questions.push( {
        type: 'input',
        name: 'dbUser',
        message: 'Enter the database user for this Wordpress install:'
    } );

    questions.push( {
        type: 'password',
        name: 'dbPassword',
        message: 'Enter the database password for this Wordpress install:'
    } );

    questions.push( {
        type: 'input',
        name: 'tablePrefix',
        message: 'Enter the table prefix for this Wordpress install:',
        default: 'wp_'
    } );

    questions.push( {
        type: 'input',
        name: 'namespace',
        message: 'Enter a PHP namespace for the theme:'
    } );

    questions.push( {
        type: 'input',
        name: 'themeName',
        message: 'Enter the display name for the theme:'
    } );

    questions.push( {
        type: 'input',
        name: 'domainConstant',
        message: 'Enter a PHP constant name to use as a Wordpress text domain for the theme:'
    } );

    const answers = await inquirer.prompt( questions );

    questions = [];

    questions.push( {
        type: 'input',
        name: 'themeNameSanitized',
        message: 'You may specify a sanitized theme name here (lower case letters and dashes only):',
        default: answers.themeName.split( ' ' ).join( '-' ).toLowerCase()
    } );

    questions.push( {
        type: 'input',
        name: 'themeJSObject',
        message: 'Enter the theme JavaScript objectName for the theme:',
        default: answers.themeName.split( ' ' ).join( '' )
    } );

    questions.push( {
        type: 'input',
        name: 'themeJSFunctionPrefix',
        message: 'Enter the JavaScript function prefix for the theme:',
        default: answers.themeName.split( ' ' ).join( '_' ).toLowerCase()
    } );

    const dependantAnswers = await inquirer.prompt( questions );

    return {
        ...options,
        wordpressBoxcrushFramework: {
            siteURL: answers.siteURL,
            dbName: answers.dbName,
            dbUser: answers.dbUser,
            dbPassword: answers.dbPassword,
            tablePrefix: answers.tablePrefix,
            namespace: answers.namespace,
            themeName: answers.themeName,
            themeNameSanitized: dependantAnswers.themeNameSanitized,
            domainConstant: answers.domainConstant,
            themeJSObject: dependantAnswers.themeJSObject,
            themeJSFunctionPrefix: dependantAnswers.themeJSFunctionPrefix
        }
    }
}

export async function cli( args ) {

    let options = parseRawArgs( args );

    if ( options.uninstall ) {
        uninstallWordpress( options );
        process.exit();
    }

    // This will need expanded upon once we give this more functionality.
    // Right now we're just basically writing a Wordpress installer.
    if ( ! options.runInstall ) {
        console.log( 'usage: boxcrush --install' );
        process.exit( 1 );
    }

    options = await promptForOptions( options );

    if ( isWordpressInstall( options ) ) {
        createWordpressProject( options );
    }

}