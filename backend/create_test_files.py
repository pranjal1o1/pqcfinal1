"""
Create test files with cryptographic code for scanning
Run: python create_test_files.py
"""

import os
from pathlib import Path

# Create test_files directory
TEST_DIR = Path("test_files")
TEST_DIR.mkdir(exist_ok=True)

# Test files with different crypto algorithms
TEST_FILES = {
    "rsa_weak.py": """
# Weak RSA implementation
import rsa
from Crypto.PublicKey import RSA

# Generate weak RSA-1024 key (deprecated)
key = rsa.generate_private_key(1024)

# Another weak key
rsa_key = RSA.generate(1024)

print("Generated weak RSA keys")
""",
    
    "rsa_standard.py": """
# Standard RSA-2048 implementation
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

# Generate RSA-2048 key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)

print("Generated RSA-2048 key")
""",
    
    "ecc_example.py": """
# Elliptic Curve Cryptography
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend

# Generate ECC key using secp256r1 curve
private_key = ec.generate_private_key(
    ec.SECP256R1(),
    default_backend()
)

# ECDSA signature
from cryptography.hazmat.primitives import hashes

signature = private_key.sign(
    b"message",
    ec.ECDSA(hashes.SHA256())
)

print("ECC/ECDSA implementation")
""",
    
    "dh_example.py": """
# Diffie-Hellman Key Exchange
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.backends import default_backend

# Generate DH parameters
parameters = dh.generate_parameters(
    generator=2,
    key_size=2048,
    backend=default_backend()
)

# Generate private key
private_key = parameters.generate_private_key()

print("DH key exchange setup")
""",
    
    "aes_encryption.py": """
# AES Encryption
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# AES-256 encryption (quantum-resistant)
key = get_random_bytes(32)  # 256 bits
cipher = AES.new(key, AES.MODE_GCM)

data = b"Secret message"
ciphertext, tag = cipher.encrypt_and_digest(data)

# AES-128 (weaker)
key128 = get_random_bytes(16)
cipher128 = AES.new(key128, AES.MODE_CBC)

print("AES encryption examples")
""",
    
    "weak_hashing.py": """
# Weak hashing algorithms (deprecated)
import hashlib

# MD5 (broken)
hash_md5 = hashlib.md5()
hash_md5.update(b"password123")

# SHA-1 (deprecated)
hash_sha1 = hashlib.sha1()
hash_sha1.update(b"password123")

# Better: SHA-256
hash_sha256 = hashlib.sha256()
hash_sha256.update(b"password123")

print("Hash examples")
""",
    
    "mixed_crypto.js": """
// Mixed cryptography in JavaScript
const crypto = require('crypto');

// RSA key generation
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// AES-256-CBC encryption
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv(algorithm, key, iv);

// ECDSA signing
const sign = crypto.createSign('SHA256');
sign.update('message');
sign.end();

// DH key exchange
const alice = crypto.createDiffieHellman(2048);
const aliceKeys = alice.generateKeys();

console.log('Mixed crypto operations');
""",
    
    "java_crypto.java": """
// Java Cryptography
import java.security.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public class CryptoExample {
    public static void main(String[] args) throws Exception {
        // RSA key pair
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair pair = keyGen.generateKeyPair();
        
        // AES encryption
        KeyGenerator aesGen = KeyGenerator.getInstance("AES");
        aesGen.init(256);
        SecretKey aesKey = aesGen.generateKey();
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, aesKey);
        
        System.out.println("Java crypto initialized");
    }
}
""",
    
    "payment_auth.py": """
# Payment system with crypto (HIGH RISK)
import rsa
from Crypto.Cipher import AES
import hashlib

class PaymentProcessor:
    def __init__(self):
        # RSA-2048 for payment signatures
        self.rsa_key = rsa.generate_private_key(2048)
        
        # AES-256 for encrypting card data
        self.aes_key = get_random_bytes(32)
    
    def process_payment(self, card_number, amount):
        # Hash card number (using SHA-256)
        card_hash = hashlib.sha256(card_number.encode()).hexdigest()
        
        # Sign transaction with RSA
        signature = self.rsa_key.sign(f"{card_hash}:{amount}".encode())
        
        # Encrypt sensitive data
        cipher = AES.new(self.aes_key, AES.MODE_GCM)
        encrypted_data = cipher.encrypt(card_number.encode())
        
        return signature, encrypted_data

# This is a CRITICAL system - quantum vulnerability = HIGH RISK
processor = PaymentProcessor()
""",
}

# Create all test files
print("Creating test files...")
print("=" * 60)

for filename, content in TEST_FILES.items():
    filepath = TEST_DIR / filename
    with open(filepath, 'w') as f:
        f.write(content.strip())
    print(f"✅ Created: {filepath}")

print("=" * 60)
print(f"\n✅ Created {len(TEST_FILES)} test files in {TEST_DIR}/")
print("\nTest the scanner:")
print(f"  curl -X POST 'http://localhost:8000/api/scan/upload' \\")
print(f"    -F 'file=@{TEST_DIR}/rsa_weak.py'")
print("\nOr create a ZIP and upload:")
print(f"  cd {TEST_DIR} && zip -r ../test_code.zip . && cd ..")
print(f"  curl -X POST 'http://localhost:8000/api/scan/upload' \\")
print(f"    -F 'file=@test_code.zip'")