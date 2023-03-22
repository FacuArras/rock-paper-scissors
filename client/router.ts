import { Router } from '@vaadin/router';

const router = new Router(document.querySelector('.root'));
router.setRoutes([
    { path: '/', redirect: '/login' },
    { path: '/login', component: 'login-page' },
    { path: '/home', component: 'home-page' },
]);