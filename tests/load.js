import http from 'k6/http';
import { check, sleep } from 'k6';
import { generatePodPayload } from './payload.js';

export const options = {
    insecureSkipTLSVerify: true,
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<10'],
        http_req_failed: ['rate<0.01'],
    },
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

    sleep(0.1);
}
