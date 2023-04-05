import { Router } from '@vaadin/router';

window.addEventListener("DOMContentLoaded", () => {
    const router = new Router(document.querySelector('.root'));
    router.setRoutes([
        { path: '/', redirect: '/login' },
        { path: '/login', component: 'login-page' },
        { path: '/home', component: 'home-page' },
        { path: '/wait-room', component: 'wait-room-page' },
        { path: '/play', component: 'play-page' },
        { path: '/game', component: 'game-page' },
        { path: '/result', component: 'results-page' },
    ]);
})