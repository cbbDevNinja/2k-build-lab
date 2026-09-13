/* Web/account constants extracted from module runtime for maintainability. */
(function(global){
    "use strict";

    global.GBL_WEB_CONFIG = {
        /* Leave empty to use same-origin API path in production. */
        API_BASE_URL: '',
        SB_URL: 'https://ogaecaeodvcmrynvvejg.supabase.co',
        SB_KEY: 'sb_publishable_kWAvsJCPBZ5YubyBxz7ORw_UK3n6Nra',
        PLABEL: {
            twitter: 'X',
            twitch: 'Twitch',
            google: 'Google',
            discord: 'Discord',
            github: 'GitHub',
            apple: 'Apple',
            facebook: 'Facebook',
            spotify: 'Spotify',
            slack: 'Slack',
            azure: 'Microsoft',
            linkedin_oidc: 'LinkedIn',
            notion: 'Notion',
            figma: 'Figma',
            gitlab: 'GitLab',
            bitbucket: 'Bitbucket',
            kakao: 'Kakao',
            snapchat: 'Snapchat',
            zoom: 'Zoom'
        },
        PLATS: [{
            id: 'psn',
            name: 'PlayStation',
            col: '#2e6fdb'
        }, {
            id: 'xbox',
            name: 'Xbox',
            col: '#3f9142'
        }, {
            id: 'pc',
            name: 'PC',
            col: '#7e8b99'
        }, {
            id: 'switch',
            name: 'Switch',
            col: '#c7343a'
        }],
        STYLES: [{
            id: '2v2',
            name: '2v2',
            col: '#d98324'
        }, {
            id: '3v3',
            name: '3v3',
            col: '#2e9e8f'
        }, {
            id: 'stage',
            name: 'Stage',
            col: '#b4486d'
        }, {
            id: 'rec',
            name: 'Rec',
            col: '#4a76c4'
        }, {
            id: 'proam',
            name: 'Pro-Am',
            col: '#8a63c9'
        }],
        TIER_ORDER: {
            free: 0,
            mid: 1,
            premium: 2
        }
    };
})(typeof window !== "undefined" ? window : globalThis);
