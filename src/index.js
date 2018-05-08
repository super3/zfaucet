const Vue = require('vue');
const App = require('./components/App.vue');

new Vue({
	el: '#app',
	components: {
		App
	},
	render: createElement => createElement('app')
});
