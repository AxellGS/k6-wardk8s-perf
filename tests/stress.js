import http from 'k6/http';
import { check, sleep } from 'k6';
import { generatePodPayload } from './payload.js';

export const options = {
    insecureSkipTLSVerify: true,
    stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 0 },
    ],
};

const BASE_URL = __ENV.TARGET_ENV === 'docker'
    ? 'https://host.docker.internal:9443/validate-pod'
    : (__ENV.TARGET_ENV === 'local'
        ? 'https://localhost:9443/validate-pod'
        : 'https://wardk8s-webhook.wardk8s-system.svc:443/validate-pod');

export default function () {
    const payload = generatePodPayload(__VU, __ITER);

    const res = http.post(BASE_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(0.01);
}
