import { KhqrProvider } from './khqr.provider';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';

describe('KhqrProvider', () => {
  let provider: KhqrProvider;

  beforeEach(() => {
    const cs = { get: jest.fn().mockReturnValue('123456789012345') } as unknown as ConfigService;
    const queue = { add: jest.fn().mockResolvedValue(null) };
    provider = new KhqrProvider(cs, queue as any);
  });

  describe('crc16', () => {
    it('produces a 4-char hex string', () => {
      const result = provider.crc16('000201');
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it('is deterministic', () => {
      const a = provider.crc16('test-payload');
      const b = provider.crc16('test-payload');
      expect(a).toBe(b);
    });

    it('differs for different inputs', () => {
      expect(provider.crc16('aaa')).not.toBe(provider.crc16('bbb'));
    });
  });

  describe('buildQrString', () => {
    it('ends with a 4-char CRC16 checksum', () => {
      const qr = provider.buildQrString('123456789012345', 1499, 'TP-123456');
      expect(qr.length).toBeGreaterThan(20);
      // Last 4 chars should be a valid hex CRC
      expect(qr.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
    });

    it('encodes different amounts as different strings', () => {
      const a = provider.buildQrString('123456789012345', 1499, 'TP-1');
      const b = provider.buildQrString('123456789012345', 2999, 'TP-1');
      expect(a).not.toBe(b);
    });
  });
});
