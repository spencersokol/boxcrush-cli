import arg from 'arg';
import inquirer from 'inquirer';
import { choiceWordpressBoxcrushFramework, choiceWordpress, createWordpressProject, isWordpressInstall } from './wordpress';

function parseRawArgs( rawArgs ) {
    const args = arg(
        {
            '--install': Boolean,
            '-i': '--install'
        },
        {
            argv: rawArgs.slice( 2 )
        }
    );
    return {
        runInstall: args[ '--install' ] || false,
        targetDirectory: process.cwd(),
        softwareToInstall: undefined,
        wordpressBoxcrushFramework: {
            namespace: undefined,
            themeName: undefined,
            themeNameSanitized: undefined,
            domainConstant: undefined,
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
    })

    const answers = await inquirer.prompt( questions );

    questions = [];

    questions.push( {
        type: 'input',
        name: 'themeNameSanitized',
        message: 'You may specify a sanitized theme name here (lower case letters and dashes only):',
        default: answers.themeName.split( ' ' ).join( '-' ).toLowerCase()
    } );

    const dependantAnswers = await inquirer.prompt( questions );

    return {
        ...options,
        wordpressBoxcrushFramework: {
            namespace: answers.namespace,
            themeName: answers.themeName,
            themeNameSanitized: dependantAnswers.themeNameSanitized,
            domainConstant: answers.domainConstant,
        }
    }
}

export async function cli( args ) {

    let options = parseRawArgs( args );

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