/* global localStorage, withdrawThreshold, referralAddress, window */
const Vue = require('vue/dist/vue.common');
const axios = require('axios');
const Engine = require('./engine');
const socket = require('./socket');

const App = require('./components/App.vue');

const app = new Vue({
	el: '#app',
	components: {
		App
	},
	render: createElement => createElement('app')
});
