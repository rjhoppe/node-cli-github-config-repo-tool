import CLI from 'clui';
import Configstore from 'configstore';
import { Octokit } from '@octokit/rest';

import { createBasicAuth } from '@octokit/auth-basic';

import getCreds from './inquirer.js';
import pkg from '../package.json' assert { type: 'json'};

const Spinner = CLI.Spinner;
const conf = new Configstore(pkg.name);

let octokit;

export const gitAuth = {
    githubAuth: () => {
        octokit = new Octokit({
            auth: token 
        });
    },
    getInstance: () => {
        return octokit;
    },
    getStoredGithubToken: () => {
        return conf.get('github.token');
    },
    getPersonalAccessToken: async () => {
        const credentials = await getCreds.askGitHubCredentials();
        const status = new Spinner('Authenticating you, please wait...');

        status.start();

        const auth = createBasicAuth({
            username: credentials.username,
            password: credentials.password,
            async on2Fa() {
                status.stop();
                const res = await getCreds.getTwoFactorAuthenticationCode();
                status.start();
                return res.getTwoFactorAuthenticationCode;
            },
            token: {
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'ginit, the command-line tool for initializing Git repos'
            }
        });

        try {
            const res = await auth();

            if(res.token){
                conf.set('github.token', res.token)
                return res.token;
            } else {
                throw new Error('GitHub token was not found in your response.')
            }
        } finally {
            status.stop();
        }
    },
};

export default gitAuth;