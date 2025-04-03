## Image Processing System

This system processes images from a CSV file, compresses them, and stores them efficiently.
Users receive a Request ID upon submission, which they can use to track processing status.
The system supports asynchronous processing using BullMQ and MongoDB.

### Installation & Setup Guide

Create and add below variables in `.env`

```bash
DB_URL=...
```

_Note: Redis server must be available on PORT 6379_

_Using node version: v22.14.0_

```bash
npm install
```

### Create folder in /src
 - _/public/images_
 - _/public/csv_

Run the server:

```bash
npm run worker
```

```bash
npm run dev
```

### APIs

POST Upload API

```
http://localhost:3000/upload
```

form-data
|   Key  |     Value    |
|:-------|:------------:|
| file   | fileName.csv |

GET Status API

```
http://localhost:3000/status/:requestId
```
