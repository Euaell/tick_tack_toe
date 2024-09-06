import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
	const isGhPages = process.env.GITHUB_PAGES === 'true'
	
	return {
		base: isGhPages ? '/tic_tac_toe/' : '/',
		plugins: [react()],
		resolve: {
			alias: {
				'@': '/src',
			},
		},
	}
})
