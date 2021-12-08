// META: script=/resources/testharness.js
// META: script=/resources/testharnessreport.js
// META: script=/resources/testdriver.js
// META: script=/resources/testdriver-vendor.js
// META: script=/bluetooth/resources/bluetooth-test.js
// META: script=/bluetooth/resources/bluetooth-fake-devices.js
'use strict';
const test_desc = 'Concurrent requestDevice calls in iframes work.';
const iframes = [];
for (let i = 0; i < 5; i++) {
  iframes.push(document.createElement('iframe'));
}

bluetooth_test(
  () => setUpHealthThermometerAndHeartRateDevices()
    // 1. Load the iframes.
    .then(() => {
      let promises = [];
      for (let iframe of iframes) {
        iframe.src =
          '/bluetooth/resources/health-thermometer-iframe.html';
        document.body.appendChild(iframe);
        promises.push(new Promise(
          resolve => iframe.addEventListener('load', resolve)));
      }
      return Promise.all(promises);
    })
    // 2. Request the device from the iframes.
    .then(() => new Promise(async (resolve) => {
      let numMessages = 0;
      window.onmessage =
        messageEvent => {
          assert_equals(messageEvent.data, 'Success');
          if (++numMessages === iframes.length) {
            resolve();
          }
        }

      for (let iframe of iframes) {
        await callWithTrustedClick(
          () => iframe.contentWindow.postMessage(
            { type: 'RequestDevice' }, '*'));
      }
    })),
  test_desc);
