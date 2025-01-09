/* TypeScript adaptation of MySQL INET6_ATON and INET6_NTOA functions.
   Copyright (c) 2025, Maxime Jeunot.
   --
   Copyright (c) 2011, 2024, Oracle and/or its affiliates.

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License, version 2.0,
   as published by the Free Software Foundation.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License, version 2.0, for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA */

interface Inet {
  str?: string,
  bytes?: Uint8Array,
}

type InetNeeds<K extends keyof Inet> = Inet & Required<Pick<Inet, K>>;

const IN_ADDR_SIZE = 4;
const IN6_ADDR_SIZE = 16;
const IN6_ADDR_NUM_WORDS = IN6_ADDR_SIZE / 2;

const HEX_DIGITS = '0123456789abcdef';

function toBytes4(ip: InetNeeds<'str'>): boolean {
  if (ip.str.length < 7 || ip.str.length > 15) {
    console.error(`IPv4 (${ip.str}): Invalid size`);
    return false;
  }

  ip.bytes = new Uint8Array(IN_ADDR_SIZE);

  let byteValue = 0;
  let charsInGroup = 0;
  let dotCount = 0;
  let c;

  for (let pos = 0; pos < ip.str.length; pos++) {
    c = ip.str[pos];
    const cNumber = +c;
    if (!isNaN(cNumber)) {
      if (++charsInGroup > 3) {
        console.error(`IPv4 (${ip.str}): Too many characters in a group`);
        return false;
      }
      byteValue = byteValue * 10 + cNumber;
      if (byteValue > 255) {
        console.error(`IPv4 (${ip.str}): Invalid byte value`);
        return false;
      }
    } else if (c === '.') {
      if (charsInGroup === 0) {
        console.error(`IPv4 (${ip.str}): Too few characters in a group`);
        return false;
      }
      ip.bytes[dotCount] = byteValue;
      byteValue = 0;
      charsInGroup = 0;
      if (++dotCount > 3) {
        console.error(`IPv4 (${ip.str}): Too many dots`);
        return false;
      }
    } else {
      console.error(`IPv4 (${ip.str}): Invalid character`);
      return false;
    }
  }

  if (c === '.') {
    console.error(`IPv4 (${ip.str}): Invalid ending`);
    return false;
  }

  if (dotCount !== 3) {
    console.error(`IPv4 (${ip.str}): Too few groups`);
    return false;
  }

  ip.bytes[3] = byteValue;

  return true;
}

function toBytes6(ip: InetNeeds<'str'>): boolean {
  if (ip.str.length < 2 || ip.str.length > 8 * 4 + 7) {
    console.error(`IPv6 (${ip.str}): Invalid size`);
    return false;
  }

  ip.bytes = new Uint8Array(IN6_ADDR_SIZE);

  let pos = 0;

  if (ip.str[pos] === ':') {
    pos++;
    if (ip.str[pos] !== ':') {
      console.error(`IPv6 (${ip.str}): Can not start with :x`);
      return false;
    }
  }

  let dst = 0;
  let gap = null;
  let groupStart = pos;
  let charsInGroup = 0;
  let groupValue = 0;

  for (pos; pos < ip.str.length; pos++) {
    const c = ip.str[pos];

    if (c === ':') {
      groupStart = pos;

      if (!charsInGroup) {
        if (gap !== null) {
          console.error(`IPv6 (${ip.str}): Too many gaps(::)`);
          return false;
        }
        gap = dst;
        continue;
      }

      if (pos + 1 == ip.str.length) {
        console.error(`IPv6 (${ip.str}): Invalid ending`);
        return false;
      }

      if (dst + 2 > IN6_ADDR_SIZE) {
        console.error(`IPv6 (${ip.str}): Too many groups (1)`);
        return false;
      }

      ip.bytes[dst] = (groupValue >> 8) & 0xff;
      ip.bytes[dst+1] = groupValue & 0xff;
      dst += 2;

      charsInGroup = 0;
      groupValue = 0;
    } else if (c === '.') {
      if (dst + IN_ADDR_SIZE > IN6_ADDR_SIZE) {
        console.error(`IPv6 (${ip.str}): Unexpected IPv4-part`);
        return false;
      }
      const ip4: InetNeeds<'str'> = { str: ip.str.substring(groupStart + 1) };
      if (!toBytes4(ip4)) {
        console.error(`IPv6 (${ip.str}): Invalid IPv4-part`);
        return false;
      }
      ip.bytes.set(ip4.bytes!, dst);
      dst += IN_ADDR_SIZE;
      charsInGroup = 0;
      break;
    } else {
      const hdp = HEX_DIGITS.indexOf(c.toLowerCase());

      if (hdp === -1) {
        console.error(`IPv6 (${ip.str}): Invalid character`);
        return false;
      }

      if (charsInGroup >= 4) {
        console.error(`IPv6 (${ip.str}): Too many digits in group`);
        return false;
      }

      groupValue <<= 4;
      groupValue |= hdp;

      charsInGroup++;
    }
  }

  if (charsInGroup > 0) {
    if (dst + 2 > IN6_ADDR_SIZE) {
      console.error(`IPv6 (${ip.str}): Too many groups (2)`);
      return false;
    }
    ip.bytes[dst] = (groupValue >> 8) & 0xff;
    ip.bytes[dst+1] = groupValue & 0xff;
    dst += 2;
  }

  if (gap !== null) {
    if (dst == IN6_ADDR_SIZE) {
      console.error(`IPv6 (${ip.str}): No room for a gap (::)`);
      return false;
    }

    const bytesToMove = dst - gap;

    for (let i = 1; i <= bytesToMove; i++) {
      ip.bytes[IN6_ADDR_SIZE - i] = ip.bytes[gap + bytesToMove - i];
      ip.bytes[gap + bytesToMove - i] = 0;
    }

    dst = IN6_ADDR_SIZE;
  }

  if (dst < IN6_ADDR_SIZE) {
    console.error(`IPv6 (${ip.str}): Too few groups`);
    return false;
  }

  return true;
}

