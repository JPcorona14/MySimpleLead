import plugin from '@sveltejs/adapter-auto';
// import plugin from 'amplify-adapter';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				main: '#2C3E50',
				secondary: '#E9E9E9',
				select: '#3C546D',
				bad: '#BC223A',
				good: '#F7A072'
			}
		}
	},
	plugins: []
};
