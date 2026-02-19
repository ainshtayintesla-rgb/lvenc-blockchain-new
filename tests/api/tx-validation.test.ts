import crypto from 'crypto';
import { describe, it, expect } from 'vitest';
import * as ed from '@noble/ed25519';
import {
    validateTxStructure,
    validateTxType,
    checkDuplicate,
    validateNonce,
    verifyEd25519Signature,
} from '../../src/node/api/middleware/tx-validation';
import { chainParams } from '../../src/protocol/params/chain';
import { sha256 } from '../../src/protocol/utils/crypto';
import { nonceManager } from '../../src/protocol/security/nonce-manager';

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

describe('API tx-validation contract', () => {
    it('accepts a valid staking tx payload shape', () => {
        const result = validateTxStructure({
            address: 'tLVE_test_addr',
            amount: 100,
            signature: 'a'.repeat(128),
            publicKey: 'b'.repeat(64),
            nonce: 0,
            chainId: chainParams.chainId,
            signatureScheme: 'ed25519',
        });

        expect(result.valid).toBe(true);
    });

    it('rejects missing chainId', () => {
        const result = validateTxStructure({
            address: 'tLVE_test_addr',
            amount: 100,
            signature: 'a'.repeat(128),
            publicKey: 'b'.repeat(64),
            nonce: 0,
            signatureScheme: 'ed25519',
        });

        expect(result.valid).toBe(false);
        expect(result.code).toBe('MISSING_CHAIN_ID');
    });

    it('rejects wrong signature scheme', () => {
        const result = validateTxStructure({
            address: 'tLVE_test_addr',
            amount: 100,
            signature: 'a'.repeat(128),
            publicKey: 'b'.repeat(64),
            nonce: 0,
            chainId: chainParams.chainId,
            signatureScheme: 'secp256k1',
        });

        expect(result.valid).toBe(false);
        expect(result.code).toBe('INVALID_SCHEME');
    });

    it('rejects wrong chainId', () => {
        const result = validateTxStructure({
            address: 'tLVE_test_addr',
            amount: 100,
            signature: 'a'.repeat(128),
            publicKey: 'b'.repeat(64),
            nonce: 0,
            chainId: 'invalid-chain',
            signatureScheme: 'ed25519',
        });

        expect(result.valid).toBe(false);
        expect(result.code).toBe('WRONG_CHAIN_ID');
    });

    it('accepts only known tx types', () => {
        expect(validateTxType('STAKE').valid).toBe(true);
        expect(validateTxType('UNKNOWN').valid).toBe(false);
    });

    it('rejects duplicate tx hash', () => {
        const hash = sha256(`dup-${Date.now()}-${Math.random()}`);
        const first = checkDuplicate(hash);
        const second = checkDuplicate(hash);

        expect(first.valid).toBe(true);
        expect(second.valid).toBe(false);
        expect(second.code).toBe('DUPLICATE_TX');
    });

    it('enforces nonce progression per address', () => {
        const address = `tLVE_nonce_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

        const first = validateNonce(address, 0);
        expect(first.valid).toBe(true);

        nonceManager.confirmNonce(address, 0);

        const stale = validateNonce(address, 0);
        expect(stale.valid).toBe(false);
        expect(stale.code).toBe('STALE_NONCE');

        const next = validateNonce(address, 1);
        expect(next.valid).toBe(true);
    });

    it('verifies valid ed25519 signature and rejects invalid one', async () => {
        const privateKey = crypto.randomBytes(32);
        const publicKey = await ed.getPublicKeyAsync(privateKey);
        const canonicalHash = sha256('tx-validation-contract');
        const signature = await ed.signAsync(hexToBytes(canonicalHash), privateKey);

        const valid = await verifyEd25519Signature(
            Buffer.from(signature).toString('hex'),
            Buffer.from(publicKey).toString('hex'),
            canonicalHash
        );
        expect(valid.valid).toBe(true);

        const invalidSigHex = `00${Buffer.from(signature).toString('hex').slice(2)}`;
        const invalid = await verifyEd25519Signature(
            invalidSigHex,
            Buffer.from(publicKey).toString('hex'),
            canonicalHash
        );
        expect(invalid.valid).toBe(false);
        expect(invalid.code).toBe('INVALID_SIGNATURE');
    });
});
