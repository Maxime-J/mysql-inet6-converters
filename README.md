# mysql-inet6-converters
ES module to convert IPv4 and IPv6 addresses like MySQL does with its INET6_ATON and INET6_NTOA functions.

- Validated with the same test cases used in MySQL
- Zero dependencies
- Browser compatible

## Install
```
npm install mysql-inet6-converters
```
## Documentation

Two functions are exported:\
`inet6_aton` ensures the conversion from a string to a binary representation, in the form of a bytes array (Uint8Array)\
`inet6_ntoa` ensures the opposite conversion, from Uint8Array to string.

Both returns `undefined` if the input isn't a valid address.

IPv4 and IPv6 are respectively always represented with 4 and 16 bytes in their binary forms.

### Example
```js
import { inet6_aton, inet6_ntoa } from 'mysql-inet6-converters';

const ip4Bytes = inet6_aton('192.168.1.20'); // Uint8Array(4) [192, 168, 1, 20]
const ip6Bytes = inet6_aton('fdfe::5a55:caff:fefa:9089'); // Uint8Array(16) [253, 254, 0, 0, 0, 0, 0, 0, 90, 85, 202, 255, 254, 250, 144, 137]

const ip4String = inet6_ntoa(ip4Bytes); // '192.168.1.20'
```

### Debug version
While the main version doesn't log anything,\
a debug version is available to have some details about eventual conversion failures, logged with `console.error`
```js
import { inet6_aton } from 'mysql-inet6-converters/debug';

const ip4Bytes = inet6_aton('292.168.1.20'); // undefined
/*
* Console output :
* inet6_aton [IPv4](292.168.1.20): Invalid byte value
* inet6_aton [IPv6](292.168.1.20): Too few groups
*/
```
Note that a string is sequentially processed until an eventual success by the IPv4 and IPv6 converters, an IPv6 converter which can possibly call the IPv4 one. This would help to clearly understand the logs.

## Format constraints
This stricly follows the MySQL functions, which means it has the same constraints:

- A trailing zone ID is not permitted, as in fe80::3%1 or fe80::3%eth0.
- A trailing network mask is not permitted, as in 2001:45f:3:ba::/64 or 198.51.100.0/24.

For IPv4 addresses, and IPv6 addresses that have IPv4 address parts, such as IPv4-compatible or IPv4-mapped addresses:

- Classful addresses such as 198.51.1 are rejected.
- A trailing port number is not permitted, as in 198.51.100.2:8080.
- Hexadecimal numbers in address components are not permitted, as in 198.0xa0.1.2.
- Octal numbers are not supported: 198.51.010.1 is treated as 198.51.10.1, not 198.51.8.1.
