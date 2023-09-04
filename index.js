#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import files from './lib/files.js';
import github from './lib/github.js'

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Ginit', { horizontalLayout: 'full' })
    )
)

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a Git repository!'));
    process.exit();
}

const getGithubToken = async () => {
    // Fetch token from config store
    let token = github.getStoredGithubToken();
    if(token) {
        return token;
    }

    // No token found, use credentials to access GitHub account
    token = await github.getPersonalAccessToken();

    return token;
};

const run = async () => {
    try {
        // Retrieve & set authentication token
        const token = await getGithubToken();
        github.githubAuth(token);

        // Create remote repo
        const url = await repo.createRemoteRepo();


        // Create .gitignore file
        await repo.createGitignore();

        // Set up local repo and push to remote
        await repo.setupRepo(url);

        console.log(chalk.green('All done!'));
    } catch(err) {
        if (err) {
            switch (err.status) {
                case 401:
                    console.log(chalk.red('Couldn\t log you in. Please provide correct credentials/token.'));
                    break;
                case 422:
                    console.log(chalk.red('There is already a remote repo or token with the same name'));
                    break;
                default:
                    console.log(chalk.red(err));
            }
        }
    }

};

run();
