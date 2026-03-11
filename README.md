# LVE Chain

Актуальное руководство по запуску и управлению нодой LVE Chain.

- CLI reference: `docs/CLI.md`
- Сайт и демо: [lvenc.site](https://lvenc.site)
- Swagger Docs: [api.lvenc.site/api/docs/](https://api.lvenc.site/api/docs/)

## Быстрый старт

```bash
# Запустить ноду с ролью
lve-chain start --role rpc --network testnet

# Посмотреть identity
lve-chain identity

# Привязать reward address
lve-chain reward generate
```

---

## Команды

### `lve-chain start`

Запуск ноды с указанием роли.

```bash
lve-chain start [options]
```

| Опция | Описание | По умолчанию |
|-------|----------|--------------|
| `-r, --role <role>` | Роль ноды (`full` / `validator` / `rpc` / `light`) | - |
| `-n, --network <name>` | Сеть (`mainnet` / `testnet`) | `mainnet` |
| `-p, --port <number>` | API порт | `3001` |
| `--p2p <number>` | P2P порт | `6001` |
| `-d, --data <path>` | Папка данных | `./data` |
| `-s, --seed <url>` | Seed нода для подключения | - |
| `--no-api` | Запуск без API сервера | - |
| `-b, --bootstrap` | Режим bootstrap ноды | - |

**Роли:**

| Роль | P2P | API | Block Prod | Staking |
|------|-----|-----|------------|---------|
| `full` | ✅ | ❌ | ❌ | ❌ |
| `validator` | ✅ | ❌ | ✅ | ✅ |
| `rpc` | ✅ | ✅ | ❌ | ❌ |
| `light` | headers | ❌ | ❌ | ❌ |

**Примеры:**

```bash
# RPC нода с API
lve-chain start --role rpc --network testnet

# Full node, подключенная к seed
lve-chain start --role full --seed wss://seed1.lvenc.site

# Validator с кастомными портами
lve-chain start --role validator -p 4001 --p2p 7001
```

---

### `lve-chain identity`

Показать криптографическую identity ноды.

```bash
lve-chain identity [options]
```

| Опция | Описание |
|-------|----------|
| `-d, --data-dir <path>` | Папка данных |
| `--export` | Экспорт в JSON формате |

---

### `lve-chain reward`

Управление `reward address` для получения наград валидатора.

#### `reward show`

```bash
lve-chain reward show
```

#### `reward bind <address>`

```bash
lve-chain reward bind tLVE_your_wallet_address
```

#### `reward generate`

```bash
lve-chain reward generate
```

**Важно:** мнемоник показывается только один раз.

---

### `lve-chain status`

Показать статус работающей ноды.

```bash
lve-chain status [-p <port>]
```

---

### `lve-chain peers`

Показать подключенных пиров.

```bash
lve-chain peers [-p <port>]
```

---

## Runners

Предустановленные сценарии запуска:

```bash
# RPC node с API
./runners/rpc/start.sh

# Full node
./runners/full/start.sh

# Validator node
./runners/validator/start.sh

# Light node
./runners/light/start.sh
```

---

## Файлы данных

| Файл | Описание |
|------|----------|
| `data/<network>/identity.key` | Криптографическая identity (Ed25519) |
| `data/<network>/blocks.json` | Данные блокчейна |
| `data/<network>/staking.json` | Данные стейкинга |

**Важно:** `identity.key` содержит приватный ключ. Никогда не делитесь им.

---

## Ссылки

- Сайт и демо: [lvenc.site](https://lvenc.site)
- Swagger Docs: [api.lvenc.site/api/docs/](https://api.lvenc.site/api/docs/)
- CLI reference: [docs/CLI.md](docs/CLI.md)
- VPS Bootstrap Guide: [docs/VPS_BOOTSTRAP_GUIDE.md](docs/VPS_BOOTSTRAP_GUIDE.md)
- Wallet Guide: [docs/WALLET.md](docs/WALLET.md)
- Runners README: [runners/README.md](runners/README.md)
