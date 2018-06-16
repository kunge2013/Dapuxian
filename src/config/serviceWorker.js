/*!
 * @author liyuelong1020@gmail.com
 * @date 2018/1/5
 * @description serverWoker
 */

let isLocalhost = !!(location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export default function () {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js').then(function (registration) {
            // updatefound is fired if service-worker.js changes.
            registration.onupdatefound = function () {
                // updatefound is also fired the very first time the SW is installed,
                // and there's no need to prompt for a reload at that point.
                // So check here to see if the page is already controlled,
                // i.e. whether there's an existing service worker.
                if (navigator.serviceWorker.controller) {
                    // The updatefound event implies that registration.installing is set
                    let installingWorker = registration.installing;

                    installingWorker.onstatechange = function () {
                        switch (installingWorker.state) {
                            case 'installed':
                                // At this point, the old content will have been purged and the
                                // fresh content will have been added to the cache.
                                // It's the perfect time to display a "New content is
                                // available; please refresh." message in the page's interface.
                                break;

                            case 'redundant':
                                throw new Error('The installing service worker became redundant.');

                            default:
                            // Ignore
                        }
                    };
                }
            };
        }).catch(function (e) {
            console.error('Error during service worker registration:', e);
        });
    }

}