function toString4(ip: InetNeeds<'bytes'>) {
  ip.str = Array.from(ip.bytes).join('.');
}

function toString6(ip: InetNeeds<'bytes'>) {

  // 1. Translate IPv6-address bytes to words.

  const words = new Uint16Array(IN6_ADDR_NUM_WORDS);

  for (let i = 0; i < IN6_ADDR_NUM_WORDS; i++) {
    words[i] = (ip.bytes[2 * i] << 8) + ip.bytes[2 * i + 1];
  }

  // 2. Find "the gap" -- longest sequence of zeros in IPv6-address.

  const gap = { pos: -1, length: -1 };
  (() => {
    const rg = { pos: -1, length: -1 };

    for (let i = 0; i < IN6_ADDR_NUM_WORDS; i++) {
      if (words[i] != 0) {
        if (rg.pos >= 0) {
          if (rg.length > gap.length) Object.assign(gap, rg);
          rg.pos = -1;
          rg.length = -1;
        }
      } else {
        if (rg.pos >= 0) {
          rg.length++;
        } else {
          rg.pos = i;
          rg.length = 1;
        }
      }
    }

    if (rg.pos >= 0) {
      if (rg.length > gap.length) Object.assign(gap, rg);
    }
  })();

  // 3. Convert binary data to string.

  const str = [];

  for (let i = 0; i < IN6_ADDR_NUM_WORDS; i++) {
    if (i == gap.pos) {
      /*
        We're at the gap position.
        We should put trailing ':' and jump to the end of the gap.
      */

      if (i == 0) {
        /*
          The gap starts from the beginning of the data.
          Leading ':' should be put additionally.
        */

        str.push(':');
      }

      str.push(':');

      i += gap.length - 1;
    } else if ( i == 6 && gap.pos == 0 &&
                (gap.length == 6 || (gap.length == 5 && words[5] == 0xffff))
              ) {
      /*
        The data represents either IPv4-compatible or IPv4-mapped address.
        The IPv6-part (zeros or zeros + ffff) has been already put into
        the string (str). Now it's time to dump IPv4-part.
      */

      const ip4: InetNeeds<'bytes'> = { bytes: ip.bytes.slice(12) };
      toString4(ip4);
      str.push(ip4.str);
      break;
    } else {
      /*
        Usual IPv6-address-field. Print it out using lower-case
        hex-letters without leading zeros (recommended IPv6-format).
        If it is not the last field, append closing ':'.
      */

      str.push(words[i].toString(16));

      if (i != IN6_ADDR_NUM_WORDS - 1) {
        str.push(':');
      }
    }
  }

  ip.str = str.join('');
}

export function inet6_aton(str: string) {
  if (typeof str !== 'string') {
    console.error('inet6_aton: string expected.');
    return;
  }

  const ip: InetNeeds<'str'> = { str };

  if (toBytes4(ip) || toBytes6(ip)) {
    return ip.bytes;
  }
}

export function inet6_ntoa(bytes: Uint8Array) {
  if (!(bytes instanceof Uint8Array)) {
    console.error('inet6_ntoa: Uint8Array expected.');
    return;
  }

  const ip: InetNeeds<'bytes'> = { bytes };

  if (bytes.length === IN_ADDR_SIZE) {
    toString4(ip);
  } else if (bytes.length === IN6_ADDR_SIZE) {
    toString6(ip);
  } else {
    console.error('inet6_ntoa: Uint8Array(4) or Uint8Array(16) expected.');
    return;
  }

  return ip.str;
}
