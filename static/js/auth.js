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
      //console.log(this.username + ' => ' + !!window.localStorage.getItem(this.username))
      this.isRegistered = !!window.localStorage.getItem(this.username)
      // const response = await fetch(`/api/checkIsRegistered?username=${ username }`);
      // console.log(username)
      // const { isRegistered } = await response.json();
      // this.isRegistered = isRegistered;
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

        const verifyRegistrationData = await this.verifyRegistration(registration);

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            verifyRegistrationData,
          }),
        });

        if (response.ok) {
          this.isRegistered = true;
          this.isAuthenticated = true;
          this.registrationData = verifyRegistrationData
          window.localStorage.setItem(this.username, verifyRegistrationData.credential.id)
          // window.localStorage.setItem(this.registrationData, verifyRegistrationData)

          this.$buefy.toast.open({
            message: 'Registered!',
            type: 'is-success'
          })
        } else {
          console.error('Registration failed:', response.statusText);
          this.$buefy.toast.open({
            message: 'Registered failed',
            type: 'is-danger'
          })
        }
      } catch (error) {
        console.error('Registration failed:', error);
        this.$buefy.toast.open({
          message: 'Registered failed',
          type: 'is-danger'
        })
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
        this.isRegistered = true;
        this.isAuthenticated = true;
        this.$buefy.toast.open({
          message: 'Registered verification failed',
          type: 'is-danger'
        })
        return response.json();
      } else {
        console.error('Registration verification failed:', response.statusText);
        this.$buefy.toast.open({
          message: 'Registered verification failed',
          type: 'is-danger'
        })
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

        // Send the authentication data to the server for verification
        const response = await fetch('/api/verifyAuthentication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authentication }),
        });

        if (response.ok) {
          // Authentication successful
          console.log('Authentication successful');
          this.isAuthenticated = true;
          this.authenticationData = authentication
          this.$buefy.toast.open({
            message: 'Signed In!',
            type: 'is-success'
          })
          // window.localStorage.setItem(this.authenticationData, authentication)
        } else {
          // Authentication failed
          console.error('Authentication failed');
          this.$buefy.toast.open({
            message: 'Signin failed',
            type: 'is-danger'
          })
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        this.$buefy.toast.open({
          message: 'signin failed',
          type: 'is-danger'
        })
      }
    },

    async logout() {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        this.isAuthenticated = false;
        this.authenticationData = null
        this.registrationData = null
      } else {
        console.error('Logout failed:', response.statusText);
      }
    },
  },
  async mounted() {
    this.isRegistered = !!window.localStorage.getItem(this.username)

    await this.checkIsRegistered();
  },
});
