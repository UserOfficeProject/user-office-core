//import fs from 'fs';

//import { mockServerClient } from 'mockserver-client';

//import { logger } from '@user-office-software/duo-logger';
// import { start_mockserver, stop_mockserver } from 'mockserver-node';
//fs.writeFileSync('/tmp/outside.txt', 'Testing mockserver file outside');
async function mockserver() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  var mockServer = require('mockserver-client');
  mockServerClient = mockServer.mockServerClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  var fs = require('fs');
  const isTestingMode = false;
  // await stop_mockserver({
  //   serverPort: 1080,
  // }).then(logger.logInfo('server stopped', {}));
  // logger.logInfo('About to start mockserver');
  console.log('mockserver file');
  //fs.writeFileSync('/tmp/testing.txt', 'Testing mockserver file');
  // await start_mockserver({
  //   serverPort: 1080,
  //   //verbose: true,
  //   trace: true,
  // }).then(logger.logInfo('server running', {}));
  //logger.logInfo('MockServer File testing');

  if (isTestingMode === true) {
    //logger.logInfo('MockServer File testing, should not');
    await mockServerClient('172.17.0.1', 1080)
      .mockAnyResponse({
        httpRequest: {
          path: '/ws/UserOfficeWebService',
        },
        // times: {
        //   unlimited: true,
        // },
        // timeToLive: {
        //   unlimited: true,
        // },
        httpOverrideForwardedRequest: {
          httpRequest: {
            path: '/ws/UserOfficeWebService',
            headers: {
              Host: ['devapis.facilities.rl.ac.uk'],
            },
          },
        },
      })
      .then(
        function () {
          //logger.logInfo('expectation created, mockserver!', {});
          console.log('expectation created');
        },
        function (error) {
          //logger.logInfo('error, catch block', error);
          console.log(error);
        }
      );
  }
  if (isTestingMode === false) {
    //logger.logInfo('MockServer File testing in if sTATEMENT');
    var callback = function (request) {
      if (request.method === 'POST') {
        //logger.logInfo('testing thsi log statement');
        const name = String(request.body.xml);
        let regexp = '<tns:(.*?)>';
        const test = name.match(regexp);
        const method = test[1];
        // logger.logInfo(
        //   'the method name is:' + name + test + 'yo ' + method,
        //   {}
        // );
        const file = JSON.parse(fs.readFileSync(method + '.txt', 'utf8'));
        //const test = JSON.parse(file);
        const request1 = file.body.xml;

        return {
          body: request1,
        };
        // if (
        //   String(request.body.xml).includes('getPersonDetailsFromSessionId')
        // ) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo ' + method,
        //     {}
        //   );
        //   const file = JSON.parse(
        //     fs.readFileSync('C: Users wdo36736 Desktop testing.txt', 'utf8')
        //   );
        //   //const test = JSON.parse(file);
        //   const request1 = file.httpResponse.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (String(request.body.xml).includes('getRolesForUser')) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo' + method,
        //     {}
        //   );
        //   const file = JSON.parse(fs.readFileSync('roles.txt', 'utf8'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (
        //   String(request.body.xml).includes(
        //     'getBasicPersonDetailsFromUserNumber'
        //   )
        // ) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo(
        //     'the method name is:' + name + test + 'yo' + method,
        //     {}
        //   );
        //   const file = JSON.parse(fs.readFileSync('userNumber.txt', 'utf8'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else if (String(request.body.xml).includes('isTokenValid')) {
        //   const name = String(request.body.xml);
        //   let regexp = '<tns:(.*?)>';
        //   const test = name.match(regexp);
        //   const method = test[1];
        //   logger.logInfo('the method name isp:' + test, {});
        //   const file = JSON.parse(fs.readFileSync('valid.txt'));
        //   //const test = JSON.parse(file);
        //   const request1 = file.body.xml;
        //   return {
        //     body: request1,
        //   };
        // } else {
        //   return {
        //     statusCode: 401,
        //   };
        // }
      }
    };
    await mockServerClient('172.17.0.1', 1080)
      .mockWithCallback(
        {
          method: 'POST',
          path: '/ws/UserOfficeWebService',
        },
        callback,
        {
          unlimited: true,
        }
      )
      .then(
        function () {
          console.log('expectation created, callabck');
        },
        function (error) {
          //logger.logInfo('error callback', {});
        }
      );

    await mockServerClient('172.17.0.1', 1080)
      .mockAnyResponse({
        httpRequest: {
          method: 'GET',
          path: '/ws/UserOfficeWebService',
        },
        times: {
          unlimited: true,
        },
        timeToLive: {
          unlimited: true,
        },
        httpOverrideForwardedRequest: {
          httpRequest: {
            path: '/ws/UserOfficeWebService',
            headers: {
              Host: ['devapis.facilities.rl.ac.uk'],
            },
          },
        },
      })
      .then(
        function () {
          console.log('expectation created, mock any response');
        },
        function (error) {
          //logger.logInfo('error mock any response', {});
        }
      );
  }
}
mockserver();
//export { mockserver };
