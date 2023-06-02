import { client, parsers } from './webauthn.min.js';

const app = new Vue({
    el: '#user',
    data: {
        user: null
    },
    methods: {
        async getUserInfo(credentialId) {
            const response = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credentialId
                }),
            });
            if (response.ok) {
                const res = await response.json();
                // console.log(res);
                this.user = res
            } else {
                console.error(response.statusText)
            }
        },
        async logout() {
            this.user = null;
            this.isAuthenticated = false
            window.localStorage.removeItem("username")
            window.location.replace('/')
            // const response = await fetch('/api/logout', { method: 'POST' });
            // if (response.ok) {

            // } else {
            //   //  // console.error('Logout failed:', response.statusText);
            // }
        },
    },

    async mounted() {
        const credentialId = window.localStorage.getItem("username");
        // console.log(credentialId)
        await this.getUserInfo(credentialId)
    },
});