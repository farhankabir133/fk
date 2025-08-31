
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/fk/', // Use your repo name if deploying to farhankabir133.github.io/fk
});




//import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//export default defineConfig({
  //plugins: [react()],
  //optimizeDeps: {
    //exclude: ['lucide-react'],
  },
  //server: {
    //proxy: {
      //'/api': {
        //target: 'http://localhost:5001',
        //changeOrigin: true,
    //  },
    },
  },
});
