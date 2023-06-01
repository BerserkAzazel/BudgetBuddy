import { client, parsers } from './webauthn.min.js';

const app = new Vue({
  el: '#app',
  data: {
    username: null,
    newusername: null,
    name: null,
    email: null,
    isRegistered: false,
    isAuthenticated: false,
    isRoaming: false,
    isNewRoaming: false,
    registrationData: null,
    authenticationData: null,
    isRegisterNewDevice: false,
    verifyOtp: null,
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
    //register new devices for existing users
    async registerNewDevice() {
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
            regsitrationData: verifyRegistrationData,
            otp: this.verifyOtp
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
          // console.error('Registration failed:', response.statusText);
          this.isAuthenticated = false;
          this.$buefy.toast.open({
            message: `Registered failed ${ response.message }`,
            type: 'is-danger'
          })
        }
      } catch (error) {
        // console.error('Registration failed:', error.message);
        this.isAuthenticated = false;

        this.$buefy.toast.open({
          message: `Registered failed ${ error.message }`,
          type: 'is-danger'
        })
      }
    },
    //register new users
    async register() {
      try {
        const challenge = await this.requestChallenge();
        const registration = await client.register(this.newusername, challenge, {
          authenticatorType: 'platform',
          userVerification: 'required',
          timeout: 60000,
          attestation: 'none',
          debug: false,
        });

        const verifyRegistrationData = await this.verifyRegistration(registration);

        const response = await fetch('/api/registernewusers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.newusername,
            name: this.name,
            email: this.email,
            regsitrationData: verifyRegistrationData,
          }),
        });

        if (response.ok) {
          this.isRegistered = true;
          this.isAuthenticated = true;
          this.registrationData = verifyRegistrationData
          window.localStorage.setItem(this.username, verifyRegistrationData.credential.id)
          this.username = this.newusername
          // window.localStorage.setItem(this.registrationData, verifyRegistrationData)

          this.$buefy.toast.open({
            message: 'Registered!',
            type: 'is-success'
          })
        } else {
          // console.error('Registration failed:', response.statusText);
          this.isAuthenticated = false;

          this.$buefy.toast.open({
            message: `Registered failed: ${ response.message }`,
            type: 'is-danger'
          })
        }
      } catch (error) {
        // console.error('Registration failed:', error);
        this.isAuthenticated = false;
        this.$buefy.toast.open({
          message: `Registered failed: ${ error.message }`,
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

        // Send the authentication data to the server for verification
        const response = await fetch('/api/verifyAuthentication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authentication }),
        });

        if (response.ok) {
          // Authentication successful
          this.isAuthenticated = true;
          this.authenticationData = authentication
          this.$buefy.toast.open({
            message: 'Signed In!',
            type: 'is-success'
          })
          // window.localStorage.setItem(this.authenticationData, authentication)
        } else {
          // Authentication failed
          // console.error(`Authentication failed: ${ response.message }`);
          this.isAuthenticated = false;

          this.$buefy.toast.open({
            message: `Authentication failed: ${ response.message }`,
            type: 'is-danger'
          })
        }
      } catch (error) {
        // console.error('Error during authentication:', error);
        this.isAuthenticated = false;

        this.$buefy.toast.open({
          message: `Authentication failed: ${ error.message }`,
          type: 'is-danger'
        })
      }
    },

    async logout() {
      this.isAuthenticated = false;
      this.authenticationData = null
      this.registrationData = null
      this.username = null
      this.newusername = null
      this.email = null
      this.name = null
      // const response = await fetch('/api/logout', { method: 'POST' });
      // if (response.ok) {

      // } else {
      //   // console.error('Logout failed:', response.statusText);
      // }
    },
  },
  async mounted() {
    await this.checkIsRegistered();
  },
});
