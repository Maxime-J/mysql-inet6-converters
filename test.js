import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { inet6_aton, inet6_ntoa } from './dist/inet6.js';

const hex = (bytesArray) => Buffer.from(bytesArray).toString('hex');
const unhex = (string) => Uint8Array.from(Buffer.from(string, 'hex'));
const binary = (string) => Uint8Array.from(Buffer.from(string, 'utf8'));

describe('IPv6-capable INET_ATON and INET_NTOA functions', function () {
  it('inet6_aton: checking invalid values', function () {
    assert.equal(inet6_aton(null), undefined);
    assert.equal(inet6_aton(123), undefined);
    assert.equal(inet6_aton(123.45), undefined);
    assert.equal(inet6_aton('2014-02-28 09:00:00'), undefined);

    assert.equal(inet6_aton('1.2.3'), undefined);
    assert.equal(inet6_aton('1.2.3.'), undefined);
    assert.equal(inet6_aton('1..3.4'), undefined);
    assert.equal(inet6_aton('-1.2.3.4'), undefined);
    assert.equal(inet6_aton('1.2.3.256'), undefined);
    assert.equal(inet6_aton('1.2.3.4.5'), undefined);
    assert.equal(inet6_aton('0001.2.3.4'), undefined);
    assert.equal(inet6_aton('0x1.2.3.4'), undefined);
    assert.equal(inet6_aton('a.2.3.4'), undefined);

    assert.equal(inet6_aton('1.2.3.4:80'), undefined);
    assert.equal(inet6_aton('1.2.3.4/32'), undefined);

    assert.equal(inet6_aton('mysql.com'), undefined);

    assert.equal(inet6_aton(':::'), undefined);
    assert.equal(inet6_aton(':1:2:3'), undefined);
    assert.equal(inet6_aton('1:2:3:'), undefined);
    assert.equal(inet6_aton(':1::2:3'), undefined);
    assert.equal(inet6_aton('1::2:3:'), undefined);
    assert.equal(inet6_aton('::00001'), undefined);
    assert.equal(inet6_aton('::00001:2'), undefined);
    assert.equal(inet6_aton('::12345'), undefined);
    assert.equal(inet6_aton('1020::3040::5060'), undefined);
    assert.equal(inet6_aton('::ABCZ'), undefined);

    assert.equal(inet6_aton('::0x1.2.3.4'), undefined);
    assert.equal(inet6_aton('::1.0x2.3.4'), undefined);
    assert.equal(inet6_aton('::a.b.c.d'), undefined);

    assert.equal(inet6_aton('::FFFF:0x1.2.3.4'), undefined);
    assert.equal(inet6_aton('::FFFF:1.0x2.3.4'), undefined);
    assert.equal(inet6_aton('::FFFF:a.b.c.d'), undefined);

    assert.equal(inet6_aton('::1.2.3.4:ABCD'), undefined);
  });

  it('inet6_aton: checking specific address support', function () {
    assert.equal(hex(inet6_aton('::ABCD:1.2.3.4')), '00000000000000000000abcd01020304');
  });

  it('inet6_aton: checking binary representation', function () {
    assert.equal(hex(inet6_aton('0.0.0.0')), '00000000');
    assert.equal(hex(inet6_aton('00.00.00.00')), '00000000');
    assert.equal(hex(inet6_aton('000.000.000.000')), '00000000');
    assert.equal(hex(inet6_aton('1.2.3.4')), '01020304');
    assert.equal(hex(inet6_aton('01.02.03.04')), '01020304');
    assert.equal(hex(inet6_aton('001.002.003.004')), '01020304');
    assert.equal(hex(inet6_aton('255.255.255.255')), 'ffffffff');
    assert.equal(hex(inet6_aton('::')), '00000000000000000000000000000000');
    assert.equal(hex(inet6_aton('0::0')), '00000000000000000000000000000000');
    assert.equal(hex(inet6_aton('1::2')), '00010000000000000000000000000002');
    assert.equal(hex(inet6_aton('0::')), '00000000000000000000000000000000');
    assert.equal(hex(inet6_aton('1::')), '00010000000000000000000000000000');
    assert.equal(hex(inet6_aton('::0')), '00000000000000000000000000000000');
    assert.equal(hex(inet6_aton('::1')), '00000000000000000000000000000001');
    assert.equal(hex(inet6_aton('1:2:3:4:5:6:7:8')), '00010002000300040005000600070008');
    assert.equal(hex(inet6_aton('::2:3:4:5:6:7:8')), '00000002000300040005000600070008');
    assert.equal(hex(inet6_aton('1::3:4:5:6:7:8')), '00010000000300040005000600070008');
    assert.equal(hex(inet6_aton('1:2::4:5:6:7:8')), '00010002000000040005000600070008');
    assert.equal(hex(inet6_aton('1:2:3::5:6:7:8')), '00010002000300000005000600070008');
    assert.equal(hex(inet6_aton('1:2:3:4::6:7:8')), '00010002000300040000000600070008');
    assert.equal(hex(inet6_aton('1:2:3:4:5::7:8')), '00010002000300040005000000070008');
    assert.equal(hex(inet6_aton('1:2:3:4:5:6::8')), '00010002000300040005000600000008');
    assert.equal(hex(inet6_aton('1:2:3:4:5:6:7::')), '00010002000300040005000600070000');
    assert.equal(hex(inet6_aton('0000:0000::0000:0001')), '00000000000000000000000000000001');
    assert.equal(hex(inet6_aton('1234:5678:9abc:def0:4321:8765:cba9:0fed')), '123456789abcdef043218765cba90fed');
    assert.equal(hex(inet6_aton('0000:0000:0000:0000:0000:0000:0000:0001')), '00000000000000000000000000000001');
    assert.equal(hex(inet6_aton('::C0A8:0102')), '000000000000000000000000c0a80102');
    assert.equal(hex(inet6_aton('::c0a8:0102')), '000000000000000000000000c0a80102');
    assert.equal(hex(inet6_aton('::192.168.1.2')), '000000000000000000000000c0a80102');
    assert.equal(hex(inet6_aton('::FfFf:C0a8:0102')), '00000000000000000000ffffc0a80102');
    assert.equal(hex(inet6_aton('::ffff:c0a8:0102')), '00000000000000000000ffffc0a80102');
    assert.equal(hex(inet6_aton('::ffff:192.168.1.2')), '00000000000000000000ffffc0a80102');
    assert.equal(hex(inet6_aton('::01.2.3.4')), '00000000000000000000000001020304');
    assert.equal(hex(inet6_aton('::1.02.3.4')), '00000000000000000000000001020304');
    assert.equal(hex(inet6_aton('::1.2.03.4')), '00000000000000000000000001020304');
    assert.equal(hex(inet6_aton('::1.2.3.04')), '00000000000000000000000001020304');
    assert.equal(hex(inet6_aton('::1.2.3.00')), '00000000000000000000000001020300');
    assert.equal(hex(inet6_aton('::FFFF:01.2.3.4')), '00000000000000000000ffff01020304');
    assert.equal(hex(inet6_aton('::FFFF:1.02.3.4')), '00000000000000000000ffff01020304');
    assert.equal(hex(inet6_aton('::FFFF:1.2.03.4')), '00000000000000000000ffff01020304');
    assert.equal(hex(inet6_aton('::FFFF:1.2.3.04')), '00000000000000000000ffff01020304');
    assert.equal(hex(inet6_aton('::FFFF:1.2.3.00')), '00000000000000000000ffff01020300');
  });

  it('inet6_aton: checking the length is either 4 or 16', function () {
    assert.equal(inet6_aton('0.0.0.0').length, 4);
    assert.equal(inet6_aton('255.255.255.255').length, 4);
    assert.equal(inet6_aton('::').length, 16);
    assert.equal(inet6_aton('1020:3040:5060:7080:90A0:B0C0:D0E0:F010').length, 16);
  });

  it('inet6_ntoa: checking invalid values', function () {
    assert.equal(inet6_ntoa(null), undefined);
    assert.equal(inet6_ntoa(123), undefined);
    assert.equal(inet6_ntoa(123.456), undefined);
    assert.equal(inet6_ntoa('2014-02-28 09:00:00'), undefined);
    assert.equal(inet6_ntoa(unhex('C0A801')), undefined);       // 3 bytes -> undefined
    assert.equal(inet6_ntoa(unhex('C0A80102')), '192.168.1.2'); // 4 bytes -> 192.168.1.2
    assert.equal(inet6_ntoa(unhex('C0A8010203')), undefined);   // 5 bytes -> undefined
    assert.equal(inet6_ntoa(unhex('0102030405060708090A0B0C0D0E0F')), undefined);                           // 15 bytes -> undefined
    assert.equal(inet6_ntoa(unhex('0102030405060708090A0B0C0D0E0F10')), '102:304:506:708:90a:b0c:d0e:f10'); // 16 bytes -> IP
    assert.equal(inet6_ntoa(unhex('0102030405060708090A0B0C0D0E0F1011')), undefined);                       // 17 bytes -> undefined

    assert.equal(inet6_aton('1234'), undefined);
    assert.equal(inet6_ntoa(binary('1234')), '49.50.51.52');
    assert.equal(inet6_aton('0123456789abcdef'), undefined);
    assert.equal(inet6_ntoa(binary('0123456789abcdef')), '3031:3233:3435:3637:3839:6162:6364:6566');
  });

  it('Checking double-conversion', function () {
    assert.equal(inet6_ntoa(inet6_aton('::')), '::');
    assert.equal(inet6_ntoa(inet6_aton('0::0')), '::');
    assert.equal(inet6_ntoa(inet6_aton('1::2')), '1::2');
    assert.equal(inet6_ntoa(inet6_aton('0::')), '::');
    assert.equal(inet6_ntoa(inet6_aton('1::')), '1::');
    assert.equal(inet6_ntoa(inet6_aton('::0')), '::');
    assert.equal(inet6_ntoa(inet6_aton('::1')), '::1');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3:4:5:6:7:8')), '1:2:3:4:5:6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('::2:3:4:5:6:7:8')), '::2:3:4:5:6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('1::3:4:5:6:7:8')), '1::3:4:5:6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('1:2::4:5:6:7:8')), '1:2::4:5:6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3::5:6:7:8')), '1:2:3::5:6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3:4::6:7:8')), '1:2:3:4::6:7:8');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3:4:5::7:8')), '1:2:3:4:5::7:8');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3:4:5:6::8')), '1:2:3:4:5:6::8');
    assert.equal(inet6_ntoa(inet6_aton('1:2:3:4:5:6:7::')), '1:2:3:4:5:6:7::');
    assert.equal(inet6_ntoa(inet6_aton('0000:0000::0000:0001')), '::1');
    assert.equal(inet6_ntoa(inet6_aton('1234:5678:9abc:def0:4321:8765:cba9:0fed')), '1234:5678:9abc:def0:4321:8765:cba9:fed');
    assert.equal(inet6_ntoa(inet6_aton('0000:0000:0000:0000:0000:0000:0000:0001')), '::1');
    assert.equal(inet6_ntoa(inet6_aton('::C0A8:0102')), '::192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::c0a8:0102')), '::192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::192.168.1.2')), '::192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::FfFf:C0a8:0102')), '::ffff:192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::ffff:c0a8:0102')), '::ffff:192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::ffff:192.168.1.2')), '::ffff:192.168.1.2');
    assert.equal(inet6_ntoa(inet6_aton('::01.2.3.4')), '::1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::1.02.3.4')), '::1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::1.2.03.4')), '::1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::1.2.3.04')), '::1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::1.2.3.00')), '::1.2.3.0');
    assert.equal(inet6_ntoa(inet6_aton('::FFFF:01.2.3.4')), '::ffff:1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::FFFF:1.02.3.4')), '::ffff:1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::FFFF:1.2.03.4')), '::ffff:1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::FFFF:1.2.3.04')), '::ffff:1.2.3.4');
    assert.equal(inet6_ntoa(inet6_aton('::FFFF:1.2.3.00')), '::ffff:1.2.3.0');
  });
});
