import { client, parsers } from './webauthn.min.js';

const app = new Vue({
  el: '#app',
  data: {
    username: null,
    isRegistered: false,
    isAuthenticated: false,
    isRoaming: false,
    registrationData: null,
    authenticationData: null,
  },
  methods: {
    async checkIsRegistered() {
      const response = await fetch('/api/checkIsRegistered');
      const { isRegistered } = await response.json();
      this.isRegistered = isRegistered;
    },
    async register() {
      try {
        const challenge = await this.requestChallenge();
        const registration = await client.register(this.username, challenge, {
          authenticatorType: 'platform',
          userVerification: 'required',
          timeout: 60000,
          attestation: 'none',
          debug: false,
        });

        const registrationData = await this.verifyRegistration(registration);

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            registrationData,
          }),
        });

        if (response.ok) {
          this.isRegistered = true;
          this.isAuthenticated = true;
        } else {
          console.error('Registration failed:', response.statusText);
        }
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
    async verifyRegistration(registration) {
      const response = await fetch('/api/verifyRegistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration,
        }),
      });

      if (response.ok) {
        return response.json();
      } else {
        console.error('Registration verification failed:', response.statusText);
        throw new Error('Registration verification failed');
      }
    },
    async requestChallenge() {
      const response = await fetch('/api/getChallenge');
      const { challenge } = await response.json();
      return challenge;
    },
    async login() {
      try {
        const challenge = await this.requestChallenge();
        const authentication = await client.authenticate([], challenge, {
          authenticatorType: 'platform',
          userVerification: 'required',
          timeout: 60000,
          debug: false,
        });

        const authenticationData = await this.verifyAuthentication(authentication);

        const response = await fetch('/api/verifyAuthentication', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authenticationData,
          }),
        });

        if (response.ok) {
          this.isAuthenticated = true;
        } else {
          console.error('Authentication failed:', response.statusText);
          this.isAuthenticated = false;
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        this.isAuthenticated = false;
      }
    },
    async verifyAuthentication(authentication) {
      const response = await fetch('/api/verifyAuthentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authentication,
        }),
      });

      if (response.ok) {
        return response.json();
      } else {
        console.error('Authentication verification failed:', response.statusText);
        throw new Error('Authentication verification failed');
      }
    },
    async logout() {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        this.isAuthenticated = false;
      } else {
        console.error('Logout failed:', response.statusText);
      }
    },
  },
  async mounted() {
    await this.checkIsRegistered();
  },
});
